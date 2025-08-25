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

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: number;
}

export interface CrossAppStore {
  addNotification: (notification: Notification) => void;
  notifications: Notification[];
  clearNotifications: () => void;
}

export const useCrossAppStore = (): CrossAppStore => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Notification): void => {
    logger.info('Cross-app notification:', notification);
    setNotifications(prev => [...prev, notification]);
  }, []);

  const clearNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  return { addNotification, notifications, clearNotifications };
};
