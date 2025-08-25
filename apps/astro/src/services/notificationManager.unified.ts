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
export interface BackgroundSyncStatus {
  idle?: boolean;
  lastRun?: number;
  [key: string]: unknown;
}

// Public status result type
export interface NotificationManagerStatus {
  push: NotificationStats;
  background: BackgroundSyncStatus;
  userId: string | null;
}

// Public event naming schema (future expansion placeholder)
export interface NotificationEventMap {
  'notification-click': { action?: string; chartId?: string };
  'sync-message': SyncMessageData;
}

export class UnifiedNotificationManager {
  private push: PushNotificationManager;
  private scheduler: AstrologyNotificationScheduler;
  private background = getBackgroundSyncManager();
  private userId: string | null = null;

  constructor() {
    this.push = createPushNotificationManager(VAPID_KEYS);
    this.scheduler = new AstrologyNotificationScheduler(this.push);
    this.background.setPushNotificationManager(this.push);
  }

  async initialize(userId?: string): Promise<boolean> {
    if (userId !== undefined && userId.length > 0) {
      this.userId = userId;
    }

    // Use Promise.resolve to ensure we have a Promise
    const ok = await Promise.resolve(this.push.initialize());
    if (ok !== true) {
      warn('Push initialization failed');
      return false;
    }
    this.attachListeners();
    if (
      this.userId !== null &&
      this.userId !== undefined &&
      this.userId.length > 0
    ) {
      this.setupAstrologyNotifications();
    }
    debug('Initialized');
    return true;
  }

  async subscribe(userId: string, prefs?: unknown): Promise<boolean> {
    const defaults: NotificationPreferences = {
      dailyHoroscope: false,
      transitAlerts: true,
      frequencyReminders: false,
      appUpdates: true,
      quietHours: { enabled: true, start: '22:00', end: '08:00' },
      frequency: 'daily',
      maxDailyNotifications: 5,
    };
    const finalPrefs = isNotificationPreferences(prefs)
      ? { ...defaults, ...prefs }
      : defaults;
    try {
      // Prefer subscribeUser, fallback to subscribe
      const anyPush = this.push as {
        subscribeUser?: (
          id: string,
          p: NotificationPreferences
        ) => Promise<unknown>;
        subscribe?: (
          id: string,
          p: NotificationPreferences
        ) => Promise<unknown>;
      };
      if (typeof anyPush.subscribeUser === 'function') {
        await anyPush.subscribeUser(userId, finalPrefs);
      } else if (typeof anyPush.subscribe === 'function') {
        await anyPush.subscribe(userId, finalPrefs);
      } else {
        throw new Error('No subscribe API');
      }
      this.userId = userId;
      this.setupAstrologyNotifications();
      return true;
    } catch (e) {
      warn('Subscription failed', e);
      return false;
    }
  }

  async notifyChartReady(chart: ChartData): Promise<void> {
    if (hasStringId(chart) === false) return;
    await this.push.queueNotification({
      title: '✨ Your Chart is Ready!',
      body: 'Tap to explore your cosmic blueprint.',
      tag: 'chart-complete',
      urgency: 'normal',
      data: { type: 'chart_complete', chartId: chart.id },
      actions: [
        { action: 'view_chart', title: 'View Chart', icon: '/icons/chart.png' },
        { action: 'share', title: 'Share', icon: '/icons/share.png' },
      ],
    });
  }

  async sendTest(): Promise<boolean> {
    try {
      await this.push.queueNotification({
        title: '🧪 Test',
        body: 'Notification pipeline OK',
        tag: 'test',
        urgency: 'low',
      });
      return true;
    } catch {
      return false;
    }
  }

  private getBackgroundStatus(): BackgroundSyncStatus {
    const raw = this.background.getSyncStatus();
    if (typeof raw !== 'object' || raw === null) return {};
    return raw as BackgroundSyncStatus;
  }

