/**
 * Enhanced User Feedback System
 * UX Enhancement: Toast notifications, progress indicators, and status feedback
 */

import React, { useState, useCallback, createContext, useContext } from 'react';
import { cn } from '../utils/cn';

// Toast notification types
export interface ToastNotification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number; // 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

// Toast context
interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast provider component
export interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastNotification['position'];
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toastData: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastNotification = {
      id,
      duration: 5000,
      dismissible: true,
      position: defaultPosition,
      ...toastData,
    };

    setToasts(prev => {
      const newToasts = [toast, ...prev];
      // Limit number of toasts
      return newToasts.slice(0, maxToasts);
    });

    // Auto-remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [defaultPosition, maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast container component
interface ToastContainerProps {
  toasts: ToastNotification[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position ?? 'top-right';
    acc[position] ??= [];
    acc[position].push(toast);
    return acc;
  }, {} as Record<string, ToastNotification[]>);

  const getPositionClasses = (position: ToastNotification['position']) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={cn(
            'fixed z-50 flex flex-col gap-2 max-w-sm w-full',
            getPositionClasses(position as ToastNotification['position'])
          )}
        >
          {positionToasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => onRemove(toast.id)}
            />
          ))}
        </div>
      ))}
    </>
  );
};

// Individual toast item
interface ToastItemProps {
  toast: ToastNotification;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const getToastIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'loading':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  const getToastColors = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          border: 'border-green-500/50',
          background: 'bg-green-900/20 backdrop-blur-sm',
          text: 'text-green-200',
          icon: 'text-green-400',
        };
      case 'error':
        return {
          border: 'border-red-500/50',
          background: 'bg-red-900/20 backdrop-blur-sm',
          text: 'text-red-200',
          icon: 'text-red-400',
        };
      case 'warning':
        return {
          border: 'border-yellow-500/50',
          background: 'bg-yellow-900/20 backdrop-blur-sm',
          text: 'text-yellow-200',
          icon: 'text-yellow-400',
        };
      case 'info':
        return {
          border: 'border-blue-500/50',
          background: 'bg-blue-900/20 backdrop-blur-sm',
          text: 'text-blue-200',
          icon: 'text-blue-400',
        };
      case 'loading':
        return {
          border: 'border-cosmic-purple/50',
          background: 'bg-cosmic-dark/80 backdrop-blur-sm',
          text: 'text-cosmic-silver',
          icon: 'text-cosmic-purple',
        };
      default:
        return {
          border: 'border-gray-500/50',
          background: 'bg-gray-900/20 backdrop-blur-sm',
          text: 'text-gray-200',
          icon: 'text-gray-400',
        };
    }
  };

  const handleRemove = useCallback(() => {
    setIsVisible(false);
    setTimeout(onRemove, 300); // Wait for fade out animation
  }, [onRemove]);

  const colors = getToastColors(toast.type);

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-lg transform transition-all duration-300',
        colors.border,
        colors.background,
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='flex items-start gap-3'>
        {/* Icon */}
        <div className={cn('flex-shrink-0 text-lg', colors.icon)}>
          {toast.type === 'loading' ? (
            <div className='w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin' />
          ) : (
            getToastIcon(toast.type)
          )}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className={cn('font-medium text-sm', colors.text)}>
            {toast.title}
          </div>
          {toast.message && (
            <div className={cn('text-xs mt-1 opacity-90', colors.text)}>
              {toast.message}
            </div>
          )}
        </div>

        {/* Action button */}
        {toast.action && (
          <button
            type='button'
            onClick={toast.action.onClick}
            className={cn(
              'flex-shrink-0 text-xs font-medium px-2 py-1 rounded border transition-colors',
              colors.text,
              'hover:bg-white/10 border-current/30'
            )}
          >
            {toast.action.label}
          </button>
        )}

        {/* Dismiss button */}
        {toast.dismissible && (
          <button
            type='button'
            onClick={handleRemove}
            className='flex-shrink-0 text-gray-400 hover:text-gray-200 focus:outline-none ml-2'
            aria-label='Dismiss notification'
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

      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && !isPaused && (
        <div className='mt-2 h-1 bg-black/20 rounded-full overflow-hidden'>
          <div
            className={cn('h-full rounded-full transition-all ease-linear', colors.icon.replace('text-', 'bg-'))}
            ref={(el) => {
              if (el && toast.duration) {
                el.style.animation = `toast-progress ${toast.duration}ms linear`;
                el.style.transformOrigin = 'left';
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

// Status indicator component
export interface StatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  inline?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  className,
  size = 'md',
  showIcon = true,
  inline = false,
}) => {
  const getStatusConfig = (status: StatusIndicatorProps['status']) => {
    switch (status) {
      case 'loading':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/30',
          icon: 'loading',
          defaultMessage: 'Loading...',
        };
      case 'success':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/30',
          icon: '✅',
          defaultMessage: 'Success',
        };
      case 'error':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/30',
          icon: '❌',
          defaultMessage: 'Error occurred',
        };
      case 'warning':
        return {
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/30',
          icon: '⚠️',
          defaultMessage: 'Warning',
        };
      case 'idle':
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/30',
          icon: 'ℹ️',
          defaultMessage: 'Ready',
        };
    }
  };

  const config = getStatusConfig(status);
  const displayMessage = message ?? config.defaultMessage;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (inline) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showIcon && (
          <div className={config.color}>
            {config.icon === 'loading' ? (
              <div className={cn('border-2 border-current border-t-transparent rounded-full animate-spin', iconSizes[size])} />
            ) : (
              <span className='text-base'>{config.icon}</span>
            )}
          </div>
        )}
        <span className={cn('font-medium', config.color, sizeClasses[size].split(' ')[0])}>
          {displayMessage}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border flex items-center gap-2',
        config.bgColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <div className={config.color}>
          {config.icon === 'loading' ? (
            <div className={cn('border-2 border-current border-t-transparent rounded-full animate-spin', iconSizes[size])} />
          ) : (
            <span className='text-base'>{config.icon}</span>
          )}
        </div>
      )}
      <span className={cn('font-medium', config.color)}>
        {displayMessage}
      </span>
    </div>
  );
};

