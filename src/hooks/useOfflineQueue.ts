import { useState, useEffect, useCallback, useRef } from 'react';
import { notifications } from '@mantine/notifications';

export interface QueuedOperation {
  id: string;
  type: string;
  operation: () => Promise<any>;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  description: string;
}

export interface OfflineQueueState {
  isOnline: boolean;
  queuedOperations: QueuedOperation[];
  isProcessing: boolean;
  lastSyncTime: Date | null;
}

export function useOfflineQueue() {
  const [state, setState] = useState<OfflineQueueState>({
    isOnline: navigator.onLine,
    queuedOperations: [],
    isProcessing: false,
    lastSyncTime: null,
  });

  const processingRef = useRef(false);
  const notificationIdRef = useRef<string | null>(null);

  // Load queued operations from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem('offlineQueue');
    if (savedQueue) {
      try {
        const operations = JSON.parse(savedQueue);
        setState(prev => ({
          ...prev,
          queuedOperations: operations,
        }));
      } catch (error) {
        console.error('Failed to load offline queue:', error);
        localStorage.removeItem('offlineQueue');
      }
    }
  }, []);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('offlineQueue', JSON.stringify(state.queuedOperations));
  }, [state.queuedOperations]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      
      // Hide offline notification
      if (notificationIdRef.current) {
        notifications.hide(notificationIdRef.current);
        notificationIdRef.current = null;
      }

      // Show back online notification
      notifications.show({
        title: 'Back Online',
        message: 'Connection restored. Syncing pending changes...',
        color: 'green',
        autoClose: 3000,
      });

      // Process queued operations
      processQueue();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      
      // Show offline notification
      notificationIdRef.current = notifications.show({
        id: 'offline-notification',
        title: 'You\'re Offline',
        message: 'Changes will be saved and synced when you\'re back online.',
        color: 'orange',
        autoClose: false,
        withCloseButton: false,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process queued operations when back online
  const processQueue = useCallback(async () => {
    if (processingRef.current || !state.isOnline || state.queuedOperations.length === 0) {
      return;
    }

    processingRef.current = true;
    setState(prev => ({ ...prev, isProcessing: true }));

    const operations = [...state.queuedOperations];
    const successfulOperations: string[] = [];
    const failedOperations: QueuedOperation[] = [];

    for (const operation of operations) {
      try {
        await operation.operation();
        successfulOperations.push(operation.id);
        
        notifications.show({
          title: 'Synced',
          message: operation.description,
          color: 'green',
          autoClose: 2000,
        });
      } catch (error) {
        console.error(`Failed to process queued operation ${operation.id}:`, error);
        
        const updatedOperation = {
          ...operation,
          retryCount: operation.retryCount + 1,
        };

        if (updatedOperation.retryCount < updatedOperation.maxRetries) {
          failedOperations.push(updatedOperation);
        } else {
          notifications.show({
            title: 'Sync Failed',
            message: `Failed to sync: ${operation.description}`,
            color: 'red',
            autoClose: 5000,
          });
        }
      }
    }

    // Update queue with only failed operations that can be retried
    setState(prev => ({
      ...prev,
      queuedOperations: failedOperations,
      isProcessing: false,
      lastSyncTime: new Date(),
    }));

    processingRef.current = false;

    // Show summary if there were operations processed
    if (successfulOperations.length > 0) {
      notifications.show({
        title: 'Sync Complete',
        message: `${successfulOperations.length} changes synced successfully`,
        color: 'blue',
        autoClose: 3000,
      });
    }
  }, [state.isOnline, state.queuedOperations]);

  // Add operation to queue
  const queueOperation = useCallback((
    type: string,
    operation: () => Promise<any>,
    data: any,
    description: string,
    maxRetries: number = 3
  ) => {
    const queuedOp: QueuedOperation = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      operation,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries,
      description,
    };

    setState(prev => ({
      ...prev,
      queuedOperations: [...prev.queuedOperations, queuedOp],
    }));

    // Show queued notification
    notifications.show({
      title: 'Queued for Sync',
      message: description,
      color: 'blue',
      autoClose: 2000,
    });

    return queuedOp.id;
  }, []);

  // Remove operation from queue
  const removeFromQueue = useCallback((operationId: string) => {
    setState(prev => ({
      ...prev,
      queuedOperations: prev.queuedOperations.filter(op => op.id !== operationId),
    }));
  }, []);

  // Clear all queued operations
  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queuedOperations: [],
    }));
    localStorage.removeItem('offlineQueue');
  }, []);

  // Manually trigger queue processing
  const syncNow = useCallback(() => {
    if (state.isOnline) {
      processQueue();
    } else {
      notifications.show({
        title: 'Cannot Sync',
        message: 'You need to be online to sync changes.',
        color: 'orange',
      });
    }
  }, [state.isOnline, processQueue]);

  // Execute operation with offline support
  const executeWithOfflineSupport = useCallback(async <T>(
    type: string,
    operation: () => Promise<T>,
    data: any,
    description: string,
    options: {
      executeImmediately?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<T | null> => {
    const { executeImmediately = true, maxRetries = 3 } = options;

    if (state.isOnline && executeImmediately) {
      try {
        return await operation();
      } catch (error) {
        // If immediate execution fails and we're online, queue for retry
        queueOperation(type, operation, data, description, maxRetries);
        throw error;
      }
    } else {
      // Queue the operation for later execution
      queueOperation(type, operation, data, description, maxRetries);
      return null;
    }
  }, [state.isOnline, queueOperation]);

  return {
    isOnline: state.isOnline,
    queuedOperations: state.queuedOperations,
    isProcessing: state.isProcessing,
    lastSyncTime: state.lastSyncTime,
    queueOperation,
    removeFromQueue,
    clearQueue,
    syncNow,
    executeWithOfflineSupport,
  };
}

// Hook for specific offline-aware operations
export function useOfflineAwareOperations() {
  const {
    isOnline,
    queuedOperations,
    executeWithOfflineSupport,
    syncNow,
  } = useOfflineQueue();

  const createLinkOffline = useCallback(async (linkData: any) => {
    return executeWithOfflineSupport(
      'create-link',
      async () => {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linkData),
        });
        if (!response.ok) throw new Error('Failed to create link');
        return response.json();
      },
      linkData,
      `Create link: ${linkData.title}`
    );
  }, [executeWithOfflineSupport]);

  const updateLinkOffline = useCallback(async (linkId: string, updates: any) => {
    return executeWithOfflineSupport(
      'update-link',
      async () => {
        const response = await fetch(`/api/links/${linkId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!response.ok) throw new Error('Failed to update link');
        return response.json();
      },
      { linkId, updates },
      `Update link: ${updates.title || linkId}`
    );
  }, [executeWithOfflineSupport]);

  const deleteLinkOffline = useCallback(async (linkId: string, linkTitle: string) => {
    return executeWithOfflineSupport(
      'delete-link',
      async () => {
        const response = await fetch(`/api/links/${linkId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete link');
        return true;
      },
      { linkId },
      `Delete link: ${linkTitle}`
    );
  }, [executeWithOfflineSupport]);

  return {
    isOnline,
    queuedOperations,
    syncNow,
    createLinkOffline,
    updateLinkOffline,
    deleteLinkOffline,
  };
}