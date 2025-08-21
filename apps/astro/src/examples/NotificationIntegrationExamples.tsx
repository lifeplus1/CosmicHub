/**
 * Example Integration: Using Push Notifications in CosmicHub Components
 * This shows how to integrate the notification system into your existing components
 */

import React, { useEffect, useState, type ReactElement } from 'react';
import { getNotificationManager } from '../services/notificationManager';
import { devConsole } from '../config/environment';
import type { NotificationPreferences } from '@cosmichub/config';
import type { ChartData } from '../types/notifications';

// Type definitions
interface BirthData {
  userId: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  [key: string]: unknown;
}

interface NotificationStatus {
  pushNotifications?: {
    permissionStatus: string;
    activeSubscriptions?: number;
  };
  backgroundSync?: {
    isOnline: boolean;
    queuedItems?: number;
  };
}

type NotificationType = 'chart_synced' | 'user_data_synced';
interface NotificationItem {
  id: number;
  type: NotificationType;
  data: Record<string, unknown>;
  timestamp: number;
}

interface StorageMessage {
  type: 'cosmichub-sync-chart_synced' | 'cosmichub-sync-user_data_synced';
  data?: unknown;
  timestamp: number;
}

interface UserPreferences {
  dailyHoroscope: boolean;
  transitAlerts: boolean;
  frequencyReminders: boolean;
  appUpdates: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'daily' | 'weekly' | 'monthly';
}

// (Removed MinimalChartData – using ChartData directly via guard)

// Type guard functions
function isValidChartData(data: unknown): data is ChartData {
  if (typeof data !== 'object' || data === null) return false;
  return 'id' in data && typeof (data as { id: unknown }).id === 'string';
}

// Example: Chart Calculation Component with Notifications
export const ChartCalculationWithNotifications: React.FC = () => {
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [notificationManager] = useState<ReturnType<typeof getNotificationManager>>((): ReturnType<typeof getNotificationManager> => getNotificationManager());

  const calculateChart = async (birthData: BirthData): Promise<ChartData | null> => {
    setIsCalculating(true);
    
    try {
      // Start calculation
      const calculationPromise = fetch('/api/charts/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthData)
      });

      // Queue for background sync in case of network issues
      // Optional background sync if API exists
      const maybeSync = (notificationManager as unknown as { syncChartCalculation?: (data: { userId: string; birthData: BirthData; timestamp: number })=>Promise<void> }).syncChartCalculation;
      if (typeof maybeSync === 'function') {
        await maybeSync({ userId: birthData.userId, birthData, timestamp: Date.now() });
      }

      const result = await calculationPromise;
      const chartData: unknown = await result.json();
      
      // Notify chart completion using the correct method
      if (isValidChartData(chartData)) {
        await notificationManager.notifyChartReady(chartData);
        setIsCalculating(false);
        return chartData;
      }
      setIsCalculating(false);
      return null;

    } catch (error) {
      setIsCalculating(false);
      
      // Error handling - notification manager doesn't support direct queue access
       
      console.error('Chart calculation failed:', error);
      
      throw error;
    }
  };

  const handleCalculateChart = (): void => {
    void calculateChart({ userId: 'user123' /* birth data */ });
  };

  return (
    <div className="chart-calculation">
      <button 
        onClick={handleCalculateChart}
        disabled={isCalculating}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
      >
        {isCalculating ? 'Calculating...' : 'Calculate Chart'}
      </button>
    </div>
  );
};

