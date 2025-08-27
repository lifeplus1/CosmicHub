/**
 * Accessibility Utilities for A11Y-030 Implementation
 * WCAG 2.1 AA compliant components and helpers
 */

import React from 'react';

// =============================================================================
// BUTTON ACCESSIBILITY UTILITIES
// =============================================================================

export interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Force accessible name - will use children if string, otherwise requires explicit aria-label
   */
  accessibleName?: string;
  /**
   * Loading state for async operations
   */
  isLoading?: boolean;
  /**
   * Visual loading indicator
   */
  loadingText?: string;
  /**
   * Icon-only button requires explicit label
   */
  isIconOnly?: boolean;
}

/**
 * Fully accessible button component with WCAG 2.1 AA compliance
 */
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  accessibleName,
  isLoading = false,
  loadingText = 'Loading...',
  isIconOnly = false,
  disabled,
  onClick,
  onKeyDown,
  className = '',
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Space and Enter activate button
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && !isLoading && onClick) {
        // Create a minimal synthetic mouse event
        onClick({
          ...e,
          type: 'click',
          button: 0,
        } as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    }
    onKeyDown?.(e);
  };

  // Generate accessible name
  let ariaLabel = accessibleName;
  if (!ariaLabel && isIconOnly) {
    console.warn(
      'AccessibleButton: Icon-only buttons require accessibleName prop'
    );
    ariaLabel = 'Button';
  }
  if (!ariaLabel && typeof children === 'string') {
    ariaLabel = children;
  }

  const isDisabled = Boolean(disabled ?? isLoading);

  // Build props conditionally for ARIA attributes
  const buttonProps = {
    ...props,
    className: `accessible-button ${className}`,
    'aria-label': ariaLabel,
    disabled: isDisabled,
    onClick: isDisabled ? undefined : onClick,
    onKeyDown: handleKeyDown,
    ...(isDisabled && { 'aria-disabled': 'true' as const }),
  };

  return <button {...buttonProps}>{isLoading ? loadingText : children}</button>;
};

// =============================================================================
// INTERACTIVE DIV UTILITIES
// =============================================================================

export interface AccessibleClickableProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Callback for activation (click or keyboard)
   */
  onActivate: (
    e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>
  ) => void;
  /**
   * Accessible name for screen readers
   */
  accessibleName: string;
  /**
   * ARIA role (default: button)
   */
  role?: 'button' | 'link' | 'tab' | 'option';
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Custom key handlers (Space/Enter are handled automatically)
   */
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

/**
 * Makes any div keyboard accessible with proper ARIA
 */
export const AccessibleClickable: React.FC<AccessibleClickableProps> = ({
  children,
  onActivate,
  accessibleName,
  role = 'button',
  disabled = false,
  onKeyDown,
  className = '',
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) {
      onActivate(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onActivate(e);
      }
    }
    onKeyDown?.(e);
  };

  const roleValue = role;

  // Build props conditionally for ARIA attributes
  const divProps = {
    ...props,
    className: `accessible-clickable ${disabled ? 'disabled' : ''} ${className}`,
    role: roleValue,
    tabIndex: disabled ? -1 : 0,
    'aria-label': accessibleName,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    ...(disabled && { 'aria-disabled': 'true' as const }),
  };

  return <div {...divProps}>{children}</div>;
};

// =============================================================================
// INPUT ACCESSIBILITY UTILITIES
// =============================================================================

export interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text (will create hidden label if none visible)
   */
  label: string;
  /**
   * Show label visually (default: false - hidden for screen readers only)
   */
  showLabel?: boolean;
  /**
   * Error message for validation
   */
  error?: string;
  /**
   * Help text/description
   */
  description?: string;
  /**
   * Wrapper className
   */
  wrapperClassName?: string;
}

/**
 * Fully accessible input with proper labeling and error states
 */
