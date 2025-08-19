/**
 * Advanced Push Notifications System for CosmicHub
 * Implements VAPID keys, user subscriptions, and smart notification strategies
 */

// Extend the global NotificationOptions to include modern properties
interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: NotificationAction[];
  image?: string;
  timestamp?: number;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  timestamp?: number;
  urgency?: 'low' | 'normal' | 'high';
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface UserSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
  userId?: string;
  preferences: NotificationPreferences;
  createdAt: number;
  lastUsed: number;
}

export interface NotificationPreferences {
  dailyHoroscope: boolean;
  transitAlerts: boolean;
  frequencyReminders: boolean;
  appUpdates: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
}

export interface VAPIDKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

// Statistics returned from PushNotificationManager.getNotificationStats
export interface NotificationStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  queuedNotifications: number;
  permissionStatus: NotificationPermission;
}

export class PushNotificationManager {
  private vapidKeys: VAPIDKeys;
  private subscriptions = new Map<string, UserSubscription>();
  private notificationQueue: NotificationPayload[] = [];
  private isOnline = navigator.onLine;

  constructor(vapidKeys: VAPIDKeys) {
    this.vapidKeys = vapidKeys;
    this.setupConnectionListener();
    this.loadStoredSubscriptions();
  }

  // Initialize push notifications
  initialize(): boolean {
  const globalDev = (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void; warn?: (...args: unknown[]) => void; error?: (...args: unknown[]) => void } }).devConsole;
  const log = globalDev?.log;
  const warn = globalDev?.warn;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      warn?.('🚫 Push notifications not supported');
      return false;
    }

    if (!('Notification' in window)) {
      warn?.('🚫 Notifications not supported');
      return false;
    }

  log?.('🔔 Initializing push notifications...');
  return true;
  }

  // Request permission and subscribe user
  async subscribeUser(userId: string, preferences: NotificationPreferences): Promise<UserSubscription | null> {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.('❌ Notification permission denied');
        return null;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKeys.publicKey) as BufferSource
      });

      const subKeys = subscription.toJSON().keys as { auth: string; p256dh: string };
      const userSubscription: UserSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          auth: subKeys.auth,
          p256dh: subKeys.p256dh
        },
        userId,
        preferences,
        createdAt: Date.now(),
        lastUsed: Date.now()
      };

      // Store subscription
      this.subscriptions.set(userId, userSubscription);
      this.saveSubscriptions();

  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.('✅ User subscribed to push notifications');
      return userSubscription;

    } catch (error) {
  (globalThis as unknown as { devConsole?: { error?: (...args: unknown[]) => void } }).devConsole?.error?.('❌ Failed to subscribe user:', error);
      return null;
    }
  }

  // Unsubscribe user
  async unsubscribeUser(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
  if (subscription !== null && subscription !== undefined) {
        await subscription.unsubscribe();
      }

      this.subscriptions.delete(userId);
      this.saveSubscriptions();
      
  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.('✅ User unsubscribed from push notifications');
      return true;
    } catch (error) {
  (globalThis as unknown as { devConsole?: { error?: (...args: unknown[]) => void } }).devConsole?.error?.('❌ Failed to unsubscribe user:', error);
      return false;
    }
  }

  // Update user preferences
  updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): boolean {
    const subscription = this.subscriptions.get(userId);
  if (subscription === undefined || subscription === null) {
      return false;
    }

    subscription.preferences = { ...subscription.preferences, ...preferences };
    subscription.lastUsed = Date.now();
    
    this.subscriptions.set(userId, subscription);
    this.saveSubscriptions();
    
    return true;
  }

  // Send notification (client-side queue for offline)
  async queueNotification(notification: NotificationPayload): Promise<void> {
    // Add timestamp if not provided
  notification.timestamp ??= Date.now();

    // Add to queue
    this.notificationQueue.push(notification);
    
    // Try to send immediately if online
    if (this.isOnline) {
      await this.processNotificationQueue();
    } else {
  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.('📤 Notification queued for when online');
    }
  }

  // Process queued notifications
  private async processNotificationQueue(): Promise<void> {
    if (this.notificationQueue.length === 0) return;

    const notifications = [...this.notificationQueue];
    this.notificationQueue = [];

    for (const notification of notifications) {
      try {
        // In a real implementation, this would send to your backend
        // For now, we'll show local notifications
        await this.showLocalNotification(notification);
      } catch (error) {
  (globalThis as unknown as { devConsole?: { error?: (...args: unknown[]) => void } }).devConsole?.error?.('❌ Failed to process notification:', error);
        // Re-queue failed notifications
        this.notificationQueue.push(notification);
      }
    }
  }

  // Show local notification
  private async showLocalNotification(payload: NotificationPayload): Promise<void> {
    // No heavy async work presently; retain async for future extensibility
    await Promise.resolve();
    if (Notification.permission !== 'granted') {
      return;
    }

    const options: ExtendedNotificationOptions = {
      body: payload.body,
      icon: payload.icon ?? '/icon-192x192.png',
      badge: payload.badge ?? '/badge-72x72.png',
      image: payload.image,
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.urgency === 'high',
      silent: payload.urgency === 'low',
      timestamp: payload.timestamp
    };

    new Notification(payload.title, options);
  }

  // Smart notification suggestions based on user behavior
  async suggestNotificationSettings(userId: string): Promise<Partial<NotificationPreferences>> {
    await Promise.resolve();
    const subscription = this.subscriptions.get(userId);
    if (subscription === undefined || subscription === null) {
      return {};
    }

    const suggestions: Partial<NotificationPreferences> = {};

    // Analyze usage patterns (placeholder logic)
    const hoursSinceLastUse = (Date.now() - subscription.lastUsed) / (1000 * 60 * 60);

    if (hoursSinceLastUse > 168) { // 1 week
      suggestions.frequency = 'weekly';
    } else if (hoursSinceLastUse > 24) { // 1 day
      suggestions.frequency = 'daily';
    } else {
      suggestions.frequency = 'instant';
    }

    // Suggest quiet hours based on typical usage
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour >= 22 || currentHour <= 7) {
      suggestions.quietHours = {
        enabled: true,
        start: '22:00',
        end: '07:00'
      };
    }

    return suggestions;
  }

  // Get notification statistics
  getNotificationStats(): NotificationStats {
    const activeSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => (Date.now() - sub.lastUsed) < 30 * 24 * 60 * 60 * 1000) // Active in last 30 days
      .length;

    return {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions,
      queuedNotifications: this.notificationQueue.length,
      permissionStatus: Notification.permission
    };
  }

  // Connection listener
  private setupConnectionListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.('🌐 Back online - processing notification queue');
  void this.processNotificationQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.('📴 Gone offline - notifications will queue');
    });
  }

  // Utility: Convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Storage management
  private saveSubscriptions(): void {
    try {
      const data = Array.from(this.subscriptions.entries());
      localStorage.setItem('cosmichub-push-subscriptions', JSON.stringify(data));
    } catch (error) {
  (globalThis as unknown as { devConsole?: { warn?: (...args: unknown[]) => void } }).devConsole?.warn?.('Failed to save subscriptions:', error);
    }
  }

  private loadStoredSubscriptions(): void {
    try {
      const stored = localStorage.getItem('cosmichub-push-subscriptions');
      if (stored !== null && stored !== undefined && stored.length > 0) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(stored) as unknown;
        } catch {
          return;
        }
        if (Array.isArray(parsed) && parsed.every(p => Array.isArray(p) && typeof p[0] === 'string' && typeof p[1] === 'object' && p[1] !== null)) {
          this.subscriptions = new Map(parsed as [string, UserSubscription][]);
        }
      }
    } catch (error) {
      (globalThis as unknown as { devConsole?: { warn?: (...args: unknown[]) => void } }).devConsole?.warn?.('Failed to load stored subscriptions:', error);
    }
  }
}

