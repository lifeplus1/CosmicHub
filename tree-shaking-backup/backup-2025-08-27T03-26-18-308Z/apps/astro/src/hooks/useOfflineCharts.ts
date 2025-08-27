/**
 * Offline Chart Hook - React Integration
 * Provides easy React integration for offline chart functionality
 */

import { useState, useEffect, useCallback } from 'react';
import type { ChartData } from '@/types';
import {
  offlineChartService,
  type ChartCalculationParams,
} from '@/services/offline-chart-service';

interface ChartListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  fromCache?: boolean;
}

interface NetworkStatus {
  isOnline: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  lastChecked: number;
}

interface SyncStatus {
  isActive: boolean;
  pendingItems: number;
  lastSync: number;
  errors: number;
}

/**
 * Hook for managing offline charts
 */
export function useOfflineCharts() {
  const [charts, setCharts] = useState<ChartListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionQuality: 'excellent',
    lastChecked: Date.now(),
  });
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: false,
    pendingItems: 0,
    lastSync: 0,
    errors: 0,
  });

  // Load charts
  const loadCharts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const chartList = await offlineChartService.listCharts();
      setCharts(chartList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load charts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save chart
  const saveChart = useCallback(
    async (
      chartData: ChartData,
      params: ChartCalculationParams
    ): Promise<{ success: boolean; chartId: string; offline?: boolean }> => {
      try {
        setError(null);
        const result = await offlineChartService.saveChart(chartData, params);

        // Refresh chart list
        await loadCharts();

        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to save chart';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [loadCharts]
  );

  // Load specific chart
  const loadChart = useCallback(async (chartId: string) => {
    try {
      setError(null);
      return await offlineChartService.loadChart(chartId);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to load chart';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Delete chart
  const deleteChart = useCallback(
    async (
      chartId: string
    ): Promise<{
      success: boolean;
      offline?: boolean;
    }> => {
      try {
        setError(null);
        const result = await offlineChartService.deleteChart(chartId);

        // Refresh chart list
        await loadCharts();

        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to delete chart';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [loadCharts]
  );

  // Force sync all charts
  const syncCharts = useCallback(async () => {
    try {
      setError(null);
      setSyncStatus(prev => ({ ...prev, isActive: true }));

      const result = await offlineChartService.syncAllCharts();

      setSyncStatus(prev => ({
        ...prev,
        isActive: false,
        lastSync: Date.now(),
        errors: result.errors,
      }));

      // Refresh charts after sync
      await loadCharts();

      return result;
    } catch (err) {
      setSyncStatus(prev => ({
        ...prev,
        isActive: false,
        errors: prev.errors + 1,
      }));
      const errorMsg = err instanceof Error ? err.message : 'Sync failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [loadCharts]);

  // Get storage statistics
  const [storageStats, setStorageStats] = useState<{
    totalCharts: number;
    storageUsed: number;
    storageLimit: number;
    cacheSize: number;
  }>({
    totalCharts: 0,
    storageUsed: 0,
    storageLimit: 0,
    cacheSize: 0,
  });

  const refreshStorageStats = useCallback(async () => {
    try {
      const stats = await offlineChartService.getStorageStats();
      // Convert OfflineStorageStats to expected format
      setStorageStats({
        totalCharts: stats.total_charts,
        storageUsed: stats.storage_quota.used,
        storageLimit: stats.storage_quota.available,
        cacheSize: stats.storage_quota.used, // Using used storage as cache size
      });
    } catch (err) {
      console.warn('Failed to get storage stats:', err);
    }
  }, []);

  // Clear offline cache
  const clearCache = useCallback(async () => {
    try {
      await offlineChartService.clearOfflineCache();
      await loadCharts();
      await refreshStorageStats();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to clear cache';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, [loadCharts, refreshStorageStats]);

  // Export charts
  const exportCharts = useCallback(async (): Promise<string> => {
    try {
      return await offlineChartService.exportOfflineCharts();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to export charts';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Import charts
  const importCharts = useCallback(
    async (exportData: string) => {
      try {
        const result =
          await offlineChartService.importOfflineCharts(exportData);
        await loadCharts();
        await refreshStorageStats();
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to import charts';
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    },
    [loadCharts, refreshStorageStats]
  );

  // Check if chart exists locally
  const hasChartLocally = useCallback(
    async (chartId: string): Promise<boolean> => {
      try {
        return await offlineChartService.hasChartLocally(chartId);
      } catch {
        return false;
      }
    },
    []
  );

  // Setup network and sync status monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      const status = offlineChartService.getNetworkStatus();
      setNetworkStatus({
        isOnline: status.online,
        connectionQuality:
          status.connection === 'fast'
            ? 'excellent'
            : status.connection === 'slow'
              ? 'poor'
              : 'offline',
        lastChecked: Date.now(),
      });
    };

    const updateSyncStatus = async () => {
      const status = await offlineChartService.getSyncStatus();
      setSyncStatus({
        isActive: status.sync_in_progress,
        pendingItems: status.pending_items,
        lastSync: status.last_sync ? new Date(status.last_sync).getTime() : 0,
        errors: 0, // Not provided by current API
      });
    };

    // Initial status check
    updateNetworkStatus();
    void updateSyncStatus();

    // Set up periodic status updates
    const networkStatusInterval = setInterval(updateNetworkStatus, 5000);
    const syncStatusInterval = setInterval(() => void updateSyncStatus(), 2000);

    // Listen for network changes
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync events
    const unsubscribeSync = offlineChartService.onSyncEvent(event => {
      void updateSyncStatus();
      if ((event as { success?: boolean }).success) {
        void loadCharts(); // Refresh charts when sync completes
      }
    });

    return () => {
      clearInterval(networkStatusInterval);
      clearInterval(syncStatusInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeSync?.();
    };
  }, [loadCharts]);

  // Auto-load charts on mount
  useEffect(() => {
    void loadCharts();
    void refreshStorageStats();
  }, [loadCharts, refreshStorageStats]);

  return {
    // Data
    charts,
    networkStatus,
    syncStatus,
    storageStats,
    loading,
    error,

    // Actions
    loadCharts,
    saveChart,
    loadChart,
    deleteChart,
    syncCharts,
    clearCache,
    exportCharts,
    importCharts,
    hasChartLocally,
    refreshStorageStats,

    // Computed values
    isOnline: networkStatus.isOnline,
    isSyncing: syncStatus.isActive,
    hasOfflineCharts: charts.some(chart => !chart.synced),
    hasPendingSync: syncStatus.pendingItems > 0,
    storageUsagePercent:
      storageStats.storageLimit > 0
        ? (storageStats.storageUsed / storageStats.storageLimit) * 100
        : 0,
  };
}

/**
 * Hook for network status only (lighter weight)
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionQuality: 'excellent',
    lastChecked: Date.now(),
  });

  useEffect(() => {
    const updateStatus = () => {
      const status = offlineChartService.getNetworkStatus();
      setNetworkStatus({
        isOnline: status.online,
        connectionQuality:
          status.connection === 'fast'
            ? 'excellent'
            : status.connection === 'slow'
              ? 'poor'
              : 'offline',
        lastChecked: Date.now(),
      });
    };

    // Initial check
    void updateStatus();

    // Periodic updates
    const interval = setInterval(updateStatus, 5000);

    // Network event listeners
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline: networkStatus.isOnline,
    connectionQuality: networkStatus.connectionQuality,
    lastChecked: networkStatus.lastChecked,
  };
}

/**
 * Hook for sync status only
 */
export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isActive: false,
    pendingItems: 0,
    lastSync: 0,
    errors: 0,
  });

  useEffect(() => {
    const updateStatus = async () => {
      const status = await offlineChartService.getSyncStatus();
      setSyncStatus({
        isActive: status.sync_in_progress,
        pendingItems: status.pending_items,
        lastSync: status.last_sync ? new Date(status.last_sync).getTime() : 0,
        errors: 0, // Not provided by current API
      });
    };

    // Initial check
    updateStatus().catch(error => {
      console.warn('Failed to get sync status:', error);
    });

    // Periodic updates
    const interval = setInterval(() => {
      updateStatus().catch(error => {
        console.warn('Failed to get sync status:', error);
      });
    }, 2000);

    // Subscribe to sync events
    const unsubscribe = offlineChartService.onSyncEvent(() => {
      updateStatus().catch(error => {
        console.warn('Failed to get sync status:', error);
      });
    });

    return () => {
      clearInterval(interval);
      unsubscribe?.();
    };
  }, []);

  return {
    isSyncing: syncStatus.isActive,
    pendingItems: syncStatus.pendingItems,
    lastSync: syncStatus.lastSync,
    errors: syncStatus.errors,
    hasPendingSync: syncStatus.pendingItems > 0,
  };
}
