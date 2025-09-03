// Local storage types to replace @cosmichub/storage package
export interface ChartStorage {
  saveChart: (data: any) => Promise<void>;
  getChart: (id: string) => Promise<any>;
  deleteChart: (id: string) => Promise<void>;
  getUserCharts: (userId?: string) => Promise<any[]>;
  forceSyncAll: () => Promise<SyncResult>;
  addToSyncQueue: (action: string, data: any) => Promise<void>;
  getSyncStats: () => Promise<SyncStats>;
  getStorageStats: () => Promise<StorageStats>;
  getNetworkStatus: () => Promise<NetworkStatus>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<void>;
}

export interface SyncResult {
  success: boolean;
  synced_items: number;
  failed_items: number;
  errors: string[];
}

export interface SyncStats {
  sync_in_progress: boolean;
  pending_items: number;
  last_sync: Date | null;
}

export interface StorageStats {
  total_charts: number;
  storage_quota: {
    used: number;
    available: number;
  };
}

export interface NetworkStatus {
  online: boolean;
  connection: 'wifi' | 'cellular' | 'none';
}

export interface OfflineChart {
  id: string;
  data: any;
  created_at: Date;
  updated_at: Date;
  synced: boolean;
}

export interface OfflineSyncItem {
  id: string;
  type: 'chart' | 'reading' | 'calculation';
  data: any;
  created_at: Date;
  attempts: number;
}

export interface OfflineChartStorage extends ChartStorage {
  getOfflineCharts(): Promise<OfflineChart[]>;
  markAsSynced(id: string): Promise<void>;
  getPendingSyncItems(): Promise<OfflineSyncItem[]>;
}

export interface OfflineSyncManager {
  getNetworkStatus(): Promise<NetworkStatus>;
  getSyncStats(): Promise<SyncStats>;
  performSync(): Promise<SyncResult>;
  forceSyncAll(): Promise<SyncResult>;
  scheduleSync(): void;
}

// Mock implementation for development
export class MockChartStorage implements OfflineChartStorage {
  private charts: Map<string, any> = new Map();
  private offlineCharts: OfflineChart[] = [];
  private syncItems: OfflineSyncItem[] = [];

  async saveChart(data: any): Promise<void> {
    this.charts.set(data.id, data);
  }

  async getChart(id: string): Promise<any> {
    return this.charts.get(id);
  }

  async deleteChart(id: string): Promise<void> {
    this.charts.delete(id);
  }

  async getUserCharts(userId?: string): Promise<any[]> {
    return Array.from(this.charts.values());
  }

  async forceSyncAll(): Promise<SyncResult> {
    return {
      success: true,
      synced_items: this.charts.size,
      failed_items: 0,
      errors: []
    };
  }

  async addToSyncQueue(action: string, data: any): Promise<void> {
    // Mock implementation
  }

  async getSyncStats(): Promise<SyncStats> {
    return {
      sync_in_progress: false,
      pending_items: 0,
      last_sync: new Date()
    };
  }

  async getStorageStats(): Promise<StorageStats> {
    return {
      total_charts: this.charts.size,
      storage_quota: {
        used: this.charts.size * 1024,
        available: 1024 * 1024 * 100
      }
    };
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return {
      online: navigator.onLine,
      connection: 'wifi'
    };
  }

  async clearAllData(): Promise<void> {
    this.charts.clear();
  }

  async exportData(): Promise<any> {
    return Array.from(this.charts.entries());
  }

  async importData(data: any): Promise<void> {
    this.charts = new Map(data);
  }

  async getOfflineCharts(): Promise<OfflineChart[]> {
    return this.offlineCharts;
  }

  async markAsSynced(id: string): Promise<void> {
    const chart = this.offlineCharts.find(c => c.id === id);
    if (chart) {
      chart.synced = true;
    }
  }

  async getPendingSyncItems(): Promise<OfflineSyncItem[]> {
    return this.syncItems;
  }
}

// Mock sync manager implementation
export class MockOfflineSyncManager implements OfflineSyncManager {
  async getNetworkStatus(): Promise<NetworkStatus> {
    return {
      online: navigator.onLine,
      connection: navigator.onLine ? 'wifi' : 'none'
    };
  }

  async getSyncStats(): Promise<SyncStats> {
    return {
      sync_in_progress: false,
      pending_items: 0,
      last_sync: null
    };
  }

  async performSync(): Promise<SyncResult> {
    return {
      success: true,
      synced_items: 0,
      failed_items: 0,
      errors: []
    };
  }

  async forceSyncAll(): Promise<SyncResult> {
    return {
      success: true,
      synced_items: 0,
      failed_items: 0,
      errors: []
    };
  }

  scheduleSync(): void {
    // Mock implementation
  }
}

// Singleton instance for getOfflineSyncManager
let syncManagerInstance: OfflineSyncManager | null = null;

export function getOfflineSyncManager(): OfflineSyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new MockOfflineSyncManager();
  }
  return syncManagerInstance;
}
