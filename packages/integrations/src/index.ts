import { useState, useCallback } from 'react';
import type { Planet, House, Aspect } from '@cosmichub/types';

// Simple logger for integrations package
const logger = {
  info: (message: string, data?: object | string | number | boolean | null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Integrations] ${message}`, data);
    }
  },
  warn: (message: string, data?: object | string | number | boolean | null) => {
    console.warn(`[Integrations] ${message}`, data);
  },
  error: (
    message: string,
    data?: object | string | number | boolean | null
  ) => {
    console.error(`[Integrations] ${message}`, data);
  },
};

export interface UserSubscription {
  id: string;
  userId: string;
  tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  limits: {
    chartsPerMonth: number;
    savedCharts: number;
    aiInsights: boolean;
    prioritySupport: boolean;
  };
}

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

export interface HealwaveSession {
  id: string;
  userId: string;
  frequency: number;
  duration: number; // in minutes
  timestamp: string; // ISO 8601 format
  startTime?: Date;
  isActive?: boolean;
  personalizedFor?: AstrologyChart;
}

export interface Notification {
  id: string;
  title?: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
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

export * from './api';
export * from './ephemeris';
export * from './stripe';
export * from './frequency/index';
