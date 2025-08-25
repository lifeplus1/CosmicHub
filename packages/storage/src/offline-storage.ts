/**
 * Offline Storage for Chart Data
 * Provides IndexedDB storage for chart data with sync capabilities
 */

// Simple console logger for this package
const log = {
  info: (message: string, ...args: unknown[]) =>
    console.log(`📂 [OfflineStorage] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) =>
    console.warn(`⚠️ [OfflineStorage] ${message}`, ...args),
  error: (message: string, ...args: unknown[]) =>
    console.error(`❌ [OfflineStorage] ${message}`, ...args),
};

// Helper function to create proper Error objects from IndexedDB errors
const createIndexedDBError = (
  message: string,
  originalError?: unknown
): Error => {
  if (originalError instanceof Error) {
    return new Error(`${message}: ${originalError.message}`);
  }
  if (
    originalError &&
    typeof originalError === 'object' &&
    'message' in originalError
  ) {
    return new Error(
      `${message}: ${String((originalError as { message: unknown }).message)}`
    );
  }
  const errorDetails = originalError
    ? JSON.stringify(originalError)
    : 'Unknown IndexedDB error';
  return new Error(`${message}: ${errorDetails}`);
};

export interface OfflineChart {
  id: string;
  userId: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  chart_type: string;
  chart_data: unknown; // ChartData from api.types
  birth_data: unknown; // ChartBirthData from types
  created_at: string;
  updated_at: string;
  synced: boolean;
  offline_created: boolean;
  priority: 'high' | 'medium' | 'low'; // For cache eviction
  last_accessed: string;
  cache_metadata: {
    size_bytes: number;
    version: number;
  };
}

export interface OfflineSyncItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  chart_data: Partial<OfflineChart>;
  timestamp: number;
  attempts: number;
  max_attempts: number;
  error_message?: string;
}

export interface StorageQuota {
  used: number;
  available: number;
  percentage: number;
}

export interface OfflineStorageStats {
  total_charts: number;
  synced_charts: number;
  unsynced_charts: number;
  pending_sync_items: number;
  storage_quota: StorageQuota;
  last_sync: string | null;
}

export class OfflineChartStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'CosmicHubOfflineCharts';
  private readonly DB_VERSION = 2;
  private readonly CHARTS_STORE = 'charts';
  private readonly SYNC_STORE = 'sync_queue';
  private readonly MAX_CACHE_SIZE_MB = 50; // 50MB limit
  private readonly MAX_CHARTS = 100; // Maximum cached charts

  constructor() {
    this.initializeDB().catch(error => {
      log.error('Failed to initialize offline storage:', error);
    });
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      log.info('Initializing offline chart storage...');

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        log.error('Failed to open IndexedDB:', request.error);
        reject(
          new Error(
            `Failed to open IndexedDB: ${request.error?.message ?? 'Unknown error'}`
          )
        );
      };

      request.onblocked = () => {
        log.warn('IndexedDB upgrade blocked by another tab');
      };

      request.onsuccess = () => {
        this.db = request.result;
        log.info('Offline chart storage initialized');
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        log.info(
          `Upgrading IndexedDB from version ${event.oldVersion} to ${event.newVersion}`
        );

        // Charts object store
        if (!db.objectStoreNames.contains(this.CHARTS_STORE)) {
          const chartsStore = db.createObjectStore(this.CHARTS_STORE, {
            keyPath: 'id',
          });
          chartsStore.createIndex('userId', 'userId', { unique: false });
          chartsStore.createIndex('synced', 'synced', { unique: false });
          chartsStore.createIndex('last_accessed', 'last_accessed', {
            unique: false,
          });
          chartsStore.createIndex('priority', 'priority', { unique: false });
          chartsStore.createIndex('created_at', 'created_at', {
            unique: false,
          });
        }

        // Sync queue object store
        if (!db.objectStoreNames.contains(this.SYNC_STORE)) {
          const syncStore = db.createObjectStore(this.SYNC_STORE, {
            keyPath: 'id',
          });
          syncStore.createIndex('action', 'action', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('attempts', 'attempts', { unique: false });
        }
      };
    });
  }

  /**
   * Save chart to offline storage
   */
  async saveChart(chart: Partial<OfflineChart>): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const chartId = chart.id ?? this.generateId();
    const now = new Date().toISOString();

    const offlineChart: OfflineChart = {
      id: chartId,
      userId: chart.userId ?? '',
      name: chart.name ?? 'Unnamed Chart',
      birth_date: chart.birth_date ?? '',
      birth_time: chart.birth_time ?? '',
      birth_location: chart.birth_location ?? '',
      chart_type: chart.chart_type ?? 'natal',
      chart_data: chart.chart_data ?? {},
      birth_data: chart.birth_data ?? {},
      created_at: chart.created_at ?? now,
      updated_at: now,
      synced: chart.synced ?? false,
      offline_created: chart.offline_created ?? true,
      priority: chart.priority ?? 'medium',
      last_accessed: now,
      cache_metadata: {
        size_bytes: this.calculateChartSize(chart),
        version: 1,
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.CHARTS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(this.CHARTS_STORE);

      transaction.oncomplete = () => {
        log.info(`Chart saved offline: ${chartId}`);
        this.enforceStorageLimits().catch(error => {
          log.warn('Failed to enforce storage limits:', error);
        });
        resolve(chartId);
      };

      transaction.onerror = () => {
        log.error('Failed to save chart offline:', transaction.error);
        reject(
          createIndexedDBError(
            'Failed to save chart offline',
            transaction.error
          )
        );
      };

      store.put(offlineChart);
    });
  }

  /**
   * Get chart from offline storage
   */
  async getChart(chartId: string): Promise<OfflineChart | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.CHARTS_STORE], 'readonly');
      const store = transaction.objectStore(this.CHARTS_STORE);
      const request = store.get(chartId);

      request.onsuccess = () => {
        const chart = request.result as OfflineChart | undefined;
        if (chart) {
          // Update last accessed time
          this.updateLastAccessed(chartId);
        }
        resolve(chart ?? null);
      };

      request.onerror = () => {
        log.error('Failed to get chart from offline storage:', request.error);
        reject(
          createIndexedDBError(
            'Failed to get chart from offline storage',
            request.error
          )
        );
      };
    });
  }

  /**
   * Get all charts for a user
   */
  async getUserCharts(userId: string): Promise<OfflineChart[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.CHARTS_STORE], 'readonly');
      const store = transaction.objectStore(this.CHARTS_STORE);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const charts = (request.result as OfflineChart[]) ?? [];
        // Sort by last accessed (most recent first)
        charts.sort(
          (a, b) =>
            new Date(b.last_accessed).getTime() -
            new Date(a.last_accessed).getTime()
        );
        resolve(charts);
      };

      request.onerror = () => {
        log.error(
          'Failed to get user charts from offline storage:',
          request.error
        );
        reject(
          createIndexedDBError(
            'Failed to get user charts from offline storage',
            request.error
          )
        );
      };
    });
  }

  /**
   * Delete chart from offline storage
   */
  async deleteChart(chartId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.CHARTS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(this.CHARTS_STORE);

      transaction.oncomplete = () => {
        log.info(`Chart deleted from offline storage: ${chartId}`);
        resolve();
      };

      transaction.onerror = () => {
        log.error(
          'Failed to delete chart from offline storage:',
          transaction.error
        );
        reject(
          createIndexedDBError(
            'Failed to delete chart from offline storage',
            transaction.error
          )
        );
      };

      store.delete(chartId);
    });
  }

  /**
   * Add item to sync queue
   */
  async addToSyncQueue(
    action: 'create' | 'update' | 'delete',
    chartData: Partial<OfflineChart>
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const syncItem: OfflineSyncItem = {
      id: this.generateId(),
      action,
      chart_data: chartData,
      timestamp: Date.now(),
      attempts: 0,
      max_attempts: 3,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SYNC_STORE], 'readwrite');
      const store = transaction.objectStore(this.SYNC_STORE);

      transaction.oncomplete = () => {
        log.info(`Added to sync queue: ${action} chart ${chartData.id}`);
        resolve();
      };

      transaction.onerror = () => {
        log.error('Failed to add to sync queue:', transaction.error);
        reject(
          createIndexedDBError('Failed to add to sync queue', transaction.error)
        );
      };

      store.put(syncItem);
    });
  }

  /**
   * Get all pending sync items
   */
  async getPendingSyncItems(): Promise<OfflineSyncItem[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SYNC_STORE], 'readonly');
      const store = transaction.objectStore(this.SYNC_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const items = (request.result as OfflineSyncItem[]) ?? [];
        // Sort by timestamp (oldest first)
        items.sort((a, b) => a.timestamp - b.timestamp);
        resolve(items);
      };

      request.onerror = () => {
        log.error('Failed to get pending sync items:', request.error);
        reject(
          createIndexedDBError(
            'Failed to get pending sync items',
            request.error
          )
        );
      };
    });
  }

  /**
   * Remove item from sync queue
   */
  async removeFromSyncQueue(syncItemId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SYNC_STORE], 'readwrite');
      const store = transaction.objectStore(this.SYNC_STORE);

      transaction.oncomplete = () => {
        log.info(`Removed from sync queue: ${syncItemId}`);
        resolve();
      };

      transaction.onerror = () => {
        log.error('Failed to remove from sync queue:', transaction.error);
        reject(
          createIndexedDBError(
            'Failed to remove from sync queue',
            transaction.error
          )
        );
      };

      store.delete(syncItemId);
    });
  }

  /**
   * Update sync item (increment attempts, add error message)
   */
  async updateSyncItem(
    syncItemId: string,
    updates: Partial<OfflineSyncItem>
  ): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.SYNC_STORE], 'readwrite');
      const store = transaction.objectStore(this.SYNC_STORE);

      const getRequest = store.get(syncItemId);
      getRequest.onsuccess = () => {
        const syncItem = getRequest.result as OfflineSyncItem;
        if (!syncItem) {
          reject(new Error(`Sync item not found: ${syncItemId}`));
          return;
        }

        const updatedItem = { ...syncItem, ...updates };
        const putRequest = store.put(updatedItem);

        putRequest.onsuccess = () => {
          log.info(`Updated sync item: ${syncItemId}`);
          resolve();
        };

        putRequest.onerror = () => {
          reject(
            createIndexedDBError('Failed to update sync item', putRequest.error)
          );
        };
      };

      getRequest.onerror = () => {
        reject(
          createIndexedDBError(
            'Failed to get sync item for update',
            getRequest.error
          )
        );
      };
    });
  }

  /**
   * Mark chart as synced
   */
  async markChartAsSynced(chartId: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.CHARTS_STORE],
        'readwrite'
      );
      const store = transaction.objectStore(this.CHARTS_STORE);

      const getRequest = store.get(chartId);
      getRequest.onsuccess = () => {
        const chart = getRequest.result as OfflineChart;
        if (!chart) {
          resolve(); // Chart doesn't exist, consider it synced
          return;
        }

        chart.synced = true;
        chart.updated_at = new Date().toISOString();

        const putRequest = store.put(chart);
        putRequest.onsuccess = () => {
          log.info(`Chart marked as synced: ${chartId}`);
          resolve();
        };

        putRequest.onerror = () => {
          reject(
            createIndexedDBError(
              'Failed to mark chart as synced',
              putRequest.error
            )
          );
        };
      };

      getRequest.onerror = () => {
        reject(
          createIndexedDBError(
            'Failed to get chart for sync marking',
            getRequest.error
          )
        );
      };
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<OfflineStorageStats> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const [charts, syncItems, quota] = await Promise.all([
      this.getAllCharts(),
      this.getPendingSyncItems(),
      this.getStorageQuota(),
    ]);

    const syncedCharts = charts.filter(c => c.synced).length;
    const lastSyncTimes = syncItems.map(s => s.timestamp);
    const lastSync =
      lastSyncTimes.length > 0
        ? new Date(Math.max(...lastSyncTimes)).toISOString()
        : null;

    return {
      total_charts: charts.length,
      synced_charts: syncedCharts,
      unsynced_charts: charts.length - syncedCharts,
      pending_sync_items: syncItems.length,
      storage_quota: quota,
      last_sync: lastSync,
    };
  }

  /**
   * Clear all offline data
   */
  async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.CHARTS_STORE, this.SYNC_STORE],
        'readwrite'
      );

      transaction.oncomplete = () => {
        log.info('All offline data cleared');
        resolve();
      };

      transaction.onerror = () => {
        log.error('Failed to clear offline data:', transaction.error);
        reject(
          createIndexedDBError(
            'Failed to clear offline data',
            transaction.error
          )
        );
      };

      transaction.objectStore(this.CHARTS_STORE).clear();
      transaction.objectStore(this.SYNC_STORE).clear();
    });
  }

  /**
   * Export offline data for backup
   */
  async exportData(): Promise<{
    charts: OfflineChart[];
    syncItems: OfflineSyncItem[];
  }> {
    const [charts, syncItems] = await Promise.all([
      this.getAllCharts(),
      this.getPendingSyncItems(),
    ]);

    return { charts, syncItems };
  }

  /**
   * Import offline data from backup
   */
  async importData(data: {
    charts: OfflineChart[];
    syncItems: OfflineSyncItem[];
  }): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [this.CHARTS_STORE, this.SYNC_STORE],
        'readwrite'
      );

      transaction.oncomplete = () => {
        log.info(
          `Imported ${data.charts.length} charts and ${data.syncItems.length} sync items`
        );
        resolve();
      };

      transaction.onerror = () => {
        log.error('Failed to import data:', transaction.error);
        reject(
          createIndexedDBError('Failed to import data', transaction.error)
        );
      };

      const chartsStore = transaction.objectStore(this.CHARTS_STORE);
      const syncStore = transaction.objectStore(this.SYNC_STORE);

      // Import charts
      for (const chart of data.charts) {
        chartsStore.put(chart);
      }

      // Import sync items
      for (const syncItem of data.syncItems) {
        syncStore.put(syncItem);
      }
    });
  }

  // Private helper methods

  private async getAllCharts(): Promise<OfflineChart[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.CHARTS_STORE], 'readonly');
      const store = transaction.objectStore(this.CHARTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve((request.result as OfflineChart[]) ?? []);
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to get all charts', request.error));
      };
    });
  }

  private updateLastAccessed(chartId: string): void {
    if (!this.db) return;

    const transaction = this.db.transaction([this.CHARTS_STORE], 'readwrite');
    const store = transaction.objectStore(this.CHARTS_STORE);

    const getRequest = store.get(chartId);
    getRequest.onsuccess = () => {
      const chart = getRequest.result as OfflineChart;
      if (chart) {
        chart.last_accessed = new Date().toISOString();
        store.put(chart);
      }
    };
  }

  private async getStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage ?? 0;
        const available = estimate.quota ?? 0;
        const percentage = available > 0 ? (used / available) * 100 : 0;

        return {
          used,
          available,
          percentage: Math.round(percentage * 100) / 100,
        };
      } catch (error) {
        log.warn('Failed to get storage estimate:', error);
      }
    }

    return {
      used: 0,
      available: 0,
      percentage: 0,
    };
  }

  private calculateChartSize(chart: Partial<OfflineChart>): number {
    try {
      return new Blob([JSON.stringify(chart)]).size;
    } catch {
      return 1024; // 1KB fallback
    }
  }

  private async enforceStorageLimits(): Promise<void> {
    const charts = await this.getAllCharts();

    // Check if we need to evict old charts
    if (charts.length <= this.MAX_CHARTS) {
      return;
    }

    // Sort by priority and last accessed (evict low priority, old charts first)
    const sortedCharts = charts.sort((a, b) => {
      const priorityWeight = { low: 1, medium: 2, high: 3 };
      const aPriority = priorityWeight[a.priority];
      const bPriority = priorityWeight[b.priority];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return (
        new Date(a.last_accessed).getTime() -
        new Date(b.last_accessed).getTime()
      );
    });

    // Evict excess charts
    const chartsToEvict = sortedCharts.slice(
      0,
      sortedCharts.length - this.MAX_CHARTS
    );

    for (const chart of chartsToEvict) {
      if (!chart.synced) {
        // Don't evict unsynced charts
        continue;
      }
      await this.deleteChart(chart.id);
      log.info(`Evicted chart from cache: ${chart.name} (${chart.id})`);
    }
  }

  private generateId(): string {
    return `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
let offlineStorageInstance: OfflineChartStorage | null = null;

export const getOfflineStorage = (): OfflineChartStorage => {
  offlineStorageInstance ??= new OfflineChartStorage();
  return offlineStorageInstance;
};

// Convenience functions
export const saveChartOffline = (
  chart: Partial<OfflineChart>
): Promise<string> => {
  return getOfflineStorage().saveChart(chart);
};

export const getChartOffline = (
  chartId: string
): Promise<OfflineChart | null> => {
  return getOfflineStorage().getChart(chartId);
};

export const getUserChartsOffline = (
  userId: string
): Promise<OfflineChart[]> => {
  return getOfflineStorage().getUserCharts(userId);
};

export const deleteChartOffline = (chartId: string): Promise<void> => {
  return getOfflineStorage().deleteChart(chartId);
};
