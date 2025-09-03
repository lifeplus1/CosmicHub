// Local storage types to replace @cosmichub/storage package
import type { MultiSystemChartData } from '../components/MultiSystemChart/types';

// Define specific chart data types
export type ChartData = MultiSystemChartData;

// Generic sync data type for various sync operations
export interface SyncActionData {
  id: string;
  action: 'create' | 'update' | 'delete';
  timestamp: Date;
  data: ChartData;
}

// Export data structure
export interface ExportedChartData {
  charts: Array<[string, ChartData]>;
  metadata: {
    exportedAt: Date;
    version: string;
    totalCharts: number;
  };
}

export interface ChartStorage {
  saveChart: (data: ChartData) => Promise<void>;
  getChart: (id: string) => Promise<ChartData | undefined>;
  getOfflineChart: (id: string) => Promise<OfflineChart | undefined>; // New method for full OfflineChart data
  deleteChart: (id: string) => Promise<void>;
  getUserCharts: (userId?: string) => Promise<ChartData[]>;
  forceSyncAll: () => Promise<SyncResult>;
  addToSyncQueue: (action: string, data: SyncActionData) => Promise<void>;
  getSyncStats: () => Promise<SyncStats>;
  getStorageStats: () => Promise<StorageStats>;
  getNetworkStatus: () => Promise<NetworkStatus>;
  clearAllData: () => Promise<void>;
  exportData: () => Promise<ExportedChartData>;
  importData: (data: ExportedChartData) => Promise<void>;
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
  name: string;
  data: ChartData;
  birth_data: ChartData['birth_info']; // Birth data specific to chart calculation
  chart_data: ChartData; // Full chart data
  created_at: Date;
  updated_at: Date;
  synced: boolean;
}

export interface OfflineSyncItem {
  id: string;
  type: 'chart' | 'reading' | 'calculation';
  data: SyncActionData;
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
  private charts: Map<string, ChartData> = new Map();
  private offlineCharts: OfflineChart[] = [];
  private syncItems: OfflineSyncItem[] = [];

  async saveChart(data: ChartData): Promise<void> {
    if (data.birth_info?.date) {
      // Use birth info date as id if available, otherwise generate one
      const id = `chart-${Date.now()}`;
      this.charts.set(id, data);
    }
    await Promise.resolve();
  }

  async getChart(id: string): Promise<ChartData | undefined> {
    return await Promise.resolve(this.charts.get(id));
  }

  async getOfflineChart(id: string): Promise<OfflineChart | undefined> {
    const chartData = this.charts.get(id);
    if (chartData) {
      // Convert ChartData to OfflineChart format
      return await Promise.resolve({
        id,
        name: `Chart ${id}`, // Default name
        data: chartData,
        birth_data: chartData.birth_info,
        chart_data: chartData,
        created_at: new Date(),
        updated_at: new Date(),
        synced: false
      });
    }
    return await Promise.resolve(undefined);
  }

  async deleteChart(id: string): Promise<void> {
    this.charts.delete(id);
    await Promise.resolve();
  }

  async getUserCharts(_userId?: string): Promise<ChartData[]> {
    return await Promise.resolve(Array.from(this.charts.values()));
  }

  async forceSyncAll(): Promise<SyncResult> {
    return await Promise.resolve({
      success: true,
      synced_items: this.charts.size,
      failed_items: 0,
      errors: []
    });
  }

  async addToSyncQueue(_action: string, _data: SyncActionData): Promise<void> {
    // Mock implementation
    await Promise.resolve();
  }

  async getSyncStats(): Promise<SyncStats> {
    return await Promise.resolve({
      sync_in_progress: false,
      pending_items: 0,
      last_sync: new Date()
    });
  }

  async getStorageStats(): Promise<StorageStats> {
    return await Promise.resolve({
      total_charts: this.charts.size,
      storage_quota: {
        used: this.charts.size * 1024,
        available: 1024 * 1024 * 100
      }
    });
  }

  async getNetworkStatus(): Promise<NetworkStatus> {
    return await Promise.resolve({
      online: navigator.onLine,
      connection: 'wifi'
    });
  }

  async clearAllData(): Promise<void> {
    this.charts.clear();
    await Promise.resolve();
  }

  async exportData(): Promise<ExportedChartData> {
    return await Promise.resolve({
      charts: Array.from(this.charts.entries()),
      metadata: {
        exportedAt: new Date(),
        version: '1.0.0',
        totalCharts: this.charts.size
      }
    });
  }

  async importData(data: ExportedChartData): Promise<void> {
    this.charts = new Map(data.charts);
    await Promise.resolve();
  }

  async getOfflineCharts(): Promise<OfflineChart[]> {
    return await Promise.resolve(this.offlineCharts);
  }

  async markAsSynced(id: string): Promise<void> {
    const chart = this.offlineCharts.find(c => c.id === id);
    if (chart) {
      chart.synced = true;
    }
    await Promise.resolve();
  }

  async getPendingSyncItems(): Promise<OfflineSyncItem[]> {
    return await Promise.resolve(this.syncItems);
  }
}

// Mock sync manager implementation
export class MockOfflineSyncManager implements OfflineSyncManager {
  async getNetworkStatus(): Promise<NetworkStatus> {
    return await Promise.resolve({
      online: navigator.onLine,
      connection: navigator.onLine ? 'wifi' : 'none'
    });
  }

  async getSyncStats(): Promise<SyncStats> {
    return await Promise.resolve({
      sync_in_progress: false,
      pending_items: 0,
      last_sync: null
    });
  }

  async performSync(): Promise<SyncResult> {
    return await Promise.resolve({
      success: true,
      synced_items: 0,
      failed_items: 0,
      errors: []
    });
  }

  async forceSyncAll(): Promise<SyncResult> {
    return await Promise.resolve({
      success: true,
      synced_items: 0,
      failed_items: 0,
      errors: []
    });
  }

  scheduleSync(): void {
    // Mock implementation
  }
}

// Singleton instance for getOfflineSyncManager
let syncManagerInstance: OfflineSyncManager | null = null;

export function getOfflineSyncManager(): OfflineSyncManager {
  syncManagerInstance ??= new MockOfflineSyncManager();
  return syncManagerInstance;
}
