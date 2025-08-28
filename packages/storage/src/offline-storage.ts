/**
 * Offline Storage for Chart Data
 * Provides IndexedDB storage with enhanced serialization for chart data with sync capabilities
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

interface StorageQuota {
  used: number;
  available: number;
  total: number;
}

interface OfflineChart {
  id: string;
  userId: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  chart_type: string;
  chart_data: unknown;
  birth_data: unknown;
  synced: boolean;
  offline_created: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

interface StorageStats {
  synced_charts: number;
  unsynced_charts: number;
  pending_sync_items: number;
  storage_quota: StorageQuota;
  last_sync: string | null;
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

class OfflineChartStorage {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'CosmicHub_Offline';
  private readonly DB_VERSION = 1;

  constructor() {
    void this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(createIndexedDBError('Failed to open IndexedDB', request.error));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Charts store
        if (!db.objectStoreNames.contains('charts')) {
          const chartsStore = db.createObjectStore('charts', { keyPath: 'id' });
          chartsStore.createIndex('userId', 'userId', { unique: false });
          chartsStore.createIndex('synced', 'synced', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
          syncStore.createIndex('action', 'action', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveChart(chart: Omit<OfflineChart, 'id'> & { id?: string }): Promise<string> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['charts'], 'readwrite');
      const store = transaction.objectStore('charts');

      const chartId = chart.id ?? `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const chartWithId = { ...chart, id: chartId };

      const request = store.put(chartWithId);

      request.onsuccess = () => {
        log.info(`Chart saved offline: ${chartId}`);
        resolve(chartId);
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to save chart', request.error));
      };
    });
  }

  async getChart(chartId: string): Promise<OfflineChart | null> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['charts'], 'readonly');
      const store = transaction.objectStore('charts');
      const request = store.get(chartId);

      request.onsuccess = () => {
        resolve(request.result as OfflineChart ?? null);
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to get chart', request.error));
      };
    });
  }

  async getUserCharts(userId: string): Promise<OfflineChart[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['charts'], 'readonly');
      const store = transaction.objectStore('charts');
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to get user charts', request.error));
      };
    });
  }

  async deleteChart(chartId: string): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['charts'], 'readwrite');
      const store = transaction.objectStore('charts');
      const request = store.delete(chartId);

      request.onsuccess = () => {
        log.info(`Chart deleted offline: ${chartId}`);
        resolve();
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to delete chart', request.error));
      };
    });
  }

  async addToSyncQueue(action: 'create' | 'update' | 'delete', chartData: Partial<OfflineChart>): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const syncItem: OfflineSyncItem = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action,
        chart_data: chartData,
        timestamp: Date.now(),
        attempts: 0,
        max_attempts: 3,
      };

      const request = store.put(syncItem);

      request.onsuccess = () => {
        log.info(`Added to sync queue: ${action} for chart ${chartData.id}`);
        resolve();
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to add to sync queue', request.error));
      };
    });
  }

  async getPendingSyncItems(): Promise<OfflineSyncItem[]> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to get pending sync items', request.error));
      };
    });
  }

  async removeFromSyncQueue(itemId: string): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(itemId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(createIndexedDBError('Failed to remove from sync queue', request.error));
      };
    });
  }

  async updateSyncItem(itemId: string, updates: Partial<OfflineSyncItem>): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');

      const getRequest = store.get(itemId);

      getRequest.onsuccess = () => {
        const existingItem = getRequest.result as OfflineSyncItem;
        if (!existingItem) {
          reject(new Error(`Sync item ${itemId} not found`));
          return;
        }

        const updatedItem = { ...existingItem, ...updates };
        const putRequest = store.put(updatedItem);

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = () => {
          reject(createIndexedDBError('Failed to update sync item', putRequest.error));
        };
      };

      getRequest.onerror = () => {
        reject(createIndexedDBError('Failed to get sync item for update', getRequest.error));
      };
    });
  }

  async markChartAsSynced(chartId: string): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['charts'], 'readwrite');
      const store = transaction.objectStore('charts');

      const getRequest = store.get(chartId);

      getRequest.onsuccess = () => {
        const chart = getRequest.result as OfflineChart;
        if (!chart) {
          reject(new Error(`Chart ${chartId} not found`));
          return;
        }

        const updatedChart = { ...chart, synced: true };
        const putRequest = store.put(updatedChart);

        putRequest.onsuccess = () => {
          resolve();
        };

        putRequest.onerror = () => {
          reject(createIndexedDBError('Failed to mark chart as synced', putRequest.error));
        };
      };

      getRequest.onerror = () => {
        reject(createIndexedDBError('Failed to get chart for sync update', getRequest.error));
      };
    });
  }

  async getStorageStats(): Promise<StorageStats> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['charts', 'syncQueue'], 'readonly');
      const chartsStore = transaction.objectStore('charts');
      const syncStore = transaction.objectStore('syncQueue');

      let syncedCharts = 0;
      let unsyncedCharts = 0;
      let pendingSyncItems = 0;
      const lastSync: string | null = null;

      // Count synced and unsynced charts
      const syncedRequest = chartsStore.index('synced').count(IDBKeyRange.only(true));
      syncedRequest.onsuccess = () => {
        syncedCharts = syncedRequest.result;
      };

      const unsyncedRequest = chartsStore.index('synced').count(IDBKeyRange.only(false));
      unsyncedRequest.onsuccess = () => {
        unsyncedCharts = unsyncedRequest.result;
      };

      // Count pending sync items
      const syncCountRequest = syncStore.count();
      syncCountRequest.onsuccess = () => {
        pendingSyncItems = syncCountRequest.result;
      };

      transaction.oncomplete = () => {
        // Get storage quota (simplified)
        const storageQuota: StorageQuota = {
          used: 0, // Would need to calculate actual usage
          available: 0, // Would need to get from navigator.storage
          total: 0,
        };

        resolve({
          synced_charts: syncedCharts,
          unsynced_charts: unsyncedCharts,
          pending_sync_items: pendingSyncItems,
          storage_quota: storageQuota,
          last_sync: lastSync,
        });
      };

      transaction.onerror = () => {
        reject(createIndexedDBError('Failed to get storage stats', transaction.error));
      };
    });
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['charts', 'syncQueue'], 'readwrite');
      const chartsStore = transaction.objectStore('charts');
      const syncStore = transaction.objectStore('syncQueue');

      const clearChartsRequest = chartsStore.clear();
      const clearSyncRequest = syncStore.clear();

      let completed = 0;
      const total = 2;

      const checkComplete = () => {
        completed++;
        if (completed === total) {
          log.info('All offline data cleared');
          resolve();
        }
      };

      clearChartsRequest.onsuccess = checkComplete;
      clearSyncRequest.onsuccess = checkComplete;

      clearChartsRequest.onerror = () => {
        reject(createIndexedDBError('Failed to clear charts', clearChartsRequest.error));
      };

      clearSyncRequest.onerror = () => {
        reject(createIndexedDBError('Failed to clear sync queue', clearSyncRequest.error));
      };
    });
  }
}

// Singleton instance
let offlineStorageInstance: OfflineChartStorage | null = null;

export const getOfflineStorage = (): OfflineChartStorage => {
  offlineStorageInstance ??= new OfflineChartStorage();
  return offlineStorageInstance;
};

// Convenience functions
export const saveChartOffline = (chartData: unknown, birthData: unknown, userId: string): Promise<string> => {
  return getOfflineStorage().saveChart({
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
    priority: 'high',
  });
};

export const getChartOffline = (chartId: string): Promise<OfflineChart | null> => {
  return getOfflineStorage().getChart(chartId);
};

export const getUserChartsOffline = (userId: string): Promise<OfflineChart[]> => {
  return getOfflineStorage().getUserCharts(userId);
};

export const deleteChartOffline = (chartId: string): Promise<void> => {
  return getOfflineStorage().deleteChart(chartId);
};

export const getStorageStatsOffline = (): Promise<StorageStats> => {
  return getOfflineStorage().getStorageStats();
};

export const clearAllOfflineData = (): Promise<void> => {
  return getOfflineStorage().clearAllData();
};
