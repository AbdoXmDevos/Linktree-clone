import { useState, useCallback, useRef } from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  canCancel?: boolean;
}

export interface NonBlockingLoadingOptions {
  showProgress?: boolean;
  allowCancel?: boolean;
  timeout?: number;
  onTimeout?: () => void;
}

export function useNonBlockingLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const cancelRefs = useRef<Record<string, () => void>>({});

  const startLoading = useCallback((
    key: string,
    options: NonBlockingLoadingOptions & { message?: string } = {}
  ) => {
    const {
      showProgress = false,
      allowCancel = false,
      timeout,
      onTimeout,
      message = 'Loading...',
    } = options;

    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        progress: showProgress ? 0 : undefined,
        message,
        canCancel: allowCancel,
      },
    }));

    // Set timeout if specified
    if (timeout && onTimeout) {
      timeoutRefs.current[key] = setTimeout(() => {
        onTimeout();
        stopLoading(key);
      }, timeout);
    }
  }, []);

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setLoadingStates(prev => {
      const currentState = prev[key];
      if (!currentState?.isLoading) return prev;

      return {
        ...prev,
        [key]: {
          ...currentState,
          progress: Math.max(0, Math.min(100, progress)),
          message: message || currentState.message,
        },
      };
    });
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });

    // Clear timeout
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }

    // Clear cancel function
    delete cancelRefs.current[key];
  }, []);

  const setCancelFunction = useCallback((key: string, cancelFn: () => void) => {
    cancelRefs.current[key] = cancelFn;
  }, []);

  const cancelLoading = useCallback((key: string) => {
    const cancelFn = cancelRefs.current[key];
    if (cancelFn) {
      cancelFn();
    }
    stopLoading(key);
  }, [stopLoading]);

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key]?.isLoading || false;
    }
    return Object.values(loadingStates).some(state => state.isLoading);
  }, [loadingStates]);

  const getLoadingState = useCallback((key: string) => {
    return loadingStates[key] || null;
  }, [loadingStates]);

  const getAllLoadingStates = useCallback(() => {
    return loadingStates;
  }, [loadingStates]);

  return {
    startLoading,
    updateProgress,
    stopLoading,
    setCancelFunction,
    cancelLoading,
    isLoading,
    getLoadingState,
    getAllLoadingStates,
  };
}

// Higher-order component for non-blocking operations
export function withNonBlockingLoading<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  key: string,
  options: NonBlockingLoadingOptions & { message?: string } = {}
) {
  return async (...args: T): Promise<R> => {
    const { startLoading, stopLoading, updateProgress, setCancelFunction } = useNonBlockingLoading();
    
    let cancelled = false;
    const abortController = new AbortController();
    
    // Set up cancellation
    if (options.allowCancel) {
      setCancelFunction(key, () => {
        cancelled = true;
        abortController.abort();
      });
    }

    try {
      startLoading(key, options);
      
      // Simulate progress if showProgress is enabled
      let progressInterval: NodeJS.Timeout | undefined;
      if (options.showProgress) {
        let progress = 0;
        progressInterval = setInterval(() => {
          if (cancelled) return;
          progress = Math.min(progress + Math.random() * 10, 90);
          updateProgress(key, progress);
        }, 200);
      }

      const result = await operation(...args);
      
      if (progressInterval) {
        clearInterval(progressInterval);
        updateProgress(key, 100, 'Complete');
      }
      
      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return result;
    } catch (error) {
      if (cancelled) {
        throw new Error('Operation cancelled');
      }
      throw error;
    } finally {
      stopLoading(key);
    }
  };
}