// Default notification preferences
export const DefaultNotificationPreferences: NotificationPreferences = {
  dailyHoroscope: false,
  transitAlerts: false,
  frequencyReminders: false,
  appUpdates: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  },
  frequency: 'daily'
};

// Astrology-specific notification templates
export const AstrologyNotifications = {
  dailyHoroscope: (sign: string): NotificationPayload => ({
    title: `✨ Daily ${sign} Horoscope`,
    body: 'Your cosmic insights are ready! Tap to discover what the stars have in store.',
    icon: '/icon-192x192.png',
    tag: 'daily-horoscope',
    data: { type: 'horoscope', sign },
    actions: [
      { action: 'read', title: 'Read Now', icon: '/icons/read.png' },
      { action: 'later', title: 'Remind Later', icon: '/icons/clock.png' }
    ]
  }),

  transitAlert: (planet: string, aspect: string): NotificationPayload => ({
    title: `🪐 ${planet} Transit Alert`,
    body: `${planet} is forming a ${aspect} aspect. This could influence your day significantly.`,
    icon: '/icon-192x192.png',
    tag: 'transit-alert',
    urgency: 'high',
    data: { type: 'transit', planet, aspect },
    actions: [
      { action: 'view_chart', title: 'View Chart', icon: '/icons/chart.png' },
      { action: 'dismiss', title: 'Dismiss', icon: '/icons/close.png' }
    ]
  }),

  retrogradeAlert: (planet: string, phase: 'entering' | 'exiting'): NotificationPayload => ({
    title: `↩️ ${planet} Retrograde ${phase === 'entering' ? 'Beginning' : 'Ending'}`,
    body: `${planet} is ${phase} retrograde motion. Prepare for potential shifts in this planetary energy.`,
    icon: '/icon-192x192.png',
    tag: 'retrograde-alert',
    urgency: 'normal',
    data: { type: 'retrograde', planet, phase }
  })
};

