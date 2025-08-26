/**
 * Enhanced Error Handling Components
 * UX Enhancement: Comprehensive error states with user-friendly messaging and actions
 */

import React, { useState } from 'react';
import { cn } from '../utils/cn';

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// Error types for better user experience
export type ErrorType = 
  | 'network'
  | 'validation' 
  | 'authentication'
  | 'authorization'
  | 'calculation'
  | 'timeout'
  | 'unknown';

// Enhanced error interface
export interface EnhancedError {
  message: string;
  type?: ErrorType;
  severity?: ErrorSeverity;
  code?: string;
  details?: string;
  timestamp?: Date;
  retryable?: boolean;
  recoveryActions?: Array<{
    label: string;
    action: () => void | Promise<void>;
    primary?: boolean;
  }>;
}

// Error message component
export interface ErrorMessageProps {
  error: EnhancedError | Error | string;
  className?: string;
  showDetails?: boolean;
  showTimestamp?: boolean;
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  retryText?: string;
  dismissible?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  className,
  showDetails = false,
  showTimestamp = false,
  onRetry,
  onDismiss,
  retryText = 'Try Again',
  dismissible = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Normalize error to EnhancedError
  const normalizedError: EnhancedError = React.useMemo(() => {
    if (typeof error === 'string') {
      return {
        message: error,
        type: 'unknown',
        severity: 'error',
        timestamp: new Date(),
      };
    }
    
    if (error instanceof Error) {
      return {
        message: error.message,
        type: getErrorTypeFromMessage(error.message),
        severity: 'error',
        details: error.stack,
        timestamp: new Date(),
        retryable: isRetryableError(error.message),
      };
    }
    
    return {
      ...error,
      timestamp: error.timestamp ?? new Date(),
    };
  }, [error]);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch {
      // Let parent handle retry errors
    } finally {
      setIsRetrying(false);
    }
  };

  const getErrorIcon = (type: ErrorType, severity: ErrorSeverity) => {
    if (severity === 'critical') return '🔥';
    if (severity === 'error') {
      switch (type) {
        case 'network': return '🌐';
        case 'authentication': return '🔐';
        case 'authorization': return '🚫';
        case 'validation': return '⚠️';
        case 'calculation': return '🧮';
        case 'timeout': return '⏱️';
        default: return '❌';
      }
    }
    if (severity === 'warning') return '⚠️';
    return 'ℹ️';
  };

  const getSeverityColors = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-500',
          background: 'bg-red-900/20',
          text: 'text-red-300',
          button: 'bg-red-600 hover:bg-red-700',
        };
      case 'error':
        return {
          border: 'border-red-400',
          background: 'bg-red-800/20',
          text: 'text-red-200',
          button: 'bg-red-500 hover:bg-red-600',
        };
      case 'warning':
        return {
          border: 'border-yellow-400',
          background: 'bg-yellow-800/20',
          text: 'text-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'info':
        return {
          border: 'border-blue-400',
          background: 'bg-blue-800/20',
          text: 'text-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          border: 'border-gray-400',
          background: 'bg-gray-800/20',
          text: 'text-gray-200',
          button: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const colors = getSeverityColors(normalizedError.severity ?? 'error');
  const icon = getErrorIcon(normalizedError.type ?? 'unknown', normalizedError.severity ?? 'error');

  const getUserFriendlyMessage = (error: EnhancedError): string => {
    const { type, message } = error;
    
    switch (type) {
      case 'network':
        return 'Connection issue detected. Please check your internet connection and try again.';
      case 'timeout':
        return 'The request took too long to complete. This may be due to high server load.';
      case 'authentication':
        return 'Your session has expired. Please sign in again to continue.';
      case 'authorization':
        return 'You don\'t have permission to access this resource.';
      case 'validation':
        return message; // Validation messages are usually user-friendly
      case 'calculation':
        return 'There was an issue processing the calculation. Please verify your input data.';
      default:
        return message;
    }
  };

  return (
    <div className={cn('rounded-lg border p-4', colors.border, colors.background, className)}>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0 text-xl' aria-hidden='true'>
          {icon}
        </div>
        
        <div className='flex-1 min-w-0'>
          {/* Error message */}
          <div className={cn('font-medium', colors.text)}>
            {getUserFriendlyMessage(normalizedError)}
          </div>
          
          {/* Error code */}
          {normalizedError.code && (
            <div className='text-xs text-gray-400 mt-1'>
              Error Code: {normalizedError.code}
            </div>
          )}
          
          {/* Timestamp */}
          {showTimestamp && normalizedError.timestamp && (
            <div className='text-xs text-gray-400 mt-1'>
              {normalizedError.timestamp.toLocaleString()}
            </div>
          )}
          
          {/* Technical details toggle */}
          {(showDetails || normalizedError.details) && (
            <button
              type='button'
              onClick={() => setIsExpanded(!isExpanded)}
              className='text-xs text-gray-300 hover:text-gray-100 mt-2 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            >
              {isExpanded ? 'Hide' : 'Show'} technical details
            </button>
          )}
          
          {/* Expanded details */}
          {isExpanded && normalizedError.details && (
            <details className='mt-3 text-xs'>
              <summary className='cursor-pointer text-gray-400 hover:text-gray-200'>
                Stack trace
              </summary>
              <pre className='mt-2 p-2 bg-gray-900/50 rounded text-gray-300 overflow-auto text-xs whitespace-pre-wrap'>
                {normalizedError.details}
              </pre>
            </details>
          )}
        </div>
        
        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <button
            type='button'
            onClick={onDismiss}
            className='flex-shrink-0 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            aria-label='Dismiss error'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        )}
      </div>
      
      {/* Action buttons */}
      <div className='mt-4 flex flex-wrap gap-2'>
        {/* Retry button */}
        {(normalizedError.retryable !== false && onRetry) && (
          <button
            type='button'
            onClick={() => void handleRetry()}
            disabled={isRetrying}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
              colors.button,
              isRetrying && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isRetrying ? (
              <span className='flex items-center gap-2'>
                <div className='w-3 h-3 border border-white border-t-transparent rounded-full animate-spin' />
                Retrying...
              </span>
            ) : (
              retryText
            )}
          </button>
        )}
        
        {/* Custom recovery actions */}
        {normalizedError.recoveryActions?.map((action, index) => (
          <button
            key={index}
            type='button'
            onClick={() => void action.action()}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
              action.primary
                ? `text-white ${colors.button}`
                : 'text-gray-300 bg-gray-700 hover:bg-gray-600 focus:ring-gray-500'
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Error boundary fallback component
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  className?: string;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  className,
}) => {
  const enhancedError: EnhancedError = {
    message: error.message,
    type: getErrorTypeFromMessage(error.message),
    severity: 'error',
    details: error.stack,
    timestamp: new Date(),
    retryable: true,
    recoveryActions: [
      {
        label: 'Reload Page',
        action: () => window.location.reload(),
      },
      {
        label: 'Go Back',
        action: () => window.history.back(),
      },
    ],
  };

  return (
    <div className={cn('p-6', className)}>
      <div className='text-center mb-6'>
        <div className='text-4xl mb-4'>🚨</div>
        <h2 className='text-xl font-semibold text-cosmic-gold mb-2'>
          Something went wrong
        </h2>
        <p className='text-cosmic-silver'>
          We encountered an unexpected error. Please try again.
        </p>
      </div>
      
      <ErrorMessage
        error={enhancedError}
        onRetry={resetError}
        showDetails
        showTimestamp
      />
    </div>
  );
};

// Toast notification for errors
export interface ErrorToastProps {
  error: EnhancedError | Error | string;
  onClose: () => void;
  duration?: number; // Auto-close after duration (ms), 0 for manual close
  className?: string;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onClose,
  duration = 5000,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [duration, onClose]);

  const normalizedError = typeof error === 'string' 
    ? { message: error, type: 'unknown' as ErrorType, severity: 'error' as ErrorSeverity }
    : error instanceof Error
    ? { message: error.message, type: getErrorTypeFromMessage(error.message), severity: 'error' as ErrorSeverity }
    : error;

  const colors = getSeverityColors(normalizedError.severity ?? 'error');

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform',
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
      className
    )}>
      <div className={cn(
        'rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        colors.border,
        colors.background
      )}>
        <div className='flex items-start gap-3'>
          <div className='flex-shrink-0 text-lg'>
            {getErrorIcon(normalizedError.type ?? 'unknown', normalizedError.severity ?? 'error')}
          </div>
          
          <div className='flex-1 min-w-0'>
            <div className={cn('text-sm font-medium', colors.text)}>
              {normalizedError.message}
            </div>
          </div>
          
          <button
            type='button'
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className='flex-shrink-0 text-gray-400 hover:text-gray-200 focus:outline-none'
            aria-label='Close error notification'
            title='Close'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility functions
function getErrorTypeFromMessage(message: string): ErrorType {
  const lowercaseMessage = message.toLowerCase();
  
  if (lowercaseMessage.includes('network') || lowercaseMessage.includes('fetch')) {
    return 'network';
  }
  if (lowercaseMessage.includes('timeout') || lowercaseMessage.includes('aborted')) {
    return 'timeout';
  }
  if (lowercaseMessage.includes('auth') || lowercaseMessage.includes('login')) {
    return 'authentication';
  }
  if (lowercaseMessage.includes('permission') || lowercaseMessage.includes('forbidden')) {
    return 'authorization';
  }
  if (lowercaseMessage.includes('validation') || lowercaseMessage.includes('invalid')) {
    return 'validation';
  }
  if (lowercaseMessage.includes('calculation') || lowercaseMessage.includes('ephemeris')) {
    return 'calculation';
  }
  
  return 'unknown';
}

function isRetryableError(message: string): boolean {
  const lowercaseMessage = message.toLowerCase();
  
  // Network errors are usually retryable
  if (lowercaseMessage.includes('network') || lowercaseMessage.includes('fetch')) {
    return true;
  }
  
  // Timeout errors are retryable
  if (lowercaseMessage.includes('timeout')) {
    return true;
  }
  
  // Server errors (5xx) are retryable
  if (lowercaseMessage.includes('internal server error') || lowercaseMessage.includes('service unavailable')) {
    return true;
  }
  
  // Authentication errors might be retryable after re-login
  if (lowercaseMessage.includes('expired') || lowercaseMessage.includes('unauthorized')) {
    return true;
  }
  
  // Validation and authorization errors are not retryable
  if (lowercaseMessage.includes('validation') || lowercaseMessage.includes('forbidden')) {
    return false;
  }
  
  // Default to retryable
  return true;
}

function getSeverityColors(severity: ErrorSeverity) {
  switch (severity) {
    case 'critical':
      return {
        border: 'border-red-500',
        background: 'bg-red-900/20',
        text: 'text-red-300',
        button: 'bg-red-600 hover:bg-red-700',
      };
    case 'error':
      return {
        border: 'border-red-400',
        background: 'bg-red-800/20',
        text: 'text-red-200',
        button: 'bg-red-500 hover:bg-red-600',
      };
    case 'warning':
      return {
        border: 'border-yellow-400',
        background: 'bg-yellow-800/20',
        text: 'text-yellow-200',
        button: 'bg-yellow-600 hover:bg-yellow-700',
      };
    case 'info':
      return {
        border: 'border-blue-400',
        background: 'bg-blue-800/20',
        text: 'text-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
      };
    default:
      return {
        border: 'border-gray-400',
        background: 'bg-gray-800/20',
        text: 'text-gray-200',
        button: 'bg-gray-600 hover:bg-gray-700',
      };
  }
}

function getErrorIcon(type: ErrorType, severity: ErrorSeverity): string {
  if (severity === 'critical') return '🔥';
  if (severity === 'error') {
    switch (type) {
      case 'network': return '🌐';
      case 'authentication': return '🔐';
      case 'authorization': return '🚫';
      case 'validation': return '⚠️';
      case 'calculation': return '🧮';
      case 'timeout': return '⏱️';
      default: return '❌';
    }
  }
  if (severity === 'warning') return '⚠️';
  return 'ℹ️';
}