  status(): NotificationManagerStatus {
    const raw = this.push.getNotificationStats() as Partial<NotificationStats>;
    const pushStats: NotificationStats = {
      totalSubscriptions: raw.totalSubscriptions ?? 0,
      activeSubscriptions: raw.activeSubscriptions ?? 0,
      queuedNotifications: raw.queuedNotifications ?? 0,
      permissionStatus: raw.permissionStatus ?? Notification.permission,
      totalSent: raw.totalSent ?? 0,
      totalDelivered: raw.totalDelivered ?? 0,
      totalClicked: raw.totalClicked ?? 0,
      avgDeliveryTime: raw.avgDeliveryTime ?? 0,
      errors: raw.errors ?? 0,
      lastSent: raw.lastSent,
    };
    return {
      push: pushStats,
      background: this.getBackgroundStatus(),
      userId: this.userId,
    };
  }

  private setupAstrologyNotifications(): void {
    if (
      this.userId === null ||
      this.userId === undefined ||
      this.userId.length === 0
    )
      return;
    const birth = this.getUserBirthData();
    if (birth === null || birth === undefined) return;
    const sun =
      birth.sunSign !== undefined && birth.sunSign.length > 0
        ? birth.sunSign
        : 'Aries';
    this.scheduler.scheduleDailyHoroscope(this.userId, sun, '09:00');
    // Type mismatch between definition & implementation; safe at runtime
    // @ts-ignore
    this.scheduler.scheduleTransitAlerts(this.userId);
    this.scheduler.scheduleMoonPhases(this.userId);
  }

  private attachListeners(): void {
    const isValidNavigator = (
      nav: unknown
    ): nav is Navigator & { serviceWorker: ServiceWorkerContainer } => {
      if (!(typeof nav === 'object' && nav !== null)) return false;
      if (!('serviceWorker' in nav)) return false;
      const serviceWorker = (nav as { serviceWorker: unknown }).serviceWorker;
      return typeof serviceWorker === 'object' && serviceWorker !== null;
    };

    if (isValidNavigator(navigator)) {
      navigator.serviceWorker.addEventListener(
        'message',
        (evt: MessageEvent<unknown>) => {
          const d = evt.data;
          if (!isRecord(d)) return;

          if (d['type'] !== 'notification-click') return;

          const action =
            typeof d['action'] === 'string' ? d['action'] : undefined;
          const chartId =
            typeof d['chartId'] === 'string' ? d['chartId'] : undefined;
          this.onClick({ action, chartId });
        }
      );
    }

    const isValidWindow = (win: unknown): win is Window => {
      return typeof win === 'object' && win !== null;
    };

    if (isValidWindow(window)) {
      window.addEventListener('storage', e => {
        if (
          e.key === null ||
          e.key === undefined ||
          !e.key.startsWith('cosmichub-sync-') ||
          e.newValue === null ||
          e.newValue === undefined
        ) {
          return;
        }

        try {
          const parsed: unknown = JSON.parse(e.newValue);
          if (isSyncMessageData(parsed)) {
            this.onSync(parsed);
          }
        } catch {
          /* ignore parse errors */
        }
      });
    }
  }

  private onClick(data: { action?: string; chartId?: string }): void {
    debug('Click', data);
    switch (data.action) {
      case 'view_chart':
        window.location.href = `/chart/${data.chartId ?? ''}`;
        break;
      case 'read':
        window.location.href = '/horoscope';
        break;
      case 'start_session':
        window.location.href = '/healwave/session';
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  private onSync(msg: SyncMessageData): void {
    debug('Sync', msg.type);
    if (msg.type === 'cosmichub-sync-chart_synced' && hasStringId(msg.data)) {
      void this.notifyChartReady(msg.data);
    }
  }

  private getUserBirthData(): { sunSign?: string } | null {
    try {
      const raw = localStorage.getItem('cosmichub-birth-data');
      if (raw === null) return null;

      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed) || typeof parsed['sunSign'] !== 'string')
        return null;
      return { sunSign: parsed['sunSign'] };
    } catch {
      return null;
    }
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
