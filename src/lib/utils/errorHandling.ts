// Error handling utilities for the dashboard application

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  lastChecked: Date;
}

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry validation errors or client errors
      if (isNonRetryableError(error)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt),
        maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError;
}

// Check if an error should not be retried
function isNonRetryableError(error: any): boolean {
  // Don't retry validation errors
  if (error?.type === 'validation') {
    return true;
  }
  
  // Don't retry client errors (4xx status codes)
  if (error?.status >= 400 && error?.status < 500) {
    return true;
  }
  
  // Don't retry specific database constraint violations
  if (error?.code === '23505' || error?.code === '23503') {
    return true;
  }
  
  return false;
}

// Network connectivity checker
export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private status: NetworkStatus = {
    isOnline: navigator.onLine,
    lastChecked: new Date()
  };
  private listeners: ((status: NetworkStatus) => void)[] = [];

  private constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private handleOnline() {
    this.updateStatus(true);
  }

  private handleOffline() {
    this.updateStatus(false);
  }

  private updateStatus(isOnline: boolean) {
    this.status = {
      isOnline,
      lastChecked: new Date()
    };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.status));
  }

  getStatus(): NetworkStatus {
    return { ...this.status };
  }

  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Test network connectivity by making a simple request
  async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      const isOnline = response.ok;
      this.updateStatus(isOnline);
      return isOnline;
    } catch {
      this.updateStatus(false);
      return false;
    }
  }
}

// Image loading utilities with fallback handling
export interface ImageLoadOptions {
  timeout?: number;
  retries?: number;
}

export function loadImageWithFallback(
  src: string,
  options: ImageLoadOptions = {}
): Promise<HTMLImageElement> {
  const { timeout = 10000, retries = 2 } = options;

  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryLoad = () => {
      const img = new Image();
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
      };

      img.onload = () => {
        cleanup();
        resolve(img);
      };

      img.onerror = () => {
        cleanup();
        attempts++;
        
        if (attempts <= retries) {
          // Retry after a short delay
          setTimeout(tryLoad, 1000 * attempts);
        } else {
          reject(new Error(`Failed to load image after ${retries + 1} attempts`));
        }
      };

      // Set timeout
      timeoutId = setTimeout(() => {
        cleanup();
        attempts++;
        
        if (attempts <= retries) {
          setTimeout(tryLoad, 1000 * attempts);
        } else {
          reject(new Error('Image load timeout'));
        }
      }, timeout);

      img.src = src;
    };

    tryLoad();
  });
}

// Debounced function utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Error message formatter for user-friendly display
export function formatErrorMessage(error: any): {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  retryable: boolean;
} {
  if (!error) {
    return {
      title: 'Unknown Error',
      message: 'An unknown error occurred',
      type: 'error',
      retryable: false
    };
  }

  // Handle ActionError format
  if (error.type) {
    switch (error.type) {
      case 'validation':
        return {
          title: 'Validation Error',
          message: error.message,
          type: 'warning',
          retryable: false
        };
      case 'network':
        return {
          title: 'Connection Error',
          message: error.message,
          type: 'warning',
          retryable: error.retryable || true
        };
      case 'database':
        return {
          title: 'Database Error',
          message: error.message,
          type: 'error',
          retryable: false
        };
      case 'not_found':
        return {
          title: 'Not Found',
          message: error.message,
          type: 'warning',
          retryable: false
        };
      case 'permission':
        return {
          title: 'Permission Denied',
          message: error.message,
          type: 'error',
          retryable: false
        };
      default:
        return {
          title: 'Error',
          message: error.message || 'An unexpected error occurred',
          type: 'error',
          retryable: error.retryable || false
        };
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      type: 'error',
      retryable: false
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      title: 'Error',
      message: error,
      type: 'error',
      retryable: false
    };
  }

  // Fallback
  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred',
    type: 'error',
    retryable: false
  };
}