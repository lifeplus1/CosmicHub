import React from 'react';

interface ButtonPropsBase {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  // Allow passing through standard HTML button attributes (className, aria-*, etc.) while declaration bug is resolved
  [key: string]: unknown;
}

export interface ButtonProps extends ButtonPropsBase {
  className?: string;
}

// Workaround to ensure className appears in declaration output in certain TS composite builds
// (re-export augmented type alias so downstream sees property)
export type ButtonPropsPublic = ButtonProps & { className?: string };

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  const baseClasses =
    'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cosmic-purple/50';

  const variantClasses = {
    primary:
      'bg-cosmic-purple hover:bg-cosmic-purple/80 text-cosmic-gold shadow-lg shadow-cosmic-purple/20 cosmic-glow',
    secondary:
      'bg-cosmic-dark/50 border border-cosmic-purple/30 text-cosmic-silver hover:bg-cosmic-purple/20 hover:text-cosmic-gold',
  };

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`.trim()}
    >
      {children}
    </button>
  );
};
