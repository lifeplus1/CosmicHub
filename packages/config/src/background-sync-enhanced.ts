/**
 * Enhanced Background Sync for CosmicHub
 * Extends the existing service worker with smart sync capabilities
 */

import { PushNotificationManager, NotificationPayload } from './push-notifications';

export interface SyncQueueItem {
  id: string;
  type: 'chart_calculation' | 'user_data' | 'frequency_session' | 'notification';
  data: any;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  priority: 'low' | 'normal' | 'high';
  maxRetries: number;
  retryCount: number;
  createdAt: number;
  nextRetryAt: number;
}

export interface SyncResult {
  success: boolean;
  data?: any;
  error?: string;
  retryAfter?: number;
}

export interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export class AdvancedBackgroundSync {
  private syncQueue: SyncQueueItem[] = [];
  private offlineActions: OfflineAction[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private pushNotificationManager?: PushNotificationManager;

  constructor() {
    this.setupConnectionListener();
    this.loadPersistedData();
    this.startPeriodicSync();
  }

  // Initialize with push notification manager
  setPushNotificationManager(manager: PushNotificationManager): void {
    this.pushNotificationManager = manager;
  }

  // Add item to sync queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'retryCount' | 'createdAt' | 'nextRetryAt'>): Promise<string> {
    const syncItem: SyncQueueItem = {
      id: this.generateId(),
      retryCount: 0,
      createdAt: Date.now(),
      nextRetryAt: Date.now(),
      ...item
    };

    this.syncQueue.push(syncItem);
    this.persistSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }

    console.log(`📤 Added to sync queue: ${item.type} (${syncItem.id})`);
    return syncItem.id;
  }

  // Add offline action for later sync
  addOfflineAction(type: string, data: any): string {
    const action: OfflineAction = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    this.offlineActions.push(action);
    this.persistOfflineActions();

    console.log(`💾 Stored offline action: ${type} (${action.id})`);
    return action.id;
  }

  // Process sync queue
  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    const now = Date.now();
    const itemsToSync = this.syncQueue
      .filter(item => item.nextRetryAt <= now)
      .sort((a, b) => {
        // Sort by priority, then by creation time
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.createdAt - b.createdAt;
      });

    console.log(`🔄 Processing ${itemsToSync.length} sync items...`);

    for (const item of itemsToSync) {
      try {
        const result = await this.syncItem(item);
        
        if (result.success) {
          this.removeSyncItem(item.id);
          await this.handleSyncSuccess(item, result);
        } else {
          await this.handleSyncFailure(item, result);
        }
      } catch (error) {
        await this.handleSyncFailure(item, { success: false, error: String(error) });
      }
    }

    this.syncInProgress = false;
    this.persistSyncQueue();

    // Send notification about sync completion if there were items
    if (itemsToSync.length > 0) {
      await this.notifySyncComplete(itemsToSync.length);
    }
  }

  // Sync individual item
  private async syncItem(item: SyncQueueItem): Promise<SyncResult> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add authentication if available
      const authToken = localStorage.getItem('cosmichub-auth-token');
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const requestOptions: RequestInit = {
        method: item.method,
        headers,
        body: item.method !== 'GET' ? JSON.stringify(item.data) : undefined
      };

      const response = await fetch(item.url, requestOptions);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorText = await response.text();
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${errorText}`,
          retryAfter: this.getRetryDelay(item.retryCount + 1)
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: String(error),
        retryAfter: this.getRetryDelay(item.retryCount + 1)
      };
    }
  }

  // Handle successful sync
  private async handleSyncSuccess(item: SyncQueueItem, result: SyncResult): Promise<void> {
    console.log(`✅ Sync successful: ${item.type} (${item.id})`);

    // Handle different sync types
    switch (item.type) {
      case 'chart_calculation':
        await this.handleChartSyncSuccess(item, result);
        break;
      case 'user_data':
        await this.handleUserDataSyncSuccess(item, result);
        break;
      case 'frequency_session':
        await this.handleFrequencySyncSuccess(item, result);
        break;
      case 'notification':
        console.log('📨 Notification sync successful');
        break;
    }
  }

  // Handle sync failure
  private async handleSyncFailure(item: SyncQueueItem, result: SyncResult): Promise<void> {
    item.retryCount++;

    if (item.retryCount >= item.maxRetries) {
      console.error(`💥 Sync failed permanently: ${item.type} (${item.id})`);
      this.removeSyncItem(item.id);
      await this.notifyPermanentFailure(item);
    } else {
      const retryDelay = result.retryAfter || this.getRetryDelay(item.retryCount);
      item.nextRetryAt = Date.now() + retryDelay;
      console.warn(`⚠️ Sync failed, retrying in ${retryDelay}ms: ${item.type} (${item.id})`);
    }
  }

  // Specific sync success handlers
  private async handleChartSyncSuccess(item: SyncQueueItem, result: SyncResult): Promise<void> {
    // Broadcast chart data to other tabs/apps
    this.broadcastMessage('chart_synced', {
      chartId: item.data.chartId,
      result: result.data
    });

    // Show success notification
    if (this.pushNotificationManager) {
      await this.pushNotificationManager.queueNotification({
        title: '📊 Chart Calculation Complete',
        body: 'Your astrology chart has been calculated and synced successfully.',
        tag: 'chart-sync-success',
        urgency: 'low'
      });
    }
  }

  private async handleUserDataSyncSuccess(item: SyncQueueItem, result: SyncResult): Promise<void> {
    // Update local storage with synced data
    const userData = result.data;
    if (userData) {
      localStorage.setItem('cosmichub-user-data', JSON.stringify(userData));
    }

    this.broadcastMessage('user_data_synced', userData);
  }

  private async handleFrequencySyncSuccess(item: SyncQueueItem, result: SyncResult): Promise<void> {
    // Mark offline actions as synced
    const sessionId = item.data.sessionId;
    this.offlineActions
      .filter(action => action.data.sessionId === sessionId)
      .forEach(action => action.synced = true);

    this.persistOfflineActions();

    // Show success notification
    if (this.pushNotificationManager) {
      await this.pushNotificationManager.queueNotification({
        title: '🎧 Session Data Synced',
        body: 'Your frequency therapy session has been saved to your profile.',
        tag: 'frequency-sync-success',
        urgency: 'low'
      });
    }
  }

  // Smart retry delay calculation
  private getRetryDelay(retryCount: number): number {
    // Exponential backoff with jitter: base * 2^retry + random jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 300000; // 5 minutes
    const exponentialDelay = baseDelay * Math.pow(2, retryCount - 1);
    const jitter = Math.random() * 1000; // 0-1 second jitter
    
    return Math.min(exponentialDelay + jitter, maxDelay);
  }

  // Connection status management
  private setupConnectionListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Back online - starting sync...');
      
      // Wait a moment for the connection to stabilize
      setTimeout(() => {
        this.processSyncQueue();
      }, 1000);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.syncInProgress = false;
      console.log('📴 Gone offline - queuing actions...');
    });
  }

  // Periodic sync for reliability
  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress && this.syncQueue.length > 0) {
        console.log('⏰ Periodic sync check...');
        this.processSyncQueue();
      }
    }, 30000); // Every 30 seconds
  }

  // Cross-tab communication
  private broadcastMessage(type: string, data: any): void {
    const message = {
      type: `cosmichub-sync-${type}`,
      data,
      timestamp: Date.now()
    };

    try {
      localStorage.setItem(`cosmichub-broadcast-${Date.now()}`, JSON.stringify(message));
      
      // Clean up old broadcast messages
      setTimeout(() => {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('cosmichub-broadcast-'));
        keys.forEach(key => {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (Date.now() - parsed.timestamp > 10000) { // 10 seconds old
              localStorage.removeItem(key);
            }
          }
        });
      }, 1000);
    } catch (error) {
      console.warn('Failed to broadcast sync message:', error);
    }
  }

  // Notification helpers
  private async notifySyncComplete(itemCount: number): Promise<void> {
    if (this.pushNotificationManager && itemCount > 0) {
      await this.pushNotificationManager.queueNotification({
        title: '🔄 Sync Complete',
        body: `Successfully synced ${itemCount} items with the server.`,
        tag: 'sync-complete',
        urgency: 'low'
      });
    }
  }

  private async notifyPermanentFailure(item: SyncQueueItem): Promise<void> {
    if (this.pushNotificationManager) {
      await this.pushNotificationManager.queueNotification({
        title: '⚠️ Sync Failed',
        body: `Unable to sync ${item.type}. Please check your connection and try again.`,
        tag: 'sync-failed',
        urgency: 'normal'
      });
    }
  }

  // Utility methods
  private generateId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private removeSyncItem(id: string): void {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
  }

  // Persistence
  private persistSyncQueue(): void {
    try {
      localStorage.setItem('cosmichub-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to persist sync queue:', error);
    }
  }

  private persistOfflineActions(): void {
    try {
      localStorage.setItem('cosmichub-offline-actions', JSON.stringify(this.offlineActions));
    } catch (error) {
      console.warn('Failed to persist offline actions:', error);
    }
  }

  private loadPersistedData(): void {
    try {
      // Load sync queue
      const queueData = localStorage.getItem('cosmichub-sync-queue');
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }

      // Load offline actions
      const actionsData = localStorage.getItem('cosmichub-offline-actions');
      if (actionsData) {
        this.offlineActions = JSON.parse(actionsData);
      }

      console.log(`📂 Loaded ${this.syncQueue.length} queued items and ${this.offlineActions.length} offline actions`);
    } catch (error) {
      console.warn('Failed to load persisted sync data:', error);
    }
  }

  // Public API for getting status
  getSyncStatus(): {
    isOnline: boolean;
    syncInProgress: boolean;
    queuedItems: number;
    offlineActions: number;
    failedItems: number;
  } {
    const failedItems = this.syncQueue.filter(item => item.retryCount >= item.maxRetries).length;

    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queuedItems: this.syncQueue.length,
      offlineActions: this.offlineActions.filter(action => !action.synced).length,
      failedItems
    };
  }

  // Clear all sync data (for logout, etc.)
  clearSyncData(): void {
    this.syncQueue = [];
    this.offlineActions = [];
    this.persistSyncQueue();
    this.persistOfflineActions();
    console.log('🗑️ Cleared all sync data');
  }
}

// Helper functions for easy integration
export const CosmicHubSyncHelpers = {
  // Queue chart calculation for sync
  queueChartCalculation: async (chartData: any, userId: string): Promise<string> => {
    const syncManager = new AdvancedBackgroundSync();
    return syncManager.addToSyncQueue({
      type: 'chart_calculation',
      data: { ...chartData, userId },
      url: '/api/charts/calculate',
      method: 'POST',
      priority: 'high',
      maxRetries: 3
    });
  },

  // Queue user data update
  queueUserDataUpdate: async (userData: any): Promise<string> => {
    const syncManager = new AdvancedBackgroundSync();
    return syncManager.addToSyncQueue({
      type: 'user_data',
      data: userData,
      url: '/api/user/update',
      method: 'PUT',
      priority: 'normal',
      maxRetries: 5
    });
  },

  // Queue frequency session save
  queueFrequencySession: async (sessionData: any): Promise<string> => {
    const syncManager = new AdvancedBackgroundSync();
    return syncManager.addToSyncQueue({
      type: 'frequency_session',
      data: sessionData,
      url: '/api/healwave/sessions',
      method: 'POST',
      priority: 'normal',
      maxRetries: 3
    });
  }
};

// Singleton instance
let backgroundSyncInstance: AdvancedBackgroundSync | null = null;

export const getBackgroundSyncManager = (): AdvancedBackgroundSync => {
  if (!backgroundSyncInstance) {
    backgroundSyncInstance = new AdvancedBackgroundSync();
  }
  return backgroundSyncInstance;
};
