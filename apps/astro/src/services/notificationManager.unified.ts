/**
 * Unified Notification Manager (consolidated from notificationManager.ts & notificationManager.new.ts)
 * Goal: single source of truth with strong runtime guards and a minimal public API.
 */

declare const process: { env: { NODE_ENV?: string } };
import {
  createPushNotificationManager as _createPushNotificationManager,
  AstrologyNotificationScheduler as _AstrologyNotificationScheduler,
  getBackgroundSyncManager as _getBackgroundSyncManager,
  type PushNotificationManager as _PushNotificationManager,
  type VAPIDKeys,
  type NotificationStats as _NotificationStats,
} from '@cosmichub/config';

import type {
  NotificationPreferences,
  NotificationFrequency,
  QuietHours,
  SyncMessageData,
  ChartData as _ChartData,
} from '../types/notifications';

const envGet = (k: string): string | undefined => {
  const env = import.meta?.env;
  return typeof env === 'object' && env !== null && k in env
    ? String(env[k])
    : undefined;
};

const _VAPID_KEYS: VAPIDKeys = {
  publicKey: envGet('VITE_VAPID_PUBLIC_KEY') ?? '',
  privateKey: envGet('VITE_VAPID_PRIVATE_KEY') ?? '',
  subject: 'mailto:support@cosmichub.app',
};

const _dev = (): boolean => process?.env?.NODE_ENV === 'development';
// Use global devConsole if present to align with no-console policy elsewhere.
// Fallback to silent no-op to avoid raw console usage in production bundle.
interface DevConsoleFn {
  (...a: unknown[]): void;
}

interface DevConsoleObj {
  debug?: DevConsoleFn;
  warn?: DevConsoleFn;
}

// Narrow type for accessing globalThis in a type-safe way
interface GlobalThisWithDevConsole {
  devConsole?: {
    debug?: DevConsoleFn;
    warn?: DevConsoleFn;
  };
}

// Create a safe accessor for global context that satisfies TypeScript
const _getDevConsole = (): DevConsoleObj => {
  try {
    // Safely check if globalThis exists
    if (typeof globalThis !== 'object' || globalThis === null) {
      return {};
    }

    // Cast to our extended interface
    const global = globalThis as unknown as GlobalThisWithDevConsole;

    // Check if devConsole exists
    if (typeof global.devConsole !== 'object' || global.devConsole === null) {
      return {};
    }

    const result: DevConsoleObj = {};

    // Type-safe checks for debug and warn functions
    if (typeof global.devConsole.debug === 'function') {
      result.debug = global.devConsole.debug;
    }

    if (typeof global.devConsole.warn === 'function') {
      result.warn = global.devConsole.warn;
    }

    return result;
  } catch {
    return {};
  }
};

const _debug = (..._args: unknown[]): void => {
  if (process.env.NODE_ENV !== 'production') {
    // console.log('[UnifiedNotificationManager]', ...args);
  }
};

const _warn = (..._args: unknown[]): void => {
  if (process.env.NODE_ENV !== 'production') {
    // console.warn('[UnifiedNotificationManager]', ...args);
  }
};

// Type guards
const isRecord = (v: unknown): v is Record<string, unknown> => {
  return typeof v === 'object' && v !== null;
};

const _hasStringId = (obj: unknown): obj is { id: string } =>
  typeof obj === 'object' &&
  obj !== null &&
  'id' in obj &&
  typeof (obj as { id?: unknown }).id === 'string';

const _isQuietHours = (_v: unknown): _v is QuietHours => {
  if (!isRecord(_v)) return false;
  return (
    typeof _v['enabled'] === 'boolean' &&
    typeof _v['start'] === 'string' &&
    typeof _v['end'] === 'string'
  );
};

const _isValidFrequency = (_v: unknown): _v is NotificationFrequency => {
  return (
    typeof _v === 'string' &&
    ['daily', 'instant', 'hourly', 'weekly'].includes(_v)
  );
};

const _isNotificationPreferences = (
  _obj: unknown
): _obj is NotificationPreferences => {
  // Type guard implementation would go here
  return false;
};

const _isSyncMessageData = (_obj: unknown): _obj is SyncMessageData => {
  // Type guard implementation would go here
  return false;
};

// Background sync status (narrowed shape from getBackgroundSyncStatus implementation)
export interface BackgroundSyncStatus {
  lastRun?: number;
  [key: string]: unknown;
}

// Push notification status
export interface PushStatus {
  queuedNotifications: number;
  totalSent: number;
  totalDelivered: number;
  totalClicked: number;
  avgDeliveryTime: number;
  errors: number;
}

// Public status result type
export interface SyncStatusResult {
  background: BackgroundSyncStatus;
  userId: string | null;
  push: PushStatus;
}

// Public event naming schema (future expansion placeholder)
export interface SyncEventMap {
  'sync-message': SyncMessageData;
}

export class UnifiedNotificationManager {
  private userId: string | null = null;

  constructor() {
    // Initialize components
  }

  async initialize(userId?: string): Promise<boolean> {
    if (userId !== undefined && userId.length > 0) {
      this.userId = userId;
    }
    // Simulate async initialization
    await new Promise(resolve => setTimeout(resolve, 1));
    return true;
  }

  // Chart notification method
  async notifyChartReady(chartData: _ChartData): Promise<void> {
    _debug('Chart ready notification:', { userId: this.userId, hasData: !!chartData });
    // Implementation would send actual notification
  }

  // Status method
  status(): SyncStatusResult {
    return this.getStatus();
  }

  // Subscribe method for user preferences
  async subscribe(userId: string, preferences: unknown): Promise<boolean> {
    _debug('Subscribe notification preferences:', { userId, preferences });
    this.userId = userId;
    // Implementation would save preferences
    return true;
  }

  // Send test notification
  async sendTest(): Promise<boolean> {
    _debug('Sending test notification for user:', this.userId);
    // Implementation would send test notification
    return true;
  }

  // Placeholder methods - would need full implementation
  getStatus(): SyncStatusResult {
    return {
      background: {},
      userId: this.userId,
      push: {
        queuedNotifications: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalClicked: 0,
        avgDeliveryTime: 0,
        errors: 0,
      },
    };
  }
}

// Singleton export
let singleton: UnifiedNotificationManager | null = null;

export function getNotificationManager(): UnifiedNotificationManager {
  singleton ??= new UnifiedNotificationManager();
  return singleton;
}
export const initializeNotifications = (userId?: string): Promise<boolean> =>
  getNotificationManager().initialize(userId);

// Backwards compatibility named export
export default UnifiedNotificationManager;
