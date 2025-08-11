/**
 * Notification Manager Integration for CosmicHub Astro App
 * Initializes push notifications and background sync
 */

import { 
  PushNotificationManager, 
  createPushNotificationManager,
  VAPIDKeys,
  AstrologyNotifications,
  AstrologyNotificationScheduler
} from '@cosmichub/config';
import { getBackgroundSyncManager } from '@cosmichub/config';

// VAPID keys - in production, load from secure environment variables
const VAPID_KEYS: VAPIDKeys = {
  publicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BExample-VAPID-Key-For-Development-Only',
  privateKey: '', // Server-side only, never expose in client
  subject: 'mailto:notifications@cosmichub.com'
};

export class CosmicHubNotificationManager {
  private pushManager: PushNotificationManager;
  private astrologyScheduler: AstrologyNotificationScheduler;
  private backgroundSync = getBackgroundSyncManager();
  private currentUserId: string | null = null;

  constructor() {
    this.pushManager = createPushNotificationManager(VAPID_KEYS);
    this.astrologyScheduler = new AstrologyNotificationScheduler(this.pushManager);
    
    // Connect background sync with push notifications
    this.backgroundSync.setPushNotificationManager(this.pushManager);
  }

  async initialize(userId?: string): Promise<boolean> {
    console.log('🚀 Initializing CosmicHub notifications...');

    if (userId) {
      this.currentUserId = userId;
    }

    // Initialize push notifications
    const pushInitialized = await this.pushManager.initialize();
    if (!pushInitialized) {
      console.warn('Push notifications not supported');
      return false;
    }

    // Set up notification event listeners
    this.setupNotificationEventListeners();

    // Schedule default astrology notifications if user is logged in
    if (this.currentUserId) {
      await this.setupAstrologyNotifications();
    }

    console.log('✅ CosmicHub notifications initialized');
    return true;
  }

  // User subscription management
  async subscribeUser(userId: string, preferences?: any): Promise<boolean> {
    const defaultPrefs = {
      dailyHoroscope: false,
      transitAlerts: true,
      frequencyReminders: false,
      appUpdates: true,
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      frequency: 'daily' as const
    };

    const subscription = await this.pushManager.subscribeUser(
      userId, 
      preferences || defaultPrefs
    );

    if (subscription) {
      this.currentUserId = userId;
      await this.setupAstrologyNotifications();
      return true;
    }

    return false;
  }

  async unsubscribeUser(): Promise<boolean> {
    if (!this.currentUserId) return false;

    const result = await this.pushManager.unsubscribeUser(this.currentUserId);
    if (result) {
      this.currentUserId = null;
    }
    return result;
  }

  // Astrology-specific notification scheduling
  private async setupAstrologyNotifications(): Promise<void> {
    if (!this.currentUserId) return;

    // In a real implementation, these would be based on user's birth chart
    const userBirthData = this.getUserBirthData();
    
    if (userBirthData) {
      // Schedule daily horoscope
      this.astrologyScheduler.scheduleDailyHoroscope(
        this.currentUserId,
        userBirthData.sunSign || 'Aries',
        '09:00'
      );

      // Schedule transit alerts
      this.astrologyScheduler.scheduleTransitAlerts(this.currentUserId, userBirthData);

      // Schedule moon phase notifications
      this.astrologyScheduler.scheduleMoonPhases(this.currentUserId);
    }
  }

  // Immediate notification triggers
  async notifyChartCalculationComplete(chartData: any): Promise<void> {
    await this.pushManager.queueNotification({
      title: '✨ Your Chart is Ready!',
      body: 'Your personalized astrology chart has been calculated. Tap to explore your cosmic blueprint.',
      tag: 'chart-complete',
      urgency: 'normal',
      data: { type: 'chart_complete', chartId: chartData.id },
      actions: [
        { action: 'view_chart', title: 'View Chart', icon: '/icons/chart.png' },
        { action: 'share', title: 'Share', icon: '/icons/share.png' }
      ]
    });
  }

  async notifyTransitAlert(planet: string, aspect: string, significance: string): Promise<void> {
    const notification = AstrologyNotifications.transitAlert(planet, aspect);
    notification.body = `${planet} is forming a ${aspect} aspect. ${significance}`;
    await this.pushManager.queueNotification(notification);
  }

