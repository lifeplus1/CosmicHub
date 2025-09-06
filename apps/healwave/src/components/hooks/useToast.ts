import { useContext } from 'react';
import { ToastContext, type ToastContextType } from '../ToastProvider';

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    // Return a mock implementation to prevent compilation errors
    return {
      toast: () => {
        // Mock implementation for development
      },
      closeToast: () => {
        // Mock implementation for development
      },
    };
  }
  return context;
};