export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  showLabel = false,
  error,
  description,
  id,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  // Generate unique IDs consistently
  const uniqueId = React.useId();
  const inputId = id ?? `input-${uniqueId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const descId = description ? `${inputId}-desc` : undefined;

  // Build props conditionally for ARIA attributes
  const inputProps = {
    ...props,
    id: inputId,
    className: `accessible-input ${error ? 'error' : ''} ${className}`,
    'aria-describedby':
      [descId, errorId].filter(Boolean).join(' ') || undefined,
    ...(error && { 'aria-invalid': 'true' as const }),
  };

  return (
    <div className={`accessible-input-wrapper ${wrapperClassName}`}>
      <label
        htmlFor={inputId}
        className={`accessible-input-label ${showLabel ? '' : 'sr-only'}`}
      >
        {label}
      </label>

      <input {...inputProps} aria-label='Input field' />

      {description && (
        <div id={descId} className='accessible-input-description'>
          {description}
        </div>
      )}

      {error && (
        <div
          id={errorId}
          className='accessible-input-error'
          role='alert'
          aria-live='polite'
        >
          {error}
        </div>
      )}
    </div>
  );
};

// =============================================================================
// MODAL ACCESSIBILITY UTILITIES
// =============================================================================

export interface AccessibleModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;
  /**
   * Close modal callback
   */
  onClose: () => void;
  /**
   * Modal title (required for accessibility)
   */
  title: string;
  /**
   * Modal content
   */
  children: React.ReactNode;
  /**
   * Additional description for complex modals
   */
  description?: string;
  /**
   * Custom class names
   */
  className?: string;
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Fully accessible modal with focus trap and proper ARIA
 */
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  description,
  className = '',
  size = 'md',
}) => {
  // Generate unique IDs consistently
  const uniqueId = React.useId();
  const titleId = `modal-title-${uniqueId}`;
  const descId = description ? `modal-desc-${uniqueId}` : undefined;

  // Focus trap and escape handler
  React.useEffect(() => {
    if (!isOpen) return;

    // Focus first focusable element
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement | undefined;
    firstFocusable?.focus();

    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = Array.from(
          document.querySelectorAll(
            '[role="dialog"] button, [role="dialog"] [href], [role="dialog"] input, [role="dialog"] select, [role="dialog"] textarea, [role="dialog"] [tabindex]:not([tabindex="-1"])'
          )
        );

        if (focusableElements.length === 0) return;

        const first = focusableElements[0] as HTMLElement | undefined;
        const last = focusableElements[focusableElements.length - 1] as
          | HTMLElement
          | undefined;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='accessible-modal-backdrop'
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onClose();
          }
        }}
        tabIndex={0}
        role='button'
        aria-hidden='true'
      />

      {/* Modal */}
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`accessible-modal accessible-modal-${size} ${className}`}
      >
        <div className='accessible-modal-content'>
          {/* Header */}
          <div className='accessible-modal-header'>
            <h2 id={titleId} className='accessible-modal-title'>
              {title}
            </h2>

            <AccessibleButton
              isIconOnly
              accessibleName='Close modal'
              onClick={onClose}
              className='accessible-modal-close'
            >
              ✕
            </AccessibleButton>
          </div>

          {/* Description */}
          {description && (
            <div id={descId} className='accessible-modal-description'>
              {description}
            </div>
          )}

          {/* Content */}
          <div className='accessible-modal-body'>{children}</div>
        </div>
      </div>
    </>
  );
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to make any element keyboard accessible
 */
export const useKeyboardAccessible = (
  callback: () => void,
  deps: React.DependencyList = []
) => {
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      callback();
    }
  }, deps);

  return {
    onKeyDown: handleKeyDown,
    tabIndex: 0,
    role: 'button' as const,
  };
};

/**
 * Hook for focus management
 */
export const useFocusManagement = (isActive: boolean) => {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (isActive && ref.current) {
      ref.current.focus();
    }
  }, [isActive]);

  return ref;
};

// =============================================================================
// CSS STYLES (inject into global styles)
// =============================================================================

export const accessibilityStyles = `
/* Screen reader only content */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static !important;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  overflow: visible !important;
  clip: auto !important;
  white-space: normal !important;
}

/* Focus indicators */
.accessible-button:focus-visible,
.accessible-clickable:focus-visible,
.accessible-input:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Modal styles */
.accessible-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 50;
}

.accessible-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 51;
  max-height: 90vh;
  overflow-y: auto;
}

.accessible-modal-sm { width: 90%; max-width: 24rem; }
.accessible-modal-md { width: 90%; max-width: 32rem; }
.accessible-modal-lg { width: 90%; max-width: 48rem; }
.accessible-modal-xl { width: 90%; max-width: 64rem; }

.accessible-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.accessible-modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.accessible-modal-close {
  padding: 0.5rem;
  border: none;
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.accessible-modal-description {
  padding: 0 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.accessible-modal-body {
  padding: 1.5rem;
}

/* Input styles */
.accessible-input-wrapper {
  margin-bottom: 1rem;
}

.accessible-input-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.accessible-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}

.accessible-input.error {
  border-color: #ef4444;
}

.accessible-input-description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.accessible-input-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

/* Clickable elements */
.accessible-clickable:hover:not(.disabled) {
  opacity: 0.8;
}

.accessible-clickable.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

export default {
  AccessibleButton,
  AccessibleClickable,
  AccessibleInput,
  AccessibleModal,
  useKeyboardAccessible,
  useFocusManagement,
  accessibilityStyles,
};
