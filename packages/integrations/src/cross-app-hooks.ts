import { useState, useCallback } from 'react';

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
    console.log('Cross-app notification:', notification);
    setNotifications((prev) => [...prev, notification]);
  }, []);

  const clearNotifications = useCallback((): void => {
    setNotifications([]);
  }, []);

  return { addNotification, notifications, clearNotifications };
};
