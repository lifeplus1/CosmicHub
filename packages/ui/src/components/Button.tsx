import React from "react";

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = "primary", 
  disabled = false 
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`btn btn-${variant}`}
  >
    {children}
  </button>
);
