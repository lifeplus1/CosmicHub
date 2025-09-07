import React, { useCallback, useMemo } from 'react';

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'cosmic';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  'aria-label'?: string;
}

// Memoize static variant classes to prevent recreation
const VARIANT_CLASSES = {
  default:
    'bg-cosmic-purple text-cosmic-gold hover:bg-cosmic-purple/80 shadow-lg shadow-cosmic-purple/20',
  destructive: 'bg-red-600 text-white hover:bg-red-700',
  outline:
    'border border-cosmic-purple/30 bg-transparent text-cosmic-silver hover:bg-cosmic-purple/10 hover:text-cosmic-gold',
  secondary:
    'bg-cosmic-dark/50 border border-cosmic-purple/30 text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold',
  ghost:
    'text-cosmic-silver hover:bg-cosmic-purple/10 hover:text-cosmic-gold',
  link: 'text-cosmic-gold underline-offset-4 hover:underline',
  cosmic:
    'bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 shadow-lg shadow-cosmic-purple/20',
} as const;

// Memoize static size classes to prevent recreation
const SIZE_CLASSES = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
} as const;

const BASE_CLASSES =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-cosmic-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const getVariantClasses = (variant: ButtonVariant = 'default'): string => {
  return VARIANT_CLASSES[variant];
};

const getSizeClasses = (size: ButtonSize = 'default'): string => {
  return SIZE_CLASSES[size];
};

export const Button: React.FC<ButtonProps> = React.memo(function Button({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button',
  className = '',
  'aria-label': ariaLabel,
  ...props
}) {
  // Memoize event handlers to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  // Memoize computed classes to prevent recalculation
  const combinedClasses = useMemo(() => {
    const variantClasses = getVariantClasses(variant);
    const sizeClasses = getSizeClasses(size);

    return [BASE_CLASSES, variantClasses, sizeClasses, className]
      .filter(Boolean)
      .join(' ');
  }, [variant, size, className]);

  return (
    <button
      type={type}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
