import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNotificationManager } from '../notificationManager.unified';

// Minimal mock for push manager creation coming from @cosmichub/config when running unit tests.
// If the real module exists, these spies will attach to queueNotification method call.

vi.mock('@cosmichub/config', () => {
  const queueNotification = vi.fn().mockResolvedValue(undefined);
  return {
    createPushNotificationManager: () => ({
      initialize: vi.fn().mockResolvedValue(true),
      queueNotification,
      getNotificationStats: () => ({ queued: 0 }),
      subscribeUser: vi.fn().mockResolvedValue(true)
    }),
    AstrologyNotificationScheduler: class { 
      scheduleDailyHoroscope() {}
      scheduleTransitAlerts() {}
      scheduleMoonPhases() {}
    },
    getBackgroundSyncManager: () => ({
      setPushNotificationManager() {},
      getSyncStatus: () => ({ idle: true })
    })
  };
});

describe('UnifiedNotificationManager', () => {
  beforeEach(() => {
    // clear localStorage mock between tests
    (global as any).localStorage = {
      store: {} as Record<string,string>,
      getItem(key: string) { return this.store[key] ?? null; },
      setItem(key: string, val: string) { this.store[key] = val; },
      removeItem(key: string) { delete this.store[key]; }
    };
  });

  it('initializes without user id', async () => {
    const mgr = getNotificationManager();
    const ok = await mgr.initialize();
    expect(ok).toBe(true);
  });

  it('subscribes user with default prefs when invalid prefs passed', async () => {
    const mgr = getNotificationManager();
    await mgr.initialize();
    const ok = await mgr.subscribe('user-1', { not: 'valid' });
    expect(ok).toBe(true);
  });

  it('ignores notifyChartReady when chart missing id', async () => {
    const mgr = getNotificationManager();
    await mgr.initialize();
    // @ts-expect-error intentionally missing id
    await mgr.notifyChartReady({ planets: {} });
    // no throw expected
  });
});
