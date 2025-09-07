import React, { useCallback, useMemo } from 'react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = React.memo(function Alert({
  children,
  variant = 'info',
  onClose,
  className = '',
}) {
  const variantClasses = useMemo(() => ({
    info: 'bg-blue-100 border-blue-200 text-blue-800',
    success: 'bg-green-100 border-green-200 text-green-800',
    warning: 'bg-yellow-100 border-yellow-200 text-yellow-800',
    error: 'bg-red-100 border-red-200 text-red-800',
  }), []);

  const iconMap = useMemo(() => ({
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }), []);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onClose?.();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClose) {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${variantClasses[variant]} ${className}`}
      role='alert'
      aria-live='polite'
    >
      <div className='flex items-start'>
        <span className='mr-2' aria-hidden='true'>
          {iconMap[variant]}
        </span>
        <div className='flex-1'>{children}</div>
        {onClose && (
          <button
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            className='ml-2 text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 rounded'
            aria-label='Close alert'
            type='button'
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
});

interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = React.memo(function AlertDescription({
  children,
  className = '',
}) {
  return <div className={`text-sm ${className}`}>{children}</div>;
});
