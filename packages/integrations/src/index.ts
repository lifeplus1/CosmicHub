import { useState, useCallback } from 'react';

// Subscription-related types
export interface UserSubscription {
  tier: 'free' | 'premium' | 'elite';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  customerId?: string;
  subscriptionId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'premium' | 'elite';
  price: number;
  features: string[];
  limits: {
    chartsPerMonth?: number;
    chartStorage?: number;
    [key: string]: any;
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
export * from './ephemeris';
export * from './stripe';
export * from './subscriptions';

// Re-export key Stripe functionality for convenience
export { 
  stripeService, 
  getStripeService, 
  createStripeService,
  type StripeSession,
  type StripeCheckoutParams,
  type SubscriptionData,
  type StripeConfig
} from './stripe';