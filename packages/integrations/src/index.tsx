import React, { useState, useCallback } from 'react';

export interface AstrologyChart {
  id: string;
  userId: string;
  birthData: {
    date: string; // ISO 8601 format
    time: string; // HH:mm format
    location: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  planets: Planet[];
  houses: House[];
  aspects: Aspect[];
}

export interface Planet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface House {
  number: number;
  sign: string;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  applying: boolean;
}

export interface HealwaveSession {
  id: string;
  userId: string;
  frequency: number;
  duration: number; // in minutes
  timestamp: string; // ISO 8601 format
  personalizedFor?: AstrologyChart;
}

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

export * from './api';