/**
 * Notification Settings Component for CosmicHub
 * Allows users to manage push notification preferences
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DefaultNotificationPreferences, type PushNotificationManager, type NotificationPreferences, type NotificationStats } from '@cosmichub/config';
import { devConsole } from '../config/environment';

// Using shared NotificationStats

interface NotificationSettingsProps {
  userId: string;
  pushManager: PushNotificationManager;
  onSettingsChange?: (preferences: NotificationPreferences) => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  userId,
  pushManager,
  onSettingsChange
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DefaultNotificationPreferences);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [stats, setStats] = useState<NotificationStats>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    queuedNotifications: 0,
    permissionStatus: 'default',
    totalSent: 0,
    totalDelivered: 0,
    totalClicked: 0,
    avgDeliveryTime: 0,
    errors: 0
  });

  const loadCurrentSettings = useCallback((): void => {
    const stored = localStorage.getItem(`cosmichub-notification-prefs-${userId}`);
    if (stored !== null && stored !== undefined && stored.length > 0) {
  let parsed: unknown;
  try { parsed = JSON.parse(stored) as unknown; } catch { return; }
  if (isNotificationPreferences(parsed)) setPreferences(parsed);
    }
  }, [userId]);

  const checkNotificationStatus = useCallback((): void => {
    setPermissionStatus(Notification.permission);
    navigator.serviceWorker.ready
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => {
            setIsSubscribed(subscription !== null && subscription !== undefined);
      })
      .catch(err => devConsole.warn?.('Subscription status check failed', err));
  }, []);

  const loadStats = useCallback((): void => {
    try {
  const notificationStats = pushManager.getNotificationStats() as Partial<NotificationStats>;
      if (notificationStats !== null && notificationStats !== undefined && typeof notificationStats.totalSubscriptions === 'number') {
  setStats((prev: NotificationStats) => ({
          ...prev,
          ...notificationStats,
          totalSent: notificationStats.totalSent ?? prev.totalSent,
          totalDelivered: notificationStats.totalDelivered ?? prev.totalDelivered,
          totalClicked: notificationStats.totalClicked ?? prev.totalClicked,
          avgDeliveryTime: notificationStats.avgDeliveryTime ?? prev.avgDeliveryTime,
          errors: notificationStats.errors ?? prev.errors
        }));
      }
    } catch (err) {
      devConsole.warn('Failed to load notification stats', err);
    }
  }, [pushManager]);

  useEffect(() => {
    void loadCurrentSettings();
    checkNotificationStatus();
    loadStats();
  }, [loadCurrentSettings, checkNotificationStatus, loadStats]);

  const handleSubscribe = async (): Promise<void> => {
    setIsLoading(true);
    try {
  const subscription = await pushManager.subscribeUser(userId, preferences);
  setIsSubscribed(subscription !== null);
      
    if (subscription !== null && subscription !== undefined) {
        // Show welcome notification
        await pushManager.queueNotification({
          title: '🔔 Notifications Enabled!',
          body: 'You\u2019ll now receive personalized cosmic insights and healing reminders.',
          tag: 'welcome-notification',
          urgency: 'low'
        });
      }
    } catch (error) {
      devConsole.error('Failed to subscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await pushManager.unsubscribeUser(userId);
      setIsSubscribed(false);
    } catch (error) {
      devConsole.error('Failed to unsubscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (updates: Partial<NotificationPreferences>): void => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    // Save locally
    localStorage.setItem(`cosmichub-notification-prefs-${userId}`, JSON.stringify(newPreferences));
    
    // Update with push manager if subscribed
    if (isSubscribed === true) {
      pushManager.updateUserPreferences(userId, updates);
    }
    
    // Notify parent component
    onSettingsChange?.(newPreferences);
  };

  const testNotification = async (): Promise<void> => {
    await pushManager.queueNotification({
      title: '🧪 Test Notification',
      body: 'This is a test notification to check your settings.',
      tag: 'test-notification',
      urgency: 'low'
    });
  };

  const getSuggestedSettings = async (): Promise<void> => {
    const suggestions = await pushManager.suggestNotificationSettings(userId);
    if (Object.keys(suggestions).length > 0) {
      updatePreferences(suggestions);
    }
  };

  // Runtime type guard for NotificationPreferences
  function isNotificationPreferences(value: unknown): value is NotificationPreferences {
    if (value === null || typeof value !== 'object') return false;
    const v = value as Record<string, unknown>;
    return (
  typeof v['dailyHoroscope'] === 'boolean' &&
  typeof v['transitAlerts'] === 'boolean' &&
  typeof v['frequencyReminders'] === 'boolean' &&
  typeof v['appUpdates'] === 'boolean' &&
  typeof v['frequency'] === 'string' &&
  typeof v['quietHours'] === 'object' && v['quietHours'] !== null &&
  typeof (v['quietHours'] as Record<string, unknown>)['enabled'] === 'boolean'
    );
  }

  return (
    <div className="notification-settings p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔔 Notification Settings
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => { void testNotification(); }}
            disabled={!isSubscribed}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Test
          </button>
          <button
            onClick={() => { void getSuggestedSettings(); }}
            className="px-3 py-1 text-sm bg-purple-500 text-white rounded"
          >
            Smart Setup
          </button>
        </div>
      </div>

      {/* Permission Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Permission Status
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {permissionStatus === 'granted' ? '✅ Notifications enabled' : permissionStatus === 'denied' ? '❌ Notifications blocked' : '⏳ Not requested yet'}
            </p>
          </div>
          
  {isSubscribed === false ? (
            <button
              onClick={() => { void handleSubscribe(); }}
              disabled={isLoading || permissionStatus === 'denied'}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </button>
          ) : (
            <button
              onClick={() => { void handleUnsubscribe(); }}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              {isLoading ? 'Disabling...' : 'Disable Notifications'}
            </button>
          )}
        </div>
      </div>

      {/* Notification Types */}
      {isSubscribed === true && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Types
            </h3>
            
            <div className="space-y-4">
              <label htmlFor="pref-dailyHoroscope" aria-label="Daily Horoscope preference" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ✨ Daily Horoscope
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive personalized daily cosmic insights
                  </p>
                </div>
                <input
                  type="checkbox"
          id="pref-dailyHoroscope"
                  checked={preferences.dailyHoroscope}
                  onChange={(e) => updatePreferences({ dailyHoroscope: e.target.checked })}
                  className="w-5 h-5 text-purple-600"
                />
              </label>

              <label htmlFor="pref-transitAlerts" aria-label="Transit Alerts preference" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    🪐 Transit Alerts
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get notified about important planetary movements
                  </p>
                </div>
                <input
                  type="checkbox"
          id="pref-transitAlerts"
                  checked={preferences.transitAlerts}
                  onChange={(e) => updatePreferences({ transitAlerts: e.target.checked })}
                  className="w-5 h-5 text-purple-600"
                />
              </label>

              <label htmlFor="pref-frequencyReminders" aria-label="Frequency Reminders preference" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    🎧 Frequency Reminders
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Reminders for your healing sessions and therapy
                  </p>
                </div>
                <input
                  type="checkbox"
          id="pref-frequencyReminders"
                  checked={preferences.frequencyReminders}
                  onChange={(e) => updatePreferences({ frequencyReminders: e.target.checked })}
                  className="w-5 h-5 text-purple-600"
                />
              </label>

              <label htmlFor="pref-appUpdates" aria-label="App Updates preference" className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    📱 App Updates
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Important updates and new features
                  </p>
                </div>
                <input
                  type="checkbox"
          id="pref-appUpdates"
                  checked={preferences.appUpdates}
                  onChange={(e) => updatePreferences({ appUpdates: e.target.checked })}
                  className="w-5 h-5 text-purple-600"
                />
              </label>
            </div>
          </div>

          {/* Frequency Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Frequency
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['instant', 'hourly', 'daily', 'weekly'] as const).map(freq => (
        <label key={freq} htmlFor={`frequency-${freq}`} className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <input
                    type="radio"
                    name="frequency"
                    value={freq}
                    checked={preferences.frequency === freq}
          id={`frequency-${freq}`}
          onChange={() => updatePreferences({ frequency: freq })}
                    className="mr-2 text-purple-600"
                  />
                  <span className="text-sm capitalize text-gray-900 dark:text-white">
                    {freq}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quiet Hours
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.quietHours.enabled}
                  onChange={(e) => updatePreferences({
                    quietHours: { ...preferences.quietHours, enabled: e.target.checked }
                  })}
                  className="mr-3 w-5 h-5 text-purple-600"
                />
                <span className="text-gray-900 dark:text-white">
                  Enable quiet hours (no notifications during specified times)
                </span>
              </label>

              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="quiet-start-time">
                      Start Time
                    </label>
                    <input
                      type="time"
                          id="quiet-start-time"
                          value={preferences.quietHours.start}
                      onChange={(e) => updatePreferences({
                        quietHours: { ...preferences.quietHours, start: e.target.value }
                      })}
                      aria-label="Quiet hours start time"
                      className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="quiet-end-time">
                      End Time
                    </label>
                    <input
                      type="time"
                          id="quiet-end-time"
                          value={preferences.quietHours.end}
                      onChange={(e) => updatePreferences({
                        quietHours: { ...preferences.quietHours, end: e.target.value }
                      })}
                      aria-label="Quiet hours end time"
                      className="w-full p-2 border rounded dark:bg-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notification Statistics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {Number.isFinite(stats.totalSubscriptions) ? stats.totalSubscriptions : 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  Total Devices
                </div>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {Number.isFinite(stats.activeSubscriptions) ? stats.activeSubscriptions : 0}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  Active Devices
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                  {Number.isFinite(stats.queuedNotifications) ? stats.queuedNotifications : 0}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300">
                  Queued
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                  {stats.permissionStatus === 'granted' ? '✅' : '❌'}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300">
                  Permission
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Pro Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Enable notifications for the best CosmicHub experience</li>
          <li>• Use quiet hours to avoid late-night notifications</li>
          <li>• Smart Setup analyzes your usage to suggest optimal settings</li>
          <li>• Test notifications to ensure they&apos;re working properly</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationSettings;
