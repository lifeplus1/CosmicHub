/**
 * Example Integration: Using Push Notifications in CosmicHub Components
 * This shows how to integrate the notification system into your existing components
 */

import React, { useEffect, useState } from 'react';
import { getNotificationManager } from '../services/notificationManager';

// Example: Chart Calculation Component with Notifications
export const ChartCalculationWithNotifications: React.FC = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [notificationManager] = useState(() => getNotificationManager());

  const calculateChart = async (birthData: any) => {
    setIsCalculating(true);
    
    try {
      // Start calculation
      const calculationPromise = fetch('/api/charts/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(birthData)
      });

      // Queue for background sync in case of network issues
      await notificationManager.syncChartCalculation({
        userId: birthData.userId,
        birthData,
        timestamp: Date.now()
      });

      const result = await calculationPromise;
      const chartData = await result.json();

      // Notify user of completion
      await notificationManager.notifyChartCalculationComplete(chartData);
      
      setIsCalculating(false);
      return chartData;

    } catch (error) {
      setIsCalculating(false);
      
      // Notification for error (will sync when online)
      await notificationManager.getPushManager().queueNotification({
        title: '⚠️ Chart Calculation Queued',
        body: 'Your chart will be calculated when connection is restored.',
        tag: 'chart-queued',
        urgency: 'normal'
      });
      
      throw error;
    }
  };

  return (
    <div className="chart-calculation">
      <button 
        onClick={() => calculateChart({ userId: 'user123', /* birth data */ })}
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
  const [notificationManager] = useState(() => getNotificationManager());
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    // Load notification status
    const loadStatus = () => {
      const currentStatus = notificationManager.getNotificationStatus();
      setStatus(currentStatus);
    };

    loadStatus();
    
    // Update status every 10 seconds
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, [notificationManager]);

  const handleSubscribe = async () => {
    const success = await notificationManager.subscribeUser('user123', {
      dailyHoroscope: true,
      transitAlerts: true,
      frequencyReminders: false,
      appUpdates: true,
      quietHours: { enabled: true, start: '22:00', end: '08:00' },
      frequency: 'daily' as const
    });

    if (success) {
      // Send welcome notification
      await notificationManager.sendTestNotification();
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
              {status.backgroundSync?.isOnline ? '🌐' : '📴'}
            </div>
            <div className="text-sm">Connection Status</div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-yellow-600">
              {status.backgroundSync?.queuedItems || 0}
            </div>
            <div className="text-sm">Queued Items</div>
          </div>
          
          <div className="p-4 bg-gray-100 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {status.pushNotifications?.activeSubscriptions || 0}
            </div>
            <div className="text-sm">Active Devices</div>
          </div>
        </div>
      </div>

      <div className="notification-actions">
        <button
          onClick={handleSubscribe}
          className="px-4 py-2 bg-green-600 text-white rounded mr-4"
        >
          Enable Notifications
        </button>
        
        <button
          onClick={() => notificationManager.sendTestNotification()}
          className="px-4 py-2 bg-blue-600 text-white rounded mr-4"
        >
          Test Notification
        </button>
        
        <button
          onClick={() => notificationManager.getSmartSuggestions()}
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationManager] = useState(() => getNotificationManager());

  useEffect(() => {
    // Listen for background sync events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.startsWith('cosmichub-sync-') && event.newValue) {
        try {
          const message = JSON.parse(event.newValue);
          
          // Add to notification feed
          setNotifications(prev => [{
            id: Date.now(),
            type: message.type,
            data: message.data,
            timestamp: message.timestamp
          }, ...prev.slice(0, 9)]); // Keep last 10
          
        } catch (error) {
          console.warn('Failed to parse sync message:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Simulate some notifications for demo
    const demoNotifications = [
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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const triggerTransitAlert = async () => {
    await notificationManager.notifyTransitAlert(
      'Mars',
      'opposition to Venus',
      'This could bring intensity to relationships and creative projects.'
    );
  };

  const triggerDailyHoroscope = async () => {
    await notificationManager.notifyDailyHoroscope(
      'Gemini',
      'Communication flows easily today. Trust your intuition in conversations.'
    );
  };

  return (
    <div className="dashboard">
      <div className="notification-feed mb-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        
        <div className="space-y-2">
          {notifications.map(notification => (
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
            onClick={triggerTransitAlert}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            🪐 Transit Alert
          </button>
          
          <button
            onClick={triggerDailyHoroscope}
            className="px-4 py-2 bg-yellow-600 text-white rounded"
          >
            ✨ Daily Horoscope
          </button>
          
          <button
            onClick={() => notificationManager.notifyRetrograde('Mercury', 'entering')}
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
export const useNotifications = () => {
  const [manager] = useState(() => getNotificationManager());
  const [status, setStatus] = useState<any>({});

  useEffect(() => {
    const updateStatus = () => {
      setStatus(manager.getNotificationStatus());
    };
    
    updateStatus();
    const interval = setInterval(updateStatus, 5000);
    
    return () => clearInterval(interval);
  }, [manager]);

  return {
    manager,
    status,
    isOnline: status.backgroundSync?.isOnline || false,
    hasPermission: status.pushNotifications?.permissionStatus === 'granted',
    queuedItems: status.backgroundSync?.queuedItems || 0,
    
    // Helper methods
    subscribe: (userId: string, preferences?: any) => 
      manager.subscribeUser(userId, preferences),
    
    unsubscribe: () => manager.unsubscribeUser(),
    
    sendTest: () => manager.sendTestNotification(),
    
    notifyChart: (chartData: any) => 
      manager.notifyChartCalculationComplete(chartData),
    
    syncChart: (chartData: any) => 
      manager.syncChartCalculation(chartData)
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
