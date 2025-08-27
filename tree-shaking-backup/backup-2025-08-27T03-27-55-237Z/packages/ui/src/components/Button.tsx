import React from 'react';

  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const getVariantClasses = (variant: ButtonVariant = 'default'): string => {
  const variants = {
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
  };
  return variants[variant];
};

const getSizeClasses = (size: ButtonSize = 'default'): string => {
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  return sizes[size];
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-cosmic-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);

  const combinedClasses = [baseClasses, variantClasses, sizeClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
};
