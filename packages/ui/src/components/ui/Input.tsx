import React, { useCallback, useMemo, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// Base classes for consistent styling
const BASE_INPUT_CLASSES = 'w-full p-3 rounded bg-cosmic-dark border transition-colors text-cosmic-silver focus:outline-none focus:ring-2 focus:ring-cosmic-purple/20';
const ERROR_BORDER_CLASSES = 'border-red-500 focus:border-red-400';
const DEFAULT_BORDER_CLASSES = 'border-cosmic-purple focus:border-cosmic-gold';

export const Input: React.FC<InputProps> = React.memo(function Input({
  label,
  error,
  helperText,
  className = '',
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}) {
  // Use React's useId for stable, unique IDs
  const generatedId = useId();
  const id = props.id ?? generatedId;

  // Memoize combined input classes
  const inputClasses = useMemo(() => {
    const borderClasses = error ? ERROR_BORDER_CLASSES : DEFAULT_BORDER_CLASSES;
    return `${BASE_INPUT_CLASSES} ${borderClasses} ${className}`.trim();
  }, [error, className]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  }, [onChange]);

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
  }, [onBlur]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
  }, [onKeyDown]);

  // Memoize aria attributes
  const ariaProps = useMemo(() => {
    const baseProps: Record<string, string | boolean> = {};
    
    if (error) {
      baseProps['aria-invalid'] = true;
      baseProps['aria-describedby'] = `${id}-error`;
    } else if (helperText) {
      baseProps['aria-describedby'] = `${id}-help`;
    }

    // Only add aria-label if no label is provided
    if (!label) {
      baseProps['aria-label'] = props['aria-label'] ?? 'Input field';
    }

    return baseProps;
  }, [error, helperText, id, label, props]);

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-cosmic-silver"
        >
          {label}
          {props.required && (
            <span className="text-red-400 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <input
        {...props}
        id={id}
        className={inputClasses}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...ariaProps}
      />
      {error && (
        <p 
          id={`${id}-error`} 
          className="text-sm text-red-400" 
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p 
          id={`${id}-help`} 
          className="text-sm text-cosmic-silver/70"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
