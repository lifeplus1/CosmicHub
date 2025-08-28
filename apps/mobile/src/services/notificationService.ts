import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

export interface NotificationPreferences {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  dailyTransitsEnabled: boolean;
  specificTransitsEnabled: boolean;
}

export class NotificationService {
  private preferences: NotificationPreferences = {
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    dailyTransitsEnabled: true,
    specificTransitsEnabled: true,
  };

  private pushToken: string | null = null;

  constructor() {
    void this.initializeNotifications();
    void this.loadPreferences();
  }

  /**
   * Initialize notification system
   */
  private async initializeNotifications(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== Notifications.PermissionStatus.GRANTED) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Notification permission not granted');
        }
        return;
      }

      // Get push token for remote notifications
      const tokenData = await Notifications.getExpoPushTokenAsync();
      this.pushToken = tokenData.data;

      if (process.env.NODE_ENV === 'development') {
        console.log('Notifications initialized successfully');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to initialize notifications:', error);
      }
    }
  }

  /**
   * Load preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<NotificationPreferences>;
        this.preferences = { ...this.preferences, ...parsed };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load notification preferences:', error);
      }
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'notification_preferences',
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to save notification preferences:', error);
      }
    }
  }

  /**
   * Schedule a simple notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    triggerDate?: Date,
    data?: Record<string, unknown>
  ): Promise<string> {
    const trigger = triggerDate ? null : null; // Use null for immediate, or configure properly

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        sound: this.preferences.soundEnabled,
      },
      trigger,
    });
  }

  /**
   * Schedule a daily transit notification
   */
  async scheduleDailyTransit(
    title: string = 'Daily Cosmic Forecast',
    body: string = 'Check your daily insights',
    hour: number = 9,
    minute: number = 0,
    additionalData?: Record<string, unknown>
  ): Promise<string> {
    if (!this.preferences.dailyTransitsEnabled) {
      throw new Error('Daily transit notifications are disabled');
    }

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    } as const;

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          type: 'daily_transit',
          hour,
          minute,
          ...(additionalData ?? {}),
        },
        sound: this.preferences.soundEnabled,
      },
      trigger,
    });
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    newPreferences: Partial<NotificationPreferences>
  ): Promise<void> {
    this.preferences = { ...this.preferences, ...newPreferences };
    await this.savePreferences();
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Get push token for remote notifications
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
