/**
 * Unified Notification Manager (consolidated from notificationManager.ts & notificationManager.new.ts)
 * Goal: single source of truth with strong runtime guards and a minimal public API.
 */

declare const process: { env: { NODE_ENV?: string } };
import {
  createPushNotificationManager,
  AstrologyNotificationScheduler,
  getBackgroundSyncManager,
  type PushNotificationManager,
  type VAPIDKeys,
  type NotificationStats,
} from '@cosmichub/config';

import type {
  NotificationPreferences,
  NotificationFrequency,
  QuietHours,
  SyncMessageData,
  ChartData,
} from '../types/notifications';

const envGet = (k: string): string | undefined => {
  const env = import.meta?.env;
  return typeof env === 'object' && env !== null && k in env
    ? String(env[k])
    : undefined;
};

const VAPID_KEYS: VAPIDKeys = {
  publicKey:
    envGet('VITE_VAPID_PUBLIC_KEY') ??
    'BExample-VAPID-Key-For-Development-Only',
  privateKey: '',
  subject: 'mailto:notifications@cosmichub.com',
};

const dev = (): boolean => process?.env?.NODE_ENV === 'development';
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
const getDevConsole = (): DevConsoleObj => {
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

const debug = (...a: unknown[]): void => {
  const console = getDevConsole();
  if (dev() && typeof console.debug === 'function') {
    console.debug('[Notify]', ...a);
  }
};

const warn = (...a: unknown[]): void => {
  const console = getDevConsole();
  if (typeof console.warn === 'function') {
    console.warn('[Notify]', ...a);
  }
};

// Type guards
const isRecord = (v: unknown): v is Record<string, unknown> => {
  return typeof v === 'object' && v !== null;
};

const hasStringId = (v: unknown): v is { id: string } => {
  if (!isRecord(v)) return false;
  return typeof v['id'] === 'string';
};

const isQuietHours = (v: unknown): v is QuietHours => {
  if (!isRecord(v)) return false;
  return (
    typeof v['enabled'] === 'boolean' &&
    typeof v['start'] === 'string' &&
    typeof v['end'] === 'string'
  );
};

const isValidFrequency = (v: unknown): v is NotificationFrequency => {
  return (
    typeof v === 'string' &&
    ['daily', 'instant', 'hourly', 'weekly'].includes(v)
  );
};

const isNotificationPreferences = (
  v: unknown
): v is NotificationPreferences => {
  if (!isRecord(v)) return false;
  const {
    dailyHoroscope: _dailyHoroscope,
    transitAlerts: _transitAlerts,
    frequencyReminders: _frequencyReminders,
    appUpdates: _appUpdates,
    frequency: _frequency,
    quietHours: _quietHours,
  } = v;

  return (
    typeof v['dailyHoroscope'] === 'boolean' &&
    typeof v['transitAlerts'] === 'boolean' &&
    typeof v['frequencyReminders'] === 'boolean' &&
    typeof v['appUpdates'] === 'boolean' &&
    isValidFrequency(v['frequency']) &&
    isQuietHours(v['quietHours'])
  );
};

const isSyncMessageData = (v: unknown): v is SyncMessageData => {
  if (!isRecord(v)) return false;
  const type = v['type'];
  return (
    typeof type === 'string' &&
    ['cosmichub-sync-chart_synced', 'cosmichub-sync-user_data_synced'].includes(
      type
    )
  );
};

// Background sync status (narrowed shape from getBackgroundSyncStatus implementation)
  lastRun?: number;
  [key: string]: unknown;
}

// Public status result type
  background: BackgroundSyncStatus;
  userId: string | null;
}

// Public event naming schema (future expansion placeholder)
  'sync-message': SyncMessageData;
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