  async notifyRetrograde(planet: string, phase: 'entering' | 'exiting'): Promise<void> {
    const notification = AstrologyNotifications.retrogradeAlert(planet, phase);
    await this.pushManager.queueNotification(notification);
  }

  async notifyDailyHoroscope(sign: string, preview: string): Promise<void> {
    const notification = AstrologyNotifications.dailyHoroscope(sign);
    notification.body = preview;
    await this.pushManager.queueNotification(notification);
  }

  // Background sync integration
  async syncChartCalculation(chartData: any): Promise<string> {
    return this.backgroundSync.addToSyncQueue({
      type: 'chart_calculation',
      data: chartData,
      url: '/api/charts/calculate',
      method: 'POST',
      priority: 'high',
      maxRetries: 3
    });
  }

  async syncUserProfile(userData: any): Promise<string> {
    return this.backgroundSync.addToSyncQueue({
      type: 'user_data',
      data: userData,
      url: '/api/user/profile',
      method: 'PUT',
      priority: 'normal',
      maxRetries: 5
    });
  }

  // Event handlers
  private setupNotificationEventListeners(): void {
    // Handle notification clicks
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'notification-click') {
          this.handleNotificationClick(event.data);
        }
      });
    }

    // Handle background sync messages
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('cosmichub-sync-')) {
        try {
          const message = JSON.parse(event.newValue || '{}');
          this.handleSyncMessage(message);
        } catch (error) {
          console.warn('Failed to parse sync message:', error);
        }
      }
    });
  }

  private handleNotificationClick(data: any): void {
    console.log('🔔 Notification clicked:', data);

    switch (data.action) {
      case 'view_chart':
        // Navigate to chart view
        window.location.href = `/chart/${data.chartId || ''}`;
        break;
      case 'read':
        // Navigate to horoscope
        window.location.href = '/horoscope';
        break;
      case 'start_session':
        // Cross-app navigation to HealWave
        window.location.href = '/healwave/session';
        break;
      default:
        // Default action - go to dashboard
        window.location.href = '/dashboard';
    }
  }

  private handleSyncMessage(message: any): void {
    console.log('🔄 Sync message received:', message.type);

    switch (message.type) {
      case 'cosmichub-sync-chart_synced':
        this.notifyChartCalculationComplete(message.data);
        break;
      case 'cosmichub-sync-user_data_synced':
        console.log('User data synced successfully');
        break;
    }
  }

  // Utility methods
  private getUserBirthData(): any {
    // In a real implementation, get from user profile or local storage
    try {
      const stored = localStorage.getItem('cosmichub-birth-data');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Public API
  getPushManager(): PushNotificationManager {
    return this.pushManager;
  }

  getBackgroundSync() {
    return this.backgroundSync;
  }

  getNotificationStatus() {
    return {
      pushNotifications: this.pushManager.getNotificationStats(),
      backgroundSync: this.backgroundSync.getSyncStatus(),
      userId: this.currentUserId
    };
  }

  // Notification testing
  async sendTestNotification(): Promise<void> {
    await this.pushManager.queueNotification({
      title: '🧪 CosmicHub Test',
      body: 'This is a test notification from your astrology app. Everything is working perfectly!',
      tag: 'test-notification',
      urgency: 'low',
      actions: [
        { action: 'dismiss', title: 'Dismiss', icon: '/icons/close.png' }
      ]
    });
  }

  // Smart notification suggestions
  async getSmartSuggestions(): Promise<any> {
    if (!this.currentUserId) return {};

    return this.pushManager.suggestNotificationSettings(this.currentUserId);
  }
}

// Singleton instance
let notificationManager: CosmicHubNotificationManager | null = null;

export const getNotificationManager = (): CosmicHubNotificationManager => {
  if (!notificationManager) {
    notificationManager = new CosmicHubNotificationManager();
  }
  return notificationManager;
};

// Initialize on app load
export const initializeNotifications = async (userId?: string): Promise<boolean> => {
  const manager = getNotificationManager();
  return manager.initialize(userId);
};

export default CosmicHubNotificationManager;
