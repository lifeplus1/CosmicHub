import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { devConsole } from '../config/environment';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  status: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
  closeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // Return a mock implementation to prevent compilation errors
    return {
      toast: () => devConsole.log('Toast provider not available'),
      closeToast: () => devConsole.log('Toast provider not available')
    };
  }
  return context;
};

// Simple provider implementation
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toast = () => {};
  const closeToast = () => {};
  
  return (
    <ToastContext.Provider value={{ toast, closeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
