/**
 * Accessibility Utilities for A11Y-030 Implementation
 * WCAG 2.1 AA compliant components and helpers
 */

import React from 'react';

// =============================================================================
// BUTTON ACCESSIBILITY UTILITIES
// =============================================================================

export interface AccessibleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Visual loading indicator text */
  loadingText?: string;
  /** Icon-only button requires explicit label */
  isIconOnly?: boolean;
  /** Explicit accessible name (aria-label) if text not present */
  accessibleName?: string;
  /** Disabled state (merged with isLoading) */
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  isLoading = false,
  loadingText = 'Loading…',
  isIconOnly = false,
  accessibleName,
  disabled,
  onClick,
  onKeyDown,
  children,
  className = '',
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!(disabled || isLoading) && onClick) {
        onClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    }
    onKeyDown?.(e);
  };

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

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`accessible-button ${className}`.trim()}
      aria-label={ariaLabel ?? undefined}
      disabled={isDisabled}
      {...(isDisabled && { 'aria-disabled': 'true' })}
      onClick={isDisabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

// =============================================================================
// INTERACTIVE DIV UTILITIES
// =============================================================================

// Valid interactive ARIA roles for clickable elements
type ValidInteractiveRole = 
  | 'button'
  | 'tab'
  | 'link'
  | 'menuitem'
  | 'option'
  | 'radio'
  | 'switch'
  | 'checkbox';

// Interactive element accessibility
export interface InteractiveElementProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onKeyDown' | 'role'> {
  accessibleName: string;
  role?: ValidInteractiveRole;
  disabled?: boolean;
  onActivate: (e: React.SyntheticEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const AccessibleClickable: React.FC<InteractiveElementProps> = ({
  accessibleName,
  role = 'button',
  disabled = false,
  className = '',
  onActivate,
  onKeyDown,
  children,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!disabled) onActivate(e);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onActivate(e);
    }
    onKeyDown?.(e);
  };
  
  return (
    <div
      {...props}
      className={`accessible-clickable ${disabled ? 'disabled' : ''} ${className}`.trim()}
      role={
        role === 'button' ? 'button' :
        role === 'tab' ? 'tab' :
        role === 'link' ? 'link' :
        role === 'menuitem' ? 'menuitem' :
        role === 'option' ? 'option' :
        role === 'radio' ? 'radio' :
        role === 'switch' ? 'switch' :
        role === 'checkbox' ? 'checkbox' :
        'button'
      }
      tabIndex={disabled ? -1 : 0}
      aria-label={accessibleName}
      {...(disabled && { 'aria-disabled': 'true' })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

// =============================================================================
// INPUT ACCESSIBILITY UTILITIES
// =============================================================================

export interface AccessibleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'children'> {
  label: string;
  showLabel?: boolean;
  error?: string;
  description?: string;
  wrapperClassName?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  id,
  showLabel = false,
  error,
  description,
  wrapperClassName = '',
  className = '',
  ...props
}) => {
  const uniqueId = React.useId();
  const inputId = id ?? `input-${uniqueId}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const descId = description ? `${inputId}-desc` : undefined;
  return (
    <div className={`accessible-input-wrapper ${wrapperClassName}`.trim()}>
      <label
        htmlFor={inputId}
        className={`accessible-input-label ${showLabel ? '' : 'sr-only'}`.trim()}
      >
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        className={`accessible-input ${error ? 'error' : ''} ${className}`.trim()}
        aria-describedby={
          [descId, errorId].filter(Boolean).join(' ') || undefined
        }
        {...(error && { 'aria-invalid': 'true' })}
      />
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
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  description,
  className = '',
  size = 'md',
}) => {
  const uniqueId = React.useId();
  const titleId = `modal-title-${uniqueId}`;
  const descId = description ? `modal-desc-${uniqueId}` : undefined;

  React.useEffect(() => {
    if (!isOpen) return;
    const focusable = document.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <>
      <div
        className='accessible-modal-backdrop'
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={`accessible-modal accessible-modal-${size} ${className}`.trim()}
      >
        <div className='accessible-modal-content'>
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
          {description && (
            <div id={descId} className='accessible-modal-description'>
              {description}
            </div>
          )}
          <div className='accessible-modal-body'>{children}</div>
        </div>
      </div>
    </>
  );
};

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/** Hook to make any element keyboard accessible */
export function useKeyboardAccessible(
  callback: () => void,
  deps: React.DependencyList = []
) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        callback();
      }
    },
    deps
  );
  return { onKeyDown: handleKeyDown, tabIndex: 0, role: 'button' as const };
}

/** Focus an element whenever isActive becomes true */
export function useFocusManagement<T extends HTMLElement>(isActive: boolean) {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    if (isActive && ref.current) ref.current.focus();
  }, [isActive]);
  return ref;
}

// =============================================================================
// CSS STYLES (inject into global styles)
// =============================================================================

export const accessibilityStyles = `
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
.sr-only-focusable:focus,.sr-only-focusable:active { position:static; width:auto; height:auto; margin:0; overflow:visible; clip:auto; white-space:normal; }
.accessible-button:focus-visible,.accessible-clickable:focus-visible,.accessible-input:focus-visible { outline:2px solid #2563eb; outline-offset:2px; }
.accessible-modal-backdrop { position:fixed; inset:0; background-color:rgba(0,0,0,0.5); backdrop-filter:blur(4px); z-index:50; }
.accessible-modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; border-radius:0.5rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); z-index:51; max-height:90vh; overflow-y:auto; }
.accessible-modal-sm { width:90%; max-width:24rem; }
.accessible-modal-md { width:90%; max-width:32rem; }
.accessible-modal-lg { width:90%; max-width:48rem; }
.accessible-modal-xl { width:90%; max-width:64rem; }
.accessible-modal-header { display:flex; align-items:center; justify-content:space-between; padding:1.5rem; border-bottom:1px solid #e5e7eb; }
.accessible-modal-title { font-size:1.25rem; font-weight:600; margin:0; }
.accessible-modal-close { padding:0.5rem; border:none; background:none; font-size:1.5rem; cursor:pointer; }
.accessible-modal-description { padding:0 1.5rem; color:#6b7280; font-size:0.875rem; }
.accessible-modal-body { padding:1.5rem; }
.accessible-input-wrapper { margin-bottom:1rem; }
.accessible-input-label { display:block; font-weight:500; margin-bottom:0.25rem; }
.accessible-input { width:100%; padding:0.5rem; border:1px solid #d1d5db; border-radius:0.25rem; }
.accessible-input.error { border-color:#ef4444; }
.accessible-input-description { margin-top:0.25rem; font-size:0.875rem; color:#6b7280; }
.accessible-input-error { margin-top:0.25rem; font-size:0.875rem; color:#ef4444; }
.accessible-clickable:hover:not(.disabled) { opacity:0.8; }
.accessible-clickable.disabled { opacity:0.5; cursor:not-allowed; }
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
