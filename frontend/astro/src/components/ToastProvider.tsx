import React, { createContext, useContext, useState } from 'react';
import * as Toast from '@radix-ui/react-toast';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  status: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = (message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...message, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, message.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-900/50';
      case 'error':
        return 'border-red-500 bg-red-900/50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-900/50';
      default:
        return 'border-blue-500 bg-blue-900/50';
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map((toastMessage) => (
          <Toast.Root
            key={toastMessage.id}
            className={`cosmic-card ${getStatusStyles(toastMessage.status)} data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut`}
            onOpenChange={(open) => !open && removeToast(toastMessage.id)}
          >
            <Toast.Title className="toast-title">
              {toastMessage.title}
            </Toast.Title>
            {toastMessage.description && (
              <Toast.Description className="toast-description">
                {toastMessage.description}
              </Toast.Description>
            )}
            <Toast.Action className="cosmic-button text-xs" altText="Close">
              Close
            </Toast.Action>
          </Toast.Root>
        ))}
        <Toast.Viewport className="toast-viewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};
