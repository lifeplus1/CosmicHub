// Notification Types
export type NotificationFrequency = 'daily' | 'instant' | 'hourly' | 'weekly';

export interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

export interface NotificationPreferences {
  dailyHoroscope: boolean;
  transitAlerts: boolean;
  frequencyReminders: boolean;
  appUpdates: boolean;
  frequency: NotificationFrequency;
  quietHours: QuietHours;
  maxDailyNotifications: number;
}

export interface SyncMessageData {
  type: 'cosmichub-sync-chart_synced' | 'cosmichub-sync-user_data_synced';
  data?: unknown;
}

export interface ChartData {
  id: string;
  [key: string]: unknown;
}
