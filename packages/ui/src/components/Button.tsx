import React from "react";

interface ButtonPropsBase {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
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
  variant = "primary",
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} ${className}`.trim()}
    >
      {children}
    </button>
  );
};
