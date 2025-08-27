/**
 * Enhanced Background Sync for CosmicHub
 * Extends the existing service worker with smart sync capabilities
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/require-await */

import { PushNotificationManager } from './push-notifications';

// Local devConsole (avoid cross-package dependency). Non-error methods disabled in production.
const IS_DEV =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as { process?: { env?: { NODE_ENV?: string } } })
    .process !== 'undefined' &&
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    ?.NODE_ENV !== 'production';
const devConsole = {
  log: IS_DEV ? console.log.bind(console) : undefined,
  warn: IS_DEV ? console.warn.bind(console) : undefined,
  error: console.error.bind(console),
};

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [k: string]: JSONValue };
  type:
    | 'chart_calculation'
    | 'user_data'
    | 'frequency_session'
    | 'notification';
  data: JSONValue | Record<string, unknown>;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  priority: 'low' | 'normal' | 'high';
  maxRetries: number;
  retryCount: number;
  createdAt: number;
  nextRetryAt: number;
}

  data?: JSONValue | Record<string, unknown>;
  error?: string;
  retryAfter?: number;
}

  type: string;
  data: JSONValue | Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

// Helper functions for easy integration
    return syncManager.addToSyncQueue({
      type: 'chart_calculation',
      data: { ...chartData, userId },
      url: '/api/charts/calculate',
      method: 'POST',
      priority: 'high',
      maxRetries: 3,
    });
  },

  // Queue user data update
  queueUserDataUpdate: async (userData: any): Promise<string> => {
    const syncManager = new AdvancedBackgroundSync();
    return syncManager.addToSyncQueue({
      type: 'user_data',
      data: userData,
      url: '/api/user/update',
      method: 'PUT',
      priority: 'normal',
      maxRetries: 5,
    });
  },

  // Queue frequency session save
  queueFrequencySession: async (sessionData: any): Promise<string> => {
    const syncManager = new AdvancedBackgroundSync();
    return syncManager.addToSyncQueue({
      type: 'frequency_session',
      data: sessionData,
      url: '/api/healwave/sessions',
      method: 'POST',
      priority: 'normal',
      maxRetries: 3,
    });
  },
};

// Singleton instance
let backgroundSyncInstance: AdvancedBackgroundSync | null = null;

export const getBackgroundSyncManager = (): AdvancedBackgroundSync => {
  if (!backgroundSyncInstance) {
    backgroundSyncInstance = new AdvancedBackgroundSync();
  }
  return backgroundSyncInstance;
};
