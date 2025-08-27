// Notification Types

export interface QuietHours {
  start: string;
  end: string;
}

export interface NotificationPreferences {
  transitAlerts: boolean;
  frequencyReminders: boolean;
  appUpdates: boolean;
  frequency: NotificationFrequency;
  quietHours: QuietHours;
  maxDailyNotifications: number;
}

export interface NotificationPayload {
  data?: unknown;
}

export interface NotificationFrequency {
  [key: string]: unknown;
}
