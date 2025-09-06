import React, { type ReactNode } from 'react';
import { ToastContext, type ToastContextType } from './ToastProvider';

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
export default ToastProvider;
