import React, { useEffect, useCallback, useMemo, useRef } from 'react';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  'aria-describedby'?: string;
}

export const Modal: React.FC<ModalProps> = React.memo(function Modal({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  'aria-describedby': ariaDescribedBy,
  ...props
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Memoize size classes to prevent recreation
  const sizeClasses = useMemo(() => ({
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }), []);

  // Memoize computed classes
  const modalContentClasses = useMemo(() => 
    `bg-cosmic-dark/95 backdrop-blur-lg border border-cosmic-purple/20 rounded-lg shadow-xl w-full ${sizeClasses[size]} ${className} max-h-[90vh] overflow-auto`.trim(),
    [sizeClasses, size, className]
  );

  // Focus management for accessibility
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }, []);

  // Memoize event handlers
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (closeOnEscape && event.key === 'Escape') {
      onClose();
    }
  }, [onClose, closeOnEscape]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onClose();
    }
  }, [onClose, closeOnBackdropClick]);

  const handleBackdropKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (closeOnBackdropClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClose();
    }
  }, [onClose, closeOnBackdropClick]);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleContentKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
  }, []);

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCloseKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Store the previously active element to restore focus later
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Add event listeners
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', trapFocus);
      document.body.style.overflow = 'hidden';

      // Focus the modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', trapFocus);
      document.body.style.overflow = 'unset';

      // Restore focus to the previously active element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    };
  }, [isOpen, handleEscape, trapFocus]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={ariaDescribedBy}
      tabIndex={-1}
      {...props}
    >
      <div
        className={modalContentClasses}
        onClick={handleContentClick}
        onKeyDown={handleContentKeyDown}
        role="document"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-cosmic-gold font-cinzel"
              >
                {title}
              </h2>
            )}
            <button
              onClick={handleCloseClick}
              onKeyDown={handleCloseKeyDown}
              className="rounded-sm opacity-70 ring-offset-cosmic-dark transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-cosmic-purple focus:ring-offset-2 p-1"
              aria-label="Close modal"
              type="button"
            >
              <svg
                className="h-4 w-4 text-cosmic-silver hover:text-cosmic-gold transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="text-cosmic-silver">{children}</div>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';
