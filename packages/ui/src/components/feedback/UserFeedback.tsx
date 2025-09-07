import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { cn } from '../../utils/cn';
import styles from '../../styles/modules/components/UserFeedback.module.css';

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  onDismiss?: () => void;
}

export type StatusType = 'idle' | 'loading' | 'success' | 'error' | 'warning';

// Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
  defaultPosition?: Toast['position'];
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
  defaultPosition = 'top-right',
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: defaultDuration,
      position: defaultPosition,
      dismissible: true,
      ...toastData,
    };

    setToasts(prev => {
      const filtered = prev.slice(-(maxToasts - 1));
      return [...filtered, newToast];
    });

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [maxToasts, defaultDuration, defaultPosition]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  const toastsByPosition = useMemo(() => {
    return toasts.reduce((acc, toast) => {
      const position = toast.position ?? 'top-right';
      acc[position] ??= [];
      acc[position].push(toast);
      return acc;
    }, {} as Record<string, Toast[]>);
  }, [toasts]);

  const getPositionClasses = (position: string) => {
    const positionMap = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };
    return positionMap[position as keyof typeof positionMap] || 'top-4 right-4';
  };

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={cn(
            'fixed z-50 flex flex-col gap-2 w-full max-w-sm',
            getPositionClasses(position)
          )}
        >
          {positionToasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>
      ))}
    </>
  );
};

// Individual Toast Item
interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [_isPaused, setIsPaused] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      removeToast(toast.id);
      toast.onDismiss?.();
    }, 150);
  }, [removeToast, toast.id, toast.onDismiss]);

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-900/20 border-green-500/30',
          textColor: 'text-green-400',
          icon: '✅',
        };
      case 'error':
        return {
          bgColor: 'bg-red-900/20 border-red-500/30',
          textColor: 'text-red-400',
          icon: '❌',
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-900/20 border-yellow-500/30',
          textColor: 'text-yellow-400',
          icon: '⚠️',
        };
      case 'info':
        return {
          bgColor: 'bg-blue-900/20 border-blue-500/30',
          textColor: 'text-blue-400',
          icon: 'ℹ️',
        };
      case 'loading':
        return {
          bgColor: 'bg-gray-900/20 border-gray-500/30',
          textColor: 'text-gray-400',
          icon: 'loading',
        };
      default:
        return {
          bgColor: 'bg-gray-900/20 border-gray-500/30',
          textColor: 'text-gray-400',
          icon: 'ℹ️',
        };
    }
  };

  const config = getToastConfig(toast.type);

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out',
        config.bgColor,
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full',
        'hover:shadow-xl'
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 mt-0.5', config.textColor)}>
          {config.icon === 'loading' ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-base">{config.icon}</span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={cn('font-medium text-sm', config.textColor)}>
            {toast.title}
          </div>
          {toast.message && (
            <div className="text-xs text-gray-300 mt-1">
              {toast.message}
            </div>
          )}
        </div>

        {toast.dismissible && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-200 transition-colors"
           aria-label="Interactive button">
            <span className="sr-only">Dismiss</span>
            <span className="text-lg leading-none">×</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Status Indicator Component
interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  inline?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = React.memo(({
  status,
  message,
  className,
  size = 'md',
  showIcon = true,
  inline = false,
}) => {
  const statusConfig = useMemo(() => {
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
  }, [status]);

  const displayMessage = message ?? statusConfig.defaultMessage;

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
          <div className={statusConfig.color}>
            {statusConfig.icon === 'loading' ? (
              <div
                className={cn(
                  'border-2 border-current border-t-transparent rounded-full animate-spin',
                  iconSizes[size]
                )}
              />
            ) : (
              <span className="text-base">{statusConfig.icon}</span>
            )}
          </div>
        )}
        <span
          className={cn(
            'font-medium',
            statusConfig.color,
            sizeClasses[size].split(' ')[0]
          )}
        >
          {displayMessage}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border flex items-center gap-2',
        statusConfig.bgColor,
        statusConfig.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <div className={statusConfig.color}>
          {statusConfig.icon === 'loading' ? (
            <div
              className={cn(
                'border-2 border-current border-t-transparent rounded-full animate-spin',
                iconSizes[size]
              )}
            />
          ) : (
            <span className="text-base">{statusConfig.icon}</span>
          )}
        </div>
      )}
      <span className={cn('font-medium', statusConfig.color)}>{displayMessage}</span>
    </div>
  );
});

StatusIndicator.displayName = 'StatusIndicator';

// Progress bar component
interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  showValue?: boolean;
  animated?: boolean;
  indeterminate?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(({
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

  // Type-safe size mapping with descriptive validation
  const getSizeClassName = (sizeValue: ProgressBarProps['size']): string => {
    const sizeMapping: Record<NonNullable<ProgressBarProps['size']>, keyof typeof styles> = {
      sm: 'small',
      md: 'medium', 
      lg: 'large',
    } as const;
    
    const resolvedSize = sizeValue ?? 'md';
    const mappedSize = sizeMapping[resolvedSize];
    if (!(mappedSize in styles)) {
      console.warn(`Invalid size mapping: ${resolvedSize} -> ${mappedSize}`);
      return styles.medium; // fallback to medium
    }
    
    return styles[mappedSize];
  };

  // Type-safe color mapping with cosmic theme integration
  const getColorClassName = (colorValue: ProgressBarProps['color']): string => {
    const colorMapping: Record<NonNullable<ProgressBarProps['color']>, string> = {
      primary: 'bg-gradient-to-r from-cosmic-purple to-cosmic-blue',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    } as const;
    
    const resolvedColor = colorValue ?? 'primary';
    return colorMapping[resolvedColor];
  };

  return (
    <div className={cn('w-full', className)}>
      {(label ?? showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <div className="text-sm font-medium text-cosmic-silver">
              {label}
            </div>
          )}
          {showValue && !indeterminate && (
            <div className="text-sm text-cosmic-silver/70">
              {Math.round(percentage)}%
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          styles.progressContainer,
          getSizeClassName(size),
        )}
        {...(!indeterminate && {
          style: { '--progress-width': `${percentage}%` } as React.CSSProperties
        })}
      >
        <div
          className={cn(
            styles.progressBar,
            indeterminate 
              ? styles.progressBarIndeterminate 
              : styles.progressBarDynamic,
            getColorClassName(color),
            animated && 'transition-all duration-300',
            indeterminate && 'animate-pulse'
          )}
        />
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

// Convenient toast hooks for different types
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, message?: string) =>
      addToast({ title, message, type: 'success' }),
    error: (title: string, message?: string) =>
      addToast({ title, message, type: 'error', duration: 0 }),
    warning: (title: string, message?: string) =>
      addToast({ title, message, type: 'warning' }),
    info: (title: string, message?: string) =>
      addToast({ title, message, type: 'info' }),
    loading: (title: string, message?: string) =>
      addToast({
        title,
        message,
        type: 'loading',
        duration: 0,
        dismissible: false,
      }),
  };
};
