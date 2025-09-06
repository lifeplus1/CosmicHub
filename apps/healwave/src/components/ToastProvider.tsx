import React, { createContext, type ReactNode } from 'react';

interface Toast {
  id?: string;
  message?: string;
  title?: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  isClosable?: boolean;
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
  closeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Simple provider implementation
const ToastProvider = React.memo(({ children }: { children: ReactNode }) => {
  const toast = () => {};
  const closeToast = () => {};

  const value: ToastContextType = { toast, closeToast };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
});

ToastProvider.displayName = 'ToastProvider';

// Export types and context for external use
export { ToastContext };
export type { Toast, ToastContextType };
export default ToastProvider;