// Example: User Settings Page with Notification Preferences
export const UserSettingsWithNotifications: React.FC = () => {
  const [notificationManager] = useState<ReturnType<typeof getNotificationManager>>((): ReturnType<typeof getNotificationManager> => getNotificationManager());
  const [status, setStatus] = useState<NotificationStatus>({});

  useEffect((): (() => void) => {
    // Load notification status
  const loadStatus = (): void => {
  const raw = notificationManager.status() as unknown as { push?: Record<string, unknown>; background?: Record<string, unknown> };
      const push = raw.push ?? {};
      const background = raw.background ?? {};
      const permissionStatus = typeof push.permissionStatus === 'string' ? push.permissionStatus : undefined;
  const pushNotifications = (permissionStatus !== undefined && permissionStatus !== '') ? {
        permissionStatus,
        activeSubscriptions: typeof push.activeSubscriptions === 'number' ? push.activeSubscriptions : undefined
      } : undefined;
      const isOnline = typeof background.isOnline === 'boolean' ? background.isOnline : undefined;
  const backgroundSync = (isOnline !== undefined) ? {
        isOnline,
        queuedItems: typeof background.queuedItems === 'number' ? background.queuedItems : undefined
      } : undefined;
      setStatus({ pushNotifications, backgroundSync });
    };

    loadStatus();
    
    // Update status every 10 seconds
  const interval = setInterval((): void => { loadStatus(); }, 10000);
  return () => { clearInterval(interval); };
  }, [notificationManager]);

  const handleSubscribe = async (): Promise<void> => {
  const success = await notificationManager.subscribe('user123', {
      dailyHoroscope: true,
      transitAlerts: true,
      frequencyReminders: false,
      appUpdates: true,
  quietHours: { enabled: true, start: '22:00', end: '08:00' },
  frequency: 'daily' as const,
  maxDailyNotifications: 5
  } satisfies NotificationPreferences);

    if (success === true) {
      // Send welcome notification
      await notificationManager.sendTest();
    }
  };

  return (
    <div className="user-settings">
      <div className="notification-status mb-6">
        <h3 className="text-lg font-semibold mb-4">Notification Status</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-blue-600">
              {status.pushNotifications?.permissionStatus === 'granted' ? '✅' : '❌'}
            </div>
            <div className="text-sm">Push Permission</div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-green-600">
              {status.backgroundSync?.isOnline === true ? '🌐' : '📴'}
            </div>
            <div className="text-sm">Connection Status</div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-yellow-600">
              {status.backgroundSync?.queuedItems ?? 0}
            </div>
            <div className="text-sm">Queued Items</div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {status.pushNotifications?.activeSubscriptions ?? 0}
            </div>
            <div className="text-sm">Active Devices</div>
          </div>
        </div>
      </div>

      <div className="notification-actions">
        <button
          onClick={(): void => { void handleSubscribe(); }}
          className="px-4 py-2 bg-green-600 text-white rounded mr-4"
        >
          Enable Notifications
        </button>
        
        <button
          onClick={(): void => { void notificationManager.sendTest(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-4"
        >
          Test Notification
        </button>
        
        <button
          onClick={(): void => { 
            // getSmartSuggestions method not available in current implementation
             
            console.log('Smart setup not yet implemented');
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Smart Setup
        </button>
      </div>
    </div>
  );
};

// Example: Dashboard with Real-time Notifications
export const DashboardWithNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect((): (() => void) => {
    // Listen for background sync events
  const handleStorageChange = (event: StorageEvent): void => {
      if (typeof event.key === 'string' && event.key.startsWith('cosmichub-sync-') && typeof event.newValue === 'string' && event.newValue.length > 0) {
        try {
          const parsed: unknown = JSON.parse(event.newValue);
          if (parsed === null || typeof parsed !== 'object') return;
          const maybe = parsed as { type?: unknown; timestamp?: unknown; data?: unknown };
          if (maybe.type === 'cosmichub-sync-chart_synced' || maybe.type === 'cosmichub-sync-user_data_synced') {
            if (typeof maybe.timestamp !== 'number') return;
            const msg: StorageMessage = { type: maybe.type, timestamp: maybe.timestamp, data: maybe.data };
            setNotifications((prev: NotificationItem[]): NotificationItem[] => [{
              id: Date.now(),
              type: msg.type === 'cosmichub-sync-chart_synced' ? 'chart_synced' : 'user_data_synced',
              data: (msg.data !== undefined && msg.data !== null && typeof msg.data === 'object') ? (msg.data as Record<string, unknown>) : {},
              timestamp: msg.timestamp
            }, ...prev.slice(0, 9)]);
          }
        } catch (error) {
          devConsole.warn?.('Failed to parse sync message:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Simulate some notifications for demo
    const demoNotifications: NotificationItem[] = [
      {
        id: 1,
        type: 'chart_synced',
        data: { chartId: 'chart123' },
        timestamp: Date.now() - 300000 // 5 minutes ago
      },
      {
        id: 2,
        type: 'user_data_synced',
        data: { userId: 'user123' },
        timestamp: Date.now() - 600000 // 10 minutes ago
      }
    ];
    
    setNotifications(demoNotifications);

  return () => { window.removeEventListener('storage', handleStorageChange); };
  }, []);

  const triggerTransitAlert = (): void => {
    devConsole.debug?.('Transit alert demo');
  };

  const triggerDailyHoroscope = (): void => {
    devConsole.debug?.('Daily horoscope demo');
  };

  return (
    <div className="dashboard">
      <div className="notification-feed mb-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {notifications.map((notification: NotificationItem): ReactElement => (
            <div 
              key={notification.id}
              className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {notification.type === 'chart_synced' && '📊 Chart Synchronized'}
                    {notification.type === 'user_data_synced' && '👤 Profile Updated'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-xs text-blue-600">
                  ✅ Synced
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

  <div className="demo-triggers">
        <h3 className="text-lg font-semibold mb-4">Demo Notifications</h3>
        
        <div className="space-x-4">
          <button
            onClick={(): void => { void triggerTransitAlert(); }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            🪐 Transit Alert
          </button>
          
          <button
            onClick={(): void => { void triggerDailyHoroscope(); }}
            className="px-4 py-2 bg-yellow-600 text-white rounded"
          >
            ✨ Daily Horoscope
          </button>
          
          <button
            onClick={(): void => { 
              // notifyRetrograde method not available in current implementation
              devConsole.debug?.('Retrograde alert demo: Mercury entering retrograde');
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            ↩️ Retrograde Alert
          </button>
        </div>
      </div>
    </div>
  );
};

// Example: Hook for using notifications in any component
interface UseNotificationsReturn {
  manager: ReturnType<typeof getNotificationManager>;
  status: NotificationStatus;
  isOnline: boolean;
  hasPermission: boolean;
  queuedItems: number;
  subscribe: (userId: string, preferences?: UserPreferences) => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTest: () => Promise<boolean>;
  notifyChart: (chartData: unknown) => Promise<void>;
  syncChart: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [manager] = useState<ReturnType<typeof getNotificationManager>>((): ReturnType<typeof getNotificationManager> => getNotificationManager());
  const [status, setStatus] = useState<NotificationStatus>({});

  useEffect((): (() => void) => {
  const updateStatus = (): void => {
  const raw = manager.status() as unknown as { push?: Record<string, unknown>; background?: Record<string, unknown> };
      const push = raw.push ?? {};
      const background = raw.background ?? {};
      const permVal = typeof push.permissionStatus === 'string' ? push.permissionStatus : undefined;
  const pushNotifications = (permVal !== undefined && permVal !== '') ? {
        permissionStatus: permVal,
        activeSubscriptions: typeof push.activeSubscriptions === 'number' ? push.activeSubscriptions : undefined
      } : undefined;
      const onlineVal = typeof background.isOnline === 'boolean' ? background.isOnline : undefined;
  const backgroundSync = (onlineVal !== undefined) ? {
        isOnline: onlineVal,
        queuedItems: typeof background.queuedItems === 'number' ? background.queuedItems : undefined
      } : undefined;
      setStatus({ pushNotifications, backgroundSync });
    };
    
    updateStatus();
  const interval = setInterval((): void => { updateStatus(); }, 5000);
    
  return () => { clearInterval(interval); };
  }, [manager]);

  return {
  manager,
  status,
  isOnline: (status.backgroundSync?.isOnline === true),
  hasPermission: (status.pushNotifications?.permissionStatus === 'granted'),
  queuedItems: status.backgroundSync?.queuedItems ?? 0,
    
    // Helper methods
  subscribe: (userId: string, preferences?: UserPreferences): Promise<boolean> => manager.subscribe(userId, preferences),
    
  unsubscribe: (): Promise<boolean> => Promise.resolve(true),
    
  sendTest: (): Promise<boolean> => manager.sendTest(),
    
  notifyChart: (chartData: unknown): Promise<void> => {
      if (isValidChartData(chartData)) {
        return manager.notifyChartReady(chartData);
      }
      return Promise.resolve();
    },
    
    syncChart: (): Promise<void> => {
      // syncChartCalculation method not available in current implementation
      devConsole.debug?.('Sync chart not yet implemented');
      return Promise.resolve();
    }
  };
};

// Example usage in any component:
/*
function MyComponent() {
  const { 
    hasPermission, 
    isOnline, 
    queuedItems, 
    subscribe, 
    sendTest 
  } = useNotifications();

  return (
    <div>
      <p>Permission: {hasPermission ? '✅' : '❌'}</p>
      <p>Online: {isOnline ? '🌐' : '📴'}</p>
      <p>Queued: {queuedItems}</p>
      
      <button onClick={() => subscribe('user123')}>
        Enable Notifications
      </button>
      
      <button onClick={sendTest}>
        Test Notification
      </button>
    </div>
  );
}
*/
