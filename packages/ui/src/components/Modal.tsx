import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
      onClick={onClose}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClose();
        }
      }}
      role='dialog'
      aria-modal='true'
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
    >
      <div
        className={`bg-cosmic-dark/95 backdrop-blur-lg border border-cosmic-purple/20 rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className} max-h-[90vh] overflow-auto`.trim()}
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        role='document'
      >
        <div className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            {title && (
              <h2
                id='modal-title'
                className='text-lg font-semibold text-cosmic-gold font-cinzel'
              >
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className='rounded-sm opacity-70 ring-offset-cosmic-dark transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cosmic-purple focus:ring-offset-2 p-1'
              aria-label='Close modal'
            >
              <svg
                className='h-4 w-4 text-cosmic-silver hover:text-cosmic-gold transition-colors'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
          <div className='text-cosmic-silver'>{children}</div>
        </div>
      </div>
    </div>
  );
};
