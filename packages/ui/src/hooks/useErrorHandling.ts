import { useCallback, useRef, useState } from 'react';

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorHandlingResult {
  error: Error | null;
  handleError: (error: Error) => void;
  canRetry: boolean;
  retryCount: number;
  retry: () => void;
  reset: () => void;
}

interface UseErrorHandlingOptions {
  onError?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Hook for handling async errors with retry logic
 */
export function useErrorHandling(
  options: UseErrorHandlingOptions = {}
): ErrorHandlingResult {
  const { onError, maxRetries = 3, retryDelay = 1000 } = options;
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<number>();

  const handleError = useCallback(
    (error: Error) => {
      setError(error);
      onError?.(error);
    },
    [onError]
  );

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

export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface AsyncOperationActions {
  execute: (operation: () => Promise<unknown>) => Promise<unknown>;
  reset: () => void;
}

/**
 * Utility for handling form errors
 */
export interface FormError {
  field: string;
  message: string;
  code?: string;
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

/**
 * Error classification utilities
 */
export function classifyError(error: Error): ErrorType {
  if (
    error.message.includes('NetworkError') ||
    error.message.includes('fetch')
  ) {
    return ErrorType.NETWORK;
  }
  if (error.message.includes('401')) {
    return ErrorType.AUTHENTICATION;
  }
  if (error.message.includes('403')) {
    return ErrorType.AUTHORIZATION;
  }
  if (error.message.includes('404')) {
    return ErrorType.NOT_FOUND;
  }
  if (error.message.includes('5')) {
    return ErrorType.SERVER;
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

/**
 * Error recovery strategies
 */
export interface RecoveryAction {
  label: string;
  action: () => void;
  primary?: boolean;
}

export function getRecoveryActions(error: Error): RecoveryAction[] {
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
        action: () => (window.location.href = '/login'),
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
        action: () => (window.location.href = '/'),
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
