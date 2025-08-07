import React from "react";

export interface AlertProps {
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = "info", 
  onClose,
  className = ""
}) => {
  const variantClasses = {
    info: "bg-blue-100 border-blue-200 text-blue-800",
    success: "bg-green-100 border-green-200 text-green-800",
    warning: "bg-yellow-100 border-yellow-200 text-yellow-800",
    error: "bg-red-100 border-red-200 text-red-800",
  };
  
  const iconMap = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
  };
  
  return (
    <div 
      className={`p-4 rounded-lg border-l-4 ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <span className="mr-2" aria-hidden="true">
          {iconMap[variant]}
        </span>
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-current opacity-70 hover:opacity-100"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
