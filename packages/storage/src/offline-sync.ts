/**
 * Offline Sync Manager
 * Handles synchronization between offline storage and online APIs
 */

import { getOfflineStorage, type OfflineChart, type OfflineSyncItem } from './offline-storage';

// Simple logger
const log = {
  info: (message: string, ...args: unknown[]) => console.log(`🔄 [OfflineSync] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`⚠️ [OfflineSync] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`❌ [OfflineSync] ${message}`, ...args)
};

export interface SyncResult {
  success: boolean;
  synced_items: number;
  failed_items: number;
  errors: string[];
}

export interface NetworkStatus {
  online: boolean;
  connection: 'fast' | 'slow' | 'offline';
  lastChecked: string;
}

export class OfflineSyncManager {
  private storage = getOfflineStorage();
  private syncInProgress = false;
  private networkStatus: NetworkStatus = {
    online: navigator.onLine,
    connection: 'fast',
    lastChecked: new Date().toISOString()
  };
  private readonly SYNC_INTERVAL_MS = 30000; // 30 seconds
  private syncIntervalId: number | null = null;

  constructor() {
    this.initializeNetworkListener();
    this.startPeriodicSync();
  }

  /**
   * Initialize network status listener
   */
  private initializeNetworkListener(): void {
    window.addEventListener('online', () => {
      log.info('Network connection restored');
      this.networkStatus.online = true;
      this.networkStatus.lastChecked = new Date().toISOString();
      this.updateConnectionType();
      // Trigger immediate sync when coming online
      this.syncOfflineData().catch(error => {
        log.error('Auto-sync failed after network restoration:', error);
      });
    });

    window.addEventListener('offline', () => {
      log.warn('Network connection lost - entering offline mode');
      this.networkStatus.online = false;
      this.networkStatus.connection = 'offline';
      this.networkStatus.lastChecked = new Date().toISOString();
    });

    // Initial connection type detection
    this.updateConnectionType();
  }

