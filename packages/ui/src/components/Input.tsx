import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = "", 
  ...props 
}) => {
  const id = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-cosmic-silver">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full p-3 rounded bg-cosmic-dark border transition-colors ${
          error 
            ? "border-red-500 focus:border-red-400" 
            : "border-cosmic-purple focus:border-cosmic-gold"
        } text-cosmic-silver focus:outline-none focus:ring-2 focus:ring-cosmic-purple/20 ${className}`}
        {...props}
        {...(error && { 'aria-invalid': 'true' })}
        {...(error ? { 'aria-describedby': `${id}-error` } : helperText ? { 'aria-describedby': `${id}-help` } : {})}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-help`} className="text-sm text-cosmic-silver/70">
          {helperText}
        </p>
      )}
    </div>
  );
};
