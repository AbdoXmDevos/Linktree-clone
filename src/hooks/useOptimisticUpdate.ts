import { useState, useCallback, useRef } from 'react';
import { notifications } from '@mantine/notifications';

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface OptimisticState<T> {
  data: T | null;
  isOptimistic: boolean;
  isPending: boolean;
  error: Error | null;
}

export function useOptimisticUpdate<T = any>() {
  const [optimisticState, setOptimisticState] = useState<OptimisticState<T>>({
    data: null,
    isOptimistic: false,
    isPending: false,
    error: null,
  });

  const rollbackTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  const performOptimisticUpdate = useCallback(
    async <R = T>(
      optimisticData: T,
      serverAction: () => Promise<R>,
      options: OptimisticUpdateOptions<R> = {}
    ): Promise<R | null> => {
      const {
        onSuccess,
        onError,
        rollbackDelay = 5000,
        retryAttempts = 3,
        retryDelay = 1000,
      } = options;

      // Clear any existing rollback timeout
      if (rollbackTimeoutRef.current) {
        clearTimeout(rollbackTimeoutRef.current);
      }

      // Apply optimistic update immediately
      setOptimisticState({
        data: optimisticData,
        isOptimistic: true,
        isPending: true,
        error: null,
      });

      const executeWithRetry = async (attempt: number = 0): Promise<R | null> => {
        try {
          const result = await serverAction();
          
          // Success - clear optimistic state
          setOptimisticState({
            data: null,
            isOptimistic: false,
            isPending: false,
            error: null,
          });
          
          retryCountRef.current = 0;
          onSuccess?.(result);
          
          return result;
        } catch (error) {
          const err = error as Error;
          
          if (attempt < retryAttempts) {
            // Retry with exponential backoff
            const delay = retryDelay * Math.pow(2, attempt);
            
            setTimeout(() => {
              executeWithRetry(attempt + 1);
            }, delay);
            
            return null;
          } else {
            // All retries failed - rollback optimistic update
            setOptimisticState({
              data: null,
              isOptimistic: false,
              isPending: false,
              error: err,
            });
            
            retryCountRef.current = 0;
            onError?.(err);
            
            // Show error notification
            notifications.show({
              title: 'Action Failed',
              message: err.message || 'Please check your connection and try again',
              color: 'red',
              autoClose: 5000,
            });
            
            return null;
          }
        }
      };

      // Set rollback timeout as fallback
      rollbackTimeoutRef.current = setTimeout(() => {
        if (optimisticState.isOptimistic) {
          setOptimisticState(prev => ({
            ...prev,
            isOptimistic: false,
            isPending: false,
            error: new Error('Operation timed out'),
          }));
        }
      }, rollbackDelay);

      return executeWithRetry();
    },
    [optimisticState.isOptimistic]
  );

  const clearOptimisticState = useCallback(() => {
    if (rollbackTimeoutRef.current) {
      clearTimeout(rollbackTimeoutRef.current);
    }
    
    setOptimisticState({
      data: null,
      isOptimistic: false,
      isPending: false,
      error: null,
    });
  }, []);

  return {
    optimisticState,
    performOptimisticUpdate,
    clearOptimisticState,
  };
}