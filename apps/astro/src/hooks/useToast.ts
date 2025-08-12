import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  status: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

let toastCounter = 0;

export const useToast = (): {
  toast: (options: Omit<Toast, 'id'>) => string;
  toasts: Toast[];
  removeToast: (id: string) => void;
} => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: Omit<Toast, 'id'>) => {
    const id = (++toastCounter).toString();
    const newToast: Toast = {
      id,
      duration: 3000,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toast, toasts, removeToast };
};