// HealWave-specific notification templates
export const HealWaveNotifications = {
  sessionReminder: (sessionType: string, duration: number): NotificationPayload => ({
    title: `🎧 Time for Your ${sessionType} Session`,
    body: `Your ${duration}-minute healing session is ready. Find a quiet space and begin your journey.`,
    icon: '/icon-192x192.png',
    tag: 'session-reminder',
    data: { type: 'session_reminder', sessionType, duration },
    actions: [
      { action: 'start_session', title: 'Start Now', icon: '/icons/play.png' },
      { action: 'snooze', title: 'Remind in 15 min', icon: '/icons/snooze.png' }
    ]
  }),

  frequencyUpdate: (frequency: number, benefit: string): NotificationPayload => ({
    title: `🌊 New Healing Frequency Available`,
    body: `${frequency}Hz frequency added - perfect for ${benefit}. Try it in your next session.`,
    icon: '/icon-192x192.png',
    tag: 'frequency-update',
    data: { type: 'frequency_update', frequency, benefit }
  }),

  progressMilestone: (sessionsCompleted: number): NotificationPayload => ({
    title: `🏆 Healing Milestone Reached!`,
    body: `Congratulations! You've completed ${sessionsCompleted} healing sessions. Your commitment to wellness is inspiring.`,
    icon: '/icon-192x192.png',
    tag: 'progress-milestone',
    urgency: 'low',
    data: { type: 'milestone', sessions: sessionsCompleted }
  })
};

// Smart notification scheduler for astrology events
export class AstrologyNotificationScheduler {
  private pushManager: PushNotificationManager;

  constructor(pushManager: PushNotificationManager) {
    this.pushManager = pushManager;
  }

  // Schedule daily horoscope
  scheduleDailyHoroscope(userId: string, sign: string, time: string): void {
    // In a real implementation, this would integrate with your backend scheduler
  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.(`📅 Scheduled daily horoscope for ${sign} at ${time}`);
  }

  // Schedule transit alerts based on birth chart
  scheduleTransitAlerts(userId: string): void {
    // This would calculate upcoming transits and schedule notifications
  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.(`🔮 Scheduled transit alerts for user ${userId}`);
  }

  // Schedule moon phase notifications
  scheduleMoonPhases(userId: string): void {
    // Calculate upcoming moon phases and schedule notifications
  (globalThis as unknown as { devConsole?: { log?: (...args: unknown[]) => void } }).devConsole?.log?.(`🌙 Scheduled moon phase notifications for user ${userId}`);
  }
}

// Export singleton instance
export const createPushNotificationManager = (vapidKeys: VAPIDKeys): PushNotificationManager => {
  return new PushNotificationManager(vapidKeys);
};
