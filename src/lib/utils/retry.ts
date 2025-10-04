export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = (error: Error) => {
      // Default retry logic - retry on network errors and 5xx status codes
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return true; // Network error
      }
      if (error.message.includes('500') || error.message.includes('502') || 
          error.message.includes('503') || error.message.includes('504')) {
        return true; // Server errors
      }
      return false;
    },
    onRetry,
  } = options;

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw new RetryError(
          `Operation failed after ${attempt} attempts: ${lastError.message}`,
          lastError,
          attempt
        );
      }
      
      onRetry?.(lastError, attempt);
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay * (0.5 + Math.random() * 0.5);
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError!;
}

export function createRetryableFunction<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  return (...args: T): Promise<R> => {
    return withRetry(() => fn(...args), options);
  };
}

// Specialized retry for API calls
export const retryApiCall = createRetryableFunction(
  async (url: string, init?: RequestInit) => {
    const response = await fetch(url, init);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  },
  {
    maxAttempts: 3,
    baseDelay: 1000,
    shouldRetry: (error: Error) => {
      // Retry on network errors and 5xx status codes
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return true;
      }
      if (error.message.includes('500') || error.message.includes('502') || 
          error.message.includes('503') || error.message.includes('504')) {
        return true;
      }
      return false;
    },
  }
);

// Queue for offline operations
export class OperationQueue {
  private queue: Array<{
    id: string;
    operation: () => Promise<any>;
    retryOptions?: RetryOptions;
    timestamp: number;
  }> = [];
  
  private isProcessing = false;
  private listeners: Array<(queue: typeof this.queue) => void> = [];

  add(
    id: string,
    operation: () => Promise<any>,
    retryOptions?: RetryOptions
  ): void {
    this.queue.push({
      id,
      operation,
      retryOptions,
      timestamp: Date.now(),
    });
    
    this.notifyListeners();
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  remove(id: string): void {
    this.queue = this.queue.filter(item => item.id !== id);
    this.notifyListeners();
  }

  clear(): void {
    this.queue = [];
    this.notifyListeners();
  }

  getQueue(): Array<{ id: string; timestamp: number }> {
    return this.queue.map(({ id, timestamp }) => ({ id, timestamp }));
  }

  onQueueChange(listener: (queue: typeof this.queue) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      try {
        await withRetry(item.operation, item.retryOptions);
        this.queue.shift(); // Remove successful operation
        this.notifyListeners();
      } catch (error) {
        console.error(`Failed to process queued operation ${item.id}:`, error);
        // Keep failed operation in queue for manual retry or removal
        break;
      }
    }

    this.isProcessing = false;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.queue));
  }
}

// Global operation queue instance
export const globalOperationQueue = new OperationQueue();