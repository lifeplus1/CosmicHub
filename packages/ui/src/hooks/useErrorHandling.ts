import { useCallback, useRef, useState } from 'react';

export interface AsyncError {
  error: Error;
  retry: () => void;
  reset: () => void;
}

export interface UseAsyncErrorOptions {
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Hook for handling async errors with retry logic
 */
export function useAsyncError(options: UseAsyncErrorOptions = {}) {
  const { onError, maxRetries = 3, retryDelay = 1000 } = options;
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<number>();

  const handleError = useCallback((error: Error) => {
    setError(error);
    onError?.(error);
  }, [onError]);

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      
      // Exponential backoff delay
      const delay = retryDelay * Math.pow(2, retryCount);
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      retryTimeoutRef.current = window.setTimeout(() => {
        // The actual retry logic would be implemented by the consumer
      }, delay);
    }
  }, [retryCount, maxRetries, retryDelay]);

  const reset = useCallback(() => {
    setError(null);
    setRetryCount(0);
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const canRetry = retryCount < maxRetries;

  return {
    error,
    retry,
    reset,
    handleError,
    canRetry,
    retryCount,
  };
}

/**
 * Hook for safe async operations with error handling
 */
export interface SafeAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseSafeAsyncReturn<T> extends SafeAsyncState<T> {
  execute: (asyncFunction: () => Promise<T>) => Promise<T>;
  reset: () => void;
}

// Default generic is unknown to force consumers to specify or consciously narrow later
export function useSafeAsync<T = unknown>(): UseSafeAsyncReturn<T> {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({ ...prev, loading: false, error: err }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

/**
 * Utility for handling form errors
 */
export interface FormError {
  field?: string;
  message: string;
  code?: string;
}

export function useFormErrors() {
  const [errors, setErrors] = useState<FormError[]>([]);

  const addError = useCallback((error: FormError) => {
    setErrors(prev => [...prev, error]);
  }, []);

  const addErrors = useCallback((newErrors: FormError[]) => {
    setErrors(prev => [...prev, ...newErrors]);
  }, []);

  const removeError = useCallback((field?: string) => {
    if (field) {
      setErrors(prev => prev.filter(err => err.field !== field));
    } else {
      setErrors([]);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const getFieldError = useCallback((field: string) => {
    return errors.find(err => err.field === field);
  }, [errors]);

  const hasErrors = errors.length > 0;
  const hasFieldError = useCallback((field: string) => {
    return errors.some(err => err.field === field);
  }, [errors]);

  return {
    errors,
    addError,
    addErrors,
    removeError,
    clearErrors,
    getFieldError,
    hasErrors,
    hasFieldError,
  };
}

/**
 * Enhanced error context for logging and reporting
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export function createEnhancedError(
  message: string,
  context?: ErrorContext,
  originalError?: Error
): Error {
  const error = new Error(message);
  
  // Add context to error object
  if (context) {
    Object.assign(error, { context });
  }
  
  // Chain original error
  if (originalError) {
    Object.assign(error, { cause: originalError });
  }
  
  // Add stack trace from original error if available
  if (originalError?.stack) {
    error.stack = `${error.stack}\nCaused by: ${originalError.stack}`;
  }
  
  return error;
}

/**
 * Error classification utilities
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

export function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() ?? '';

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return ErrorType.NETWORK;
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  
  if (message.includes('unauthorized') || message.includes('authentication')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (message.includes('forbidden') || message.includes('permission')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return ErrorType.NOT_FOUND;
  }
  
  if (message.includes('server') || message.includes('500') || message.includes('503')) {
    return ErrorType.SERVER;
  }
  
  if (stack.includes('render') || stack.includes('component')) {
    return ErrorType.CLIENT;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Error retry strategies
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: ErrorType[];
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryableErrors: [ErrorType.NETWORK, ErrorType.SERVER],
};

export function shouldRetry(error: Error, config: RetryConfig = defaultRetryConfig): boolean {
  const errorType = classifyError(error);
  return config.retryableErrors.includes(errorType);
}

export function calculateDelay(
  attempt: number,
  config: RetryConfig = defaultRetryConfig
): number {
  const delay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Error recovery strategies
 */
export interface RecoveryAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export function getRecoveryActions(
  error: Error,
  _context: ErrorContext = {}
): RecoveryAction[] {
  const errorType = classifyError(error);
  const actions: RecoveryAction[] = [];

  switch (errorType) {
    case ErrorType.NETWORK:
      actions.push({
        label: 'Try Again',
        action: () => window.location.reload(),
        primary: true,
      });
      actions.push({
        label: 'Check Connection',
        action: () => {
          // Open network diagnostics or show connection status
        },
      });
      break;

    case ErrorType.AUTHENTICATION:
      actions.push({
        label: 'Sign In',
        action: () => window.location.href = '/login',
        primary: true,
      });
      break;

    case ErrorType.AUTHORIZATION:
      actions.push({
        label: 'Go Back',
        action: () => window.history.back(),
        primary: true,
      });
      break;

    case ErrorType.NOT_FOUND:
      actions.push({
        label: 'Go Home',
        action: () => window.location.href = '/',
        primary: true,
      });
      break;

    default:
      actions.push({
        label: 'Try Again',
        action: () => window.location.reload(),
        primary: true,
      });
      actions.push({
        label: 'Go Back',
        action: () => window.history.back(),
      });
  }

  return actions;
}
