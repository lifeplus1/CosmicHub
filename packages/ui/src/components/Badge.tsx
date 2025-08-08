import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = "primary", 
  size = "md",
  className = ""
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";
  
  const variantClasses = {
    primary: "bg-cosmic-purple text-white",
    secondary: "bg-cosmic-dark text-cosmic-silver border border-cosmic-purple",
    success: "bg-green-600 text-white",
    warning: "bg-yellow-600 text-white",
    error: "bg-red-600 text-white",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
};