  /**
   * Update connection type based on network information
   */
  private updateConnectionType(): void {
    if (!this.networkStatus.online) {
      this.networkStatus.connection = 'offline';
      return;
    }

    // Use Network Information API if available
    const connection = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    if (connection?.effectiveType) {
      const effectiveType = connection.effectiveType;
      this.networkStatus.connection = ['4g', 'fast'].includes(effectiveType) ? 'fast' : 'slow';
    } else {
      // Fallback to online status
      this.networkStatus.connection = this.networkStatus.online ? 'fast' : 'offline';
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = window.setInterval(() => {
      if (this.networkStatus.online && !this.syncInProgress) {
        this.syncOfflineData().catch(error => {
          log.warn('Periodic sync failed:', error);
        });
      }
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop periodic sync
   */
  public stopPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Get current network status
   */
  public getNetworkStatus(): NetworkStatus {
    this.updateConnectionType();
    return { ...this.networkStatus };
  }

  /**
   * Save chart with offline support
   */
  public async saveChartWithSync(chartData: unknown, birthData: unknown, userId: string): Promise<string> {
    const chartId = await this.storage.saveChart({
      userId,
      name: `Chart ${new Date().toLocaleDateString()}`,
      birth_date: '',
      birth_time: '',
      birth_location: '',
      chart_type: 'natal',
      chart_data: chartData,
      birth_data: birthData,
      synced: false,
      offline_created: true,
      priority: 'high' // New charts are high priority
    });

    // Add to sync queue
    await this.storage.addToSyncQueue('create', {
      id: chartId,
      userId,
      chart_data: chartData,
      birth_data: birthData
    });

    // Trigger sync if online
    if (this.networkStatus.online) {
      this.syncOfflineData().catch(error => {
        log.warn('Failed to sync newly created chart:', error);
      });
    }

    return chartId;
  }

  /**
   * Delete chart with offline support
   */
  public async deleteChartWithSync(chartId: string): Promise<void> {
    const chart = await this.storage.getChart(chartId);
    if (!chart) {
      throw new Error('Chart not found');
    }

    // If chart is synced, add delete to sync queue
    if (chart.synced) {
      await this.storage.addToSyncQueue('delete', { id: chartId });
    }

    // Remove from local storage
    await this.storage.deleteChart(chartId);

    // Trigger sync if online
    if (this.networkStatus.online) {
      this.syncOfflineData().catch(error => {
        log.warn('Failed to sync chart deletion:', error);
      });
    }
  }

  /**
   * Get user charts with offline fallback
   */
  public async getUserCharts(userId: string, tryOnlineFirst = true): Promise<OfflineChart[]> {
    // If offline or user doesn't want online-first, return offline data
    if (!this.networkStatus.online || !tryOnlineFirst) {
      return this.storage.getUserCharts(userId);
    }

    try {
      // Try to fetch from online API first
      // This would integrate with the actual API service
      // For now, return offline data
      const offlineCharts = await this.storage.getUserCharts(userId);
      
      // Trigger background sync to update data
      this.syncOfflineData().catch(error => {
        log.warn('Background sync failed while getting user charts:', error);
      });

      return offlineCharts;
    } catch (error) {
      log.warn('Failed to fetch charts online, falling back to offline:', error);
      return this.storage.getUserCharts(userId);
    }
  }

  /**
   * Sync all offline data with the server
   */
  public async syncOfflineData(): Promise<SyncResult> {
    if (this.syncInProgress) {
      log.info('Sync already in progress, skipping');
      return {
        success: false,
        synced_items: 0,
        failed_items: 0,
        errors: ['Sync already in progress']
      };
    }

    if (!this.networkStatus.online) {
      log.info('Device offline, skipping sync');
      return {
        success: false,
        synced_items: 0,
        failed_items: 0,
        errors: ['Device is offline']
      };
    }

    this.syncInProgress = true;
    log.info('Starting offline data sync...');

    const result: SyncResult = {
      success: true,
      synced_items: 0,
      failed_items: 0,
      errors: []
    };

    try {
      const pendingItems = await this.storage.getPendingSyncItems();
      log.info(`Found ${pendingItems.length} items to sync`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          result.synced_items++;
          
          // Remove successfully synced item
          await this.storage.removeFromSyncQueue(item.id);
          
          // Mark chart as synced if it was a create/update operation
          if (item.action !== 'delete' && item.chart_data.id) {
            await this.storage.markChartAsSynced(item.chart_data.id);
          }
          
        } catch (error) {
          result.failed_items++;
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Failed to sync ${item.action} for chart ${item.chart_data.id}: ${errorMessage}`);
          
          // Increment attempt count
          const updatedAttempts = item.attempts + 1;
          
          if (updatedAttempts >= item.max_attempts) {
            log.error(`Max retry attempts reached for sync item ${item.id}, removing from queue`);
            await this.storage.removeFromSyncQueue(item.id);
          } else {
            await this.storage.updateSyncItem(item.id, {
              attempts: updatedAttempts,
              error_message: errorMessage
            });
          }
        }
      }

      if (result.failed_items > 0) {
        result.success = false;
        log.warn(`Sync completed with ${result.failed_items} failures out of ${pendingItems.length} items`);
      } else {
        log.info(`Sync completed successfully: ${result.synced_items} items synced`);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      log.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * Sync a single item
   */
  private async syncItem(item: OfflineSyncItem): Promise<void> {
    log.info(`Syncing ${item.action} for chart ${item.chart_data.id}`);

    // In a real implementation, this would call the actual API
    // For now, we'll simulate the API calls
    
    switch (item.action) {
      case 'create':
        await this.syncCreateChart(item);
        break;
      case 'update':
        await this.syncUpdateChart(item);
        break;
      case 'delete':
        await this.syncDeleteChart(item);
        break;
      default: {
        // This should never happen if all cases are covered
        const action = item.action as string;
        throw new Error(`Unknown sync action: ${action}`);
      }
    }
  }

  /**
   * Sync chart creation to server
   */
  private async syncCreateChart(item: OfflineSyncItem): Promise<void> {
    // Simulate API call
    const delay = this.networkStatus.connection === 'slow' ? 2000 : 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // In real implementation, this would:
    // 1. Convert OfflineChart to SaveChartRequest format
    // 2. Call the saveChart API
    // 3. Update local chart with server-assigned ID if needed
    // 4. Handle any server-side validation errors

    log.info(`Chart created on server: ${item.chart_data.id}`);
  }

  /**
   * Sync chart update to server
   */
  private async syncUpdateChart(item: OfflineSyncItem): Promise<void> {
    // Simulate API call
    const delay = this.networkStatus.connection === 'slow' ? 2000 : 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    log.info(`Chart updated on server: ${item.chart_data.id}`);
  }

  /**
   * Sync chart deletion to server
   */
  private async syncDeleteChart(item: OfflineSyncItem): Promise<void> {
    // Simulate API call
    const delay = this.networkStatus.connection === 'slow' ? 1000 : 200;
    await new Promise(resolve => setTimeout(resolve, delay));

    log.info(`Chart deleted from server: ${item.chart_data.id}`);
  }

  /**
   * Force sync all data (manual trigger)
   */
  public async forceSyncAll(): Promise<SyncResult> {
    log.info('Force sync triggered by user');
    return this.syncOfflineData();
  }

  /**
   * Get sync statistics
   */
  public async getSyncStats(): Promise<{
    pending_items: number;
    last_sync: string | null;
    sync_in_progress: boolean;
    network_status: NetworkStatus;
  }> {
    const stats = await this.storage.getStorageStats();
    
    return {
      pending_items: stats.pending_sync_items,
      last_sync: stats.last_sync,
      sync_in_progress: this.syncInProgress,
      network_status: this.getNetworkStatus()
    };
  }

  /**
   * Clear all offline data and sync queue
   */
  public async clearAllOfflineData(): Promise<void> {
    await this.storage.clearAllData();
    log.info('All offline data cleared');
  }
}

// Singleton instance
let syncManagerInstance: OfflineSyncManager | null = null;

export const getOfflineSyncManager = (): OfflineSyncManager => {
  syncManagerInstance ??= new OfflineSyncManager();
  return syncManagerInstance;
};

// Convenience functions
export const saveChartOfflineWithSync = (chartData: unknown, birthData: unknown, userId: string): Promise<string> => {
  return getOfflineSyncManager().saveChartWithSync(chartData, birthData, userId);
};

export const deleteChartOfflineWithSync = (chartId: string): Promise<void> => {
  return getOfflineSyncManager().deleteChartWithSync(chartId);
};

export const getUserChartsOffline = (userId: string, tryOnlineFirst = true): Promise<OfflineChart[]> => {
  return getOfflineSyncManager().getUserCharts(userId, tryOnlineFirst);
};

export const forceSyncOfflineData = (): Promise<SyncResult> => {
  return getOfflineSyncManager().forceSyncAll();
};
