import { useState, useCallback } from 'react';

// Simple logger for integrations package
const logger = {
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CrossAppHooks] ${message}`, data);
    }
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[CrossAppHooks] ${message}`, data);
  },
  error: (message: string, data?: unknown) => {
    console.error(`[CrossAppHooks] ${message}`, data);
  },
};

interface Notification {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface CrossAppStore {
  addNotification: (notification: Notification) => void;
  notifications: Notification[];
  clearNotifications: () => void;
}

export const useCrossAppStore = (): CrossAppStore => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>): void => {
    const fullNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
    };
    logger.info('Cross-app notification:', fullNotification);
    setNotifications(prev => [...prev, fullNotification]);
  }, []);

  const clearNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  return { addNotification, notifications, clearNotifications };
};
