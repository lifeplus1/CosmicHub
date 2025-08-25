import { describe, it, expect, vi, beforeEach } from 'vitest';
// Provide minimal NotificationPermission type for test environment without DOM lib
type NotificationPermission = 'default' | 'denied' | 'granted';
import { getNotificationManager } from '../notificationManager.unified';

// Minimal mock for push manager creation coming from @cosmichub/config when running unit tests.
// If the real module exists, these spies will attach to queueNotification method call.

vi.mock('@cosmichub/config', () => {
  const queueNotification = vi.fn().mockResolvedValue(undefined);
  return {
    createPushNotificationManager: () => ({
      initialize: vi.fn().mockResolvedValue(true),
      queueNotification,
	getNotificationStats: (): {
          totalSubscriptions: number;
          activeSubscriptions: number;
          queuedNotifications: number;
          permissionStatus: NotificationPermission;
          totalSent: number;
          totalDelivered: number;
          totalClicked: number;
          avgDeliveryTime: number;
          errors: number;
        } => ({ 
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
      scheduleDailyHoroscope(): void {}
      scheduleTransitAlerts(): void {}
      scheduleMoonPhases(): void {}
    },
    getBackgroundSyncManager: () => ({
      setPushNotificationManager(): void {},
      getSyncStatus: (): { idle: boolean } => ({ idle: true })
    })
  };
});

describe('UnifiedNotificationManager', () => {
  beforeEach((): void => {
    // clear localStorage mock between tests
    (global as any).localStorage = {
      store: {} as Record<string,string>,
      getItem(key: string): string | null { return this.store[key] ?? null; },
      setItem(key: string, val: string): void { this.store[key] = val; },
      removeItem(key: string): void { delete this.store[key]; }
    };
  });

  it('initializes without user id and returns typed status', async (): Promise<void> => {
    const mgr = getNotificationManager();
    const ok = await mgr.initialize();
    expect(ok).toBe(true);
    const status = mgr.status();
    expect(status.push.queuedNotifications).toBe(0);
  });

  it('subscribes user with default prefs when invalid prefs passed', async (): Promise<void> => {
    const mgr = getNotificationManager();
    await mgr.initialize();
    const ok = await mgr.subscribe('user-1', { not: 'valid' });
    expect(ok).toBe(true);
  });

  it('ignores notifyChartReady when chart missing id', async (): Promise<void> => {
    const mgr = getNotificationManager();
    await mgr.initialize();
    // @ts-expect-error intentionally missing id
    await mgr.notifyChartReady({ planets: {} });
    // no throw expected
  });

  it('fills default stats fields when push manager omits extended metrics', async (): Promise<void> => {
    // Remock with reduced stats shape
    vi.doMock('@cosmichub/config', () => ({
      createPushNotificationManager: () => ({
        initialize: vi.fn().mockResolvedValue(true),
        queueNotification: vi.fn().mockResolvedValue(undefined),
        getNotificationStats: (): {
          totalSubscriptions: number;
          activeSubscriptions: number;
          queuedNotifications: number;
          permissionStatus: NotificationPermission;
        } => ({
          totalSubscriptions: 2,
          activeSubscriptions: 2,
          queuedNotifications: 1,
          permissionStatus: 'granted' as NotificationPermission
        })
      }),
      AstrologyNotificationScheduler: class { 
        scheduleDailyHoroscope(): void {}
        scheduleTransitAlerts(): void {}
        scheduleMoonPhases(): void {}
      },
      getBackgroundSyncManager: () => ({
        setPushNotificationManager(): void {},
        getSyncStatus: (): { idle: boolean } => ({ idle: false })
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
