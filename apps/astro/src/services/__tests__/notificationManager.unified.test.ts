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
	getNotificationStats: () => ({ 
        totalSubscriptions: 1, 
        activeSubscriptions: 1, 
        queuedNotifications: 0, 
        permissionStatus: 'default' as NotificationPermission,
        totalSent: 0,
        totalDelivered: 0,
        totalClicked: 0,
        avgDeliveryTime: 0,
        errors: 0
      }),
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

  it('initializes without user id and returns typed status', async () => {
    const mgr = getNotificationManager();
    const ok = await mgr.initialize();
    expect(ok).toBe(true);
    const status = mgr.status();
    expect(status.push.queuedNotifications).toBe(0);
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

  it('fills default stats fields when push manager omits extended metrics', async () => {
    // Remock with reduced stats shape
    vi.doMock('@cosmichub/config', () => ({
      createPushNotificationManager: () => ({
        initialize: vi.fn().mockResolvedValue(true),
        queueNotification: vi.fn().mockResolvedValue(undefined),
        getNotificationStats: () => ({
          totalSubscriptions: 2,
          activeSubscriptions: 2,
          queuedNotifications: 1,
          permissionStatus: 'granted' as NotificationPermission
        })
      }),
      AstrologyNotificationScheduler: class { 
        scheduleDailyHoroscope() {}
        scheduleTransitAlerts() {}
        scheduleMoonPhases() {}
      },
      getBackgroundSyncManager: () => ({
        setPushNotificationManager() {},
        getSyncStatus: () => ({ idle: false })
      })
    }));

    // Need to re-import after remock
    const { getNotificationManager: getNM } = await import('../notificationManager.unified');
    const mgr = getNM();
    await mgr.initialize();
    const status = mgr.status();
    expect(status.push.totalSent).toBe(0);
    expect(status.push.totalDelivered).toBe(0);
    expect(status.push.totalClicked).toBe(0);
    expect(status.push.avgDeliveryTime).toBe(0);
    expect(status.push.errors).toBe(0);
  });
});