// Progress bar component
export interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
  indeterminate?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  size = 'md',
  color = 'primary',
  showValue = true,
  animated = true,
  indeterminate = false,
  label,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-gradient-to-r from-cosmic-purple to-cosmic-blue',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label and value */}
      {(label ?? showValue) && (
        <div className='flex justify-between items-center mb-1'>
          {label && (
            <div className='text-sm font-medium text-cosmic-silver'>
              {label}
            </div>
          )}
          {showValue && !indeterminate && (
            <div className='text-sm text-cosmic-silver/70'>
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className={cn('bg-gray-700 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn(
            'rounded-full transition-all duration-300 ease-out',
            colorClasses[color],
            animated && 'transition-all duration-300',
            indeterminate && 'animate-pulse'
          )}
          ref={(el) => {
            if (el) {
              el.style.width = indeterminate ? '100%' : `${percentage}%`;
              if (indeterminate) {
                el.style.animation = 'progress-indeterminate 2s ease-in-out infinite';
              }
            }
          }}
        />
      </div>
    </div>
  );
};

// Convenient toast hooks for different types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string) =>
      addToast({ title, message, type: 'success' }),
    error: (title: string, message?: string) =>
      addToast({ title, message, type: 'error', duration: 0 }), // Persistent for errors
    warning: (title: string, message?: string) =>
      addToast({ title, message, type: 'warning' }),
    info: (title: string, message?: string) =>
      addToast({ title, message, type: 'info' }),
    loading: (title: string, message?: string) =>
      addToast({ title, message, type: 'loading', duration: 0, dismissible: false }),
  };
};
