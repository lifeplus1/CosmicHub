/**
 * Unified Notification Manager (consolidated from notificationManager.ts & notificationManager.new.ts)
 * Goal: single source of truth with strong runtime guards and a minimal public API.
 */

declare const process: { env: { NODE_ENV?: string } };
import {
  PushNotificationManager,
  createPushNotificationManager,
  VAPIDKeys,
  AstrologyNotificationScheduler,
  getBackgroundSyncManager
} from '@cosmichub/config';

import type {
  NotificationPreferences,
  NotificationFrequency,
  QuietHours,
  SyncMessageData,
  ChartData
} from '../types/notifications';

const envGet = (k: string): string | undefined => {
  const env = import.meta?.env;
  return typeof env === 'object' && env !== null && k in env ? String(env[k]) : undefined;
};

const VAPID_KEYS: VAPIDKeys = {
  publicKey: envGet('VITE_VAPID_PUBLIC_KEY') ?? 'BExample-VAPID-Key-For-Development-Only',
  privateKey: '',
  subject: 'mailto:notifications@cosmichub.com'
};

const dev = (): boolean => process?.env?.NODE_ENV === 'development';
// Use global devConsole if present to align with no-console policy elsewhere.
// Fallback to silent no-op to avoid raw console usage in production bundle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const globalThis: any;
const devConsole = ((): { debug?: (...a: unknown[])=>void; warn?: (...a: unknown[])=>void } => {
  const g = typeof globalThis === 'object' && globalThis !== null ? globalThis : {};
  return typeof g.devConsole === 'object' && g.devConsole !== null ? g.devConsole : {};
})();
const debug = (...a: unknown[]): void => { if (dev() && typeof devConsole.debug === 'function') devConsole.debug('[Notify]', ...a); };
const warn = (...a: unknown[]): void => { if (typeof devConsole.warn === 'function') devConsole.warn('[Notify]', ...a); };

// Type guards
const isRecord = (v: unknown): v is Record<string, unknown> => {
  return typeof v === 'object' && v !== null;
};

const hasStringId = (v: unknown): v is { id: string } => {
  if (!isRecord(v)) return false;
  return typeof v.id === 'string';
};

const isQuietHours = (v: unknown): v is QuietHours => {
  if (!isRecord(v)) return false;
  return typeof v.enabled === 'boolean' && 
         typeof v.start === 'string' && 
         typeof v.end === 'string';
};

const isValidFrequency = (v: unknown): v is NotificationFrequency => {
  return typeof v === 'string' && 
         ['daily', 'instant', 'hourly', 'weekly'].includes(v);
};

const isNotificationPreferences = (v: unknown): v is NotificationPreferences => {
  if (!isRecord(v)) return false;
  const {
    dailyHoroscope,
    transitAlerts,
    frequencyReminders,
    appUpdates,
    frequency,
    quietHours
  } = v;
  
  return typeof dailyHoroscope === 'boolean' &&
         typeof transitAlerts === 'boolean' &&
         typeof frequencyReminders === 'boolean' &&
         typeof appUpdates === 'boolean' &&
         isValidFrequency(frequency) &&
         isQuietHours(quietHours);
};

const isSyncMessageData = (v: unknown): v is SyncMessageData => {
  if (!isRecord(v)) return false;
  const { type } = v;
  return typeof type === 'string' &&
         ['cosmichub-sync-chart_synced', 'cosmichub-sync-user_data_synced'].includes(type);
};

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
    const ok = await this.push.initialize();
    if (ok !== true) { 
      warn('Push initialization failed'); 
      return false; 
    }
    this.attachListeners();
    if (this.userId !== null && this.userId !== undefined && this.userId.length > 0) {
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
      frequency: 'daily'
    };
    const finalPrefs = isNotificationPreferences(prefs) ? { ...defaults, ...prefs } : defaults;
    try {
      // Prefer subscribeUser, fallback to subscribe
  const anyPush = this.push as { subscribeUser?: (id: string, p: NotificationPreferences)=>Promise<unknown>; subscribe?: (id: string, p: NotificationPreferences)=>Promise<unknown> };
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
        { action: 'share', title: 'Share', icon: '/icons/share.png' }
      ]
    });
  }

  async sendTest(): Promise<boolean> {
    try {
      await this.push.queueNotification({ title: '🧪 Test', body: 'Notification pipeline OK', tag: 'test', urgency: 'low' });
      return true;
    } catch { return false; }
  }

  status() { return { push: this.push.getNotificationStats(), background: this.background.getSyncStatus(), userId: this.userId }; }

  private setupAstrologyNotifications() {
    if (this.userId === null || this.userId === undefined || this.userId.length === 0) return;
    const birth = this.getUserBirthData();
    if (birth === null || birth === undefined) return;
    const sun = birth.sunSign !== undefined && birth.sunSign.length > 0 ? birth.sunSign : 'Aries';
    this.scheduler.scheduleDailyHoroscope(this.userId, sun, '09:00');
    this.scheduler.scheduleTransitAlerts(this.userId, birth);
    this.scheduler.scheduleMoonPhases(this.userId);
  }

  private attachListeners() {
    const isValidNavigator = (nav: unknown): nav is Navigator & { serviceWorker: ServiceWorkerContainer } => {
      if (!(typeof nav === 'object' && nav !== null)) return false;
      if (!('serviceWorker' in nav)) return false;
      const serviceWorker = (nav as { serviceWorker: unknown }).serviceWorker;
      return typeof serviceWorker === 'object' && serviceWorker !== null;
    };

    if (isValidNavigator(navigator)) {
      navigator.serviceWorker.addEventListener('message', (evt: MessageEvent<unknown>) => {
        const d = evt.data;
        if (!isRecord(d)) return;
        
        if (d.type !== 'notification-click') return;

        const action = typeof d.action === 'string' ? d.action : undefined;
        const chartId = typeof d.chartId === 'string' ? d.chartId : undefined;
        this.onClick({ action, chartId });
      });
    }

    const isValidWindow = (win: unknown): win is Window => {
      return typeof win === 'object' && win !== null;
    };

    if (isValidWindow(window)) {
      window.addEventListener('storage', e => {
        if (e.key === null || e.key === undefined || !e.key.startsWith('cosmichub-sync-') || e.newValue === null || e.newValue === undefined) {
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

  private onClick(data: { action?: string; chartId?: string }) {
    debug('Click', data);
    switch (data.action) {
      case 'view_chart': window.location.href = `/chart/${data.chartId ?? ''}`; break;
      case 'read': window.location.href = '/horoscope'; break;
      case 'start_session': window.location.href = '/healwave/session'; break;
      default: window.location.href = '/dashboard';
    }
  }

  private onSync(msg: SyncMessageData) {
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
      if (!isRecord(parsed) || typeof parsed.sunSign !== 'string') return null;
      return { sunSign: parsed.sunSign };
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
export const initializeNotifications = (userId?: string) => getNotificationManager().initialize(userId);

// Backwards compatibility named export
export default UnifiedNotificationManager;
