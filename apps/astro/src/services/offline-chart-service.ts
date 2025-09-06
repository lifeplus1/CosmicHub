/**
 * Offline Chart Service - Integration Layer
 * Bridges offline storage with existing chart APIs for seamless offline functionality
 */

// Use storage-level ChartData alias to ensure structural compatibility
import {
  type ChartData,
  OfflineChartStorage,
  OfflineSyncManager,
  type OfflineChart,
  type OfflineSyncItem,
  MockChartStorage,
  getOfflineSyncManager,
} from '../types/storage';
import {
  fetchSavedCharts,
  saveChart as apiSaveChart,
  deleteChart as apiDeleteChart,
  fetchChart as _fetchChart,
} from './api';
import { type UnifiedBirthData, isUnifiedBirthData } from '@cosmichub/types';
import type { SaveChartRequest, SavedChart, ChartId } from './api.types';
import { isSuccess } from './apiResult';

// Utility function to convert string to ChartId with validation
function toChartId(id: string): ChartId {
  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new Error('ChartId must be a non-empty string');
  }
  return id as unknown as ChartId;
}

// Chart calculation parameters interface
export interface ChartCalculationParams {
  name?: string;
  birthData: UnifiedBirthData;
  systems?: string[];
  houses?: string;
  aspects?: string[];
}

// Define message types for service worker communication
interface ServiceWorkerSyncRequest { type: 'SYNC_REQUEST' }
interface ServiceWorkerCacheRequest { type: 'CACHE_REQUEST'; payload: { chartId: string } }
type ServiceWorkerMessage = ServiceWorkerSyncRequest | ServiceWorkerCacheRequest;

// Metadata returned alongside loaded charts
export interface ChartLoadMetadata {
  name: string;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean;
}

// Service Worker registration promise
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Enhanced chart service with offline support
 */
export class OfflineChartService {
  private storage: OfflineChartStorage;
  private syncManager: OfflineSyncManager;
  private userId: string | null = null;

  constructor() {
    this.storage = new MockChartStorage();
    this.syncManager = getOfflineSyncManager();

    // Initialize service worker communication
    void this.initializeServiceWorker();
  }

  /**
   * Initialize service worker communication
   */
  private async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.ready;

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener(
          'message',
          this.handleServiceWorkerMessage.bind(this)
        );

        console.log('🔧 Offline chart service connected to service worker');
      } catch (error) {
        console.error('❌ Failed to connect to service worker:', error);
      }
    }
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(
    event: MessageEvent<ServiceWorkerMessage>
  ) {
    const msg = event.data;
    if (msg.type === 'SYNC_REQUEST') {
      void this.syncManager.forceSyncAll();
    } else if (msg.type === 'CACHE_REQUEST') {
      this.cacheChartInServiceWorker(msg.payload.chartId);
    }
  }

  /**
   * Send message to service worker
   */
  private notifyServiceWorker(type: string, payload?: unknown) {
    if (swRegistration?.active) {
      swRegistration.active.postMessage({ type, payload });
    }
  }

  /**
   * Set current user ID for storage scoping
   */
  setUserId(userId: string | null) {
    this.userId = userId;
  }

  /**
   * Save chart with offline support
   */
  async saveChart(
    chartData: ChartData,
    params: ChartCalculationParams
  ): Promise<{
    success: boolean;
    chartId: string;
    offline?: boolean;
  }> {
    try {
      // Try online save first
      if (navigator.onLine) {
        try {
          // Convert to API format
          const saveRequest: SaveChartRequest = {
            year: params.birthData.year,
            month: params.birthData.month,
            day: params.birthData.day,
            hour: params.birthData.hour,
            minute: params.birthData.minute,
            city: params.birthData.city ?? 'Unknown',
            house_system: params.houses ?? 'placidus',
            chart_name: params.name ?? `Chart ${new Date().toISOString()}`,
            lat: params.birthData.lat ?? params.birthData.latitude ?? 0,
            lon: params.birthData.lon ?? params.birthData.longitude ?? 0,
          };

          const apiResult = await apiSaveChart(saveRequest);

          if (!isSuccess(apiResult)) {
            throw new Error('Save failed');
          }

          // Extract chart ID from the properly typed response
          const chartId = apiResult.data.id;

          // Cache successful save locally
          // Persist a local copy (chartData already matches ChartData alias)
          await this.storage.saveChart(chartData);

          // Cache in service worker for faster access
          this.cacheChartInServiceWorker(chartId, chartData);

          return {
            success: true,
            chartId,
          };
        } catch (networkError) {
          console.warn(
            '⚠️ Online save failed, falling back to offline:',
            networkError
          );
        }
      }

      // Offline save
      const chartId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await this.storage.saveChart(chartData);

      // Queue for background sync
      await this.storage.enqueue({
        type: 'create',
        payload: {
          id: chartId,
          action: 'create',
          timestamp: new Date(),
          data: chartData,
          userId: this.userId ?? 'anonymous',
          name: params.name ?? chartId,
        },
      });

      return {
        success: true,
        chartId,
        offline: true,
      };
    } catch (error) {
      console.error('❌ Failed to save chart:', error);
      throw new Error('Failed to save chart');
    }
  }

  /**
   * Load chart with offline fallback
   */
  async loadChart(chartId: string): Promise<{
    chartData: ChartData;
    params: ChartCalculationParams;
    metadata: ChartLoadMetadata;
    fromCache?: boolean;
  }> {
    try {
      // Load from offline storage first (for now - simplifies implementation)
      const cachedChart = await this.storage.getOfflineChart(chartId);

      if (cachedChart) {
        // Convert the OfflineChart format to expected format
        // Use type guard to safely access birth_data properties
        let birthData: ChartCalculationParams['birthData'];

        if (isUnifiedBirthData(cachedChart.birth_data)) {
          // Use UnifiedBirthData directly
          birthData = cachedChart.birth_data;
        } else {
          // Fallback for unknown format - use safe property access
          const birthDataObj = cachedChart.birth_data as Record<string, unknown>;
          birthData = {
            year: typeof birthDataObj.year === 'number' ? birthDataObj.year : new Date().getFullYear(),
            month: typeof birthDataObj.month === 'number' ? birthDataObj.month : new Date().getMonth() + 1,
            day: typeof birthDataObj.day === 'number' ? birthDataObj.day : new Date().getDate(),
            hour: typeof birthDataObj.hour === 'number' ? birthDataObj.hour : 12,
            minute: typeof birthDataObj.minute === 'number' ? birthDataObj.minute : 0,
            city: typeof birthDataObj.city === 'string' ? birthDataObj.city : 'Unknown',
            lat: typeof birthDataObj.lat === 'number' ? birthDataObj.lat :
                 typeof birthDataObj.latitude === 'number' ? birthDataObj.latitude : 0,
            lon: typeof birthDataObj.lon === 'number' ? birthDataObj.lon :
                 typeof birthDataObj.longitude === 'number' ? birthDataObj.longitude : 0,
            timezone: typeof birthDataObj.timezone === 'string' ? birthDataObj.timezone : 'UTC',
          };
        }

        const params: ChartCalculationParams = {
          name: cachedChart.name,
          birthData,
          systems: [],
          houses: 'placidus',
          aspects: [],
        };

        return {
          chartData: cachedChart.chart_data,
          params,
          metadata: {
            name: cachedChart.name,
            createdAt: cachedChart.created_at,
            updatedAt: cachedChart.updated_at,
            synced: cachedChart.synced,
          },
          fromCache: true,
        };
      }

      // If not in cache and online, this would fetch from API
      // For now, throw error if not found locally
      throw new Error('Chart not found in offline storage');
    } catch (error) {
      console.error('❌ Failed to load chart:', error);
      throw new Error('Chart not available');
    }
  }

  /**
   * List saved charts with offline support
   */
  async listCharts(): Promise<
    Array<{
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      synced: boolean;
      fromCache?: boolean;
    }>
  > {
    try {
      let onlineCharts: SavedChart[] = [];
      let offlineRecords: Array<{
        id: string;
        name: string;
        created_at: string;
        updated_at: string;
        synced: boolean;
      }> = [];

      try {
        // Try to get online charts if available
        if (typeof window !== 'undefined' && navigator.onLine) {
          const chartsResult = await fetchSavedCharts();

          if (isSuccess(chartsResult)) {
            onlineCharts = chartsResult.data;
          }
        }
      } catch (error) {
        console.warn(
          'Failed to load online charts, using offline only:',
          error
        );
      }

      // Always get offline charts
      const offlineCharts = await this.storage.getOfflineCharts();
      offlineRecords = offlineCharts.map(c => ({
        id: c.id,
        name: c.name,
        created_at: c.created_at.toISOString(),
        updated_at: c.updated_at.toISOString(),
        synced: c.synced,
      }));

      // Combine and deduplicate charts
      const chartMap = new Map<
        string,
        {
          id: string;
          name: string;
          createdAt: string;
          updatedAt: string;
          synced: boolean;
          fromCache?: boolean;
        }
      >();

      // Add online charts first (they take precedence for syncing)
      onlineCharts.forEach(chart => {
        chartMap.set(chart.id, {
          id: chart.id,
          name: chart.name,
          createdAt: chart.created_at,
          updatedAt: chart.updated_at ?? chart.created_at,
          synced: true,
          fromCache: false,
        });
      });

      // Add offline charts (won't overwrite existing online charts due to Map)
  offlineRecords.forEach(chart => {
        if (!chartMap.has(chart.id)) {
          chartMap.set(chart.id, {
            id: chart.id,
            name: chart.name,
            createdAt: chart.created_at,
            updatedAt: chart.updated_at ?? new Date().toISOString(),
            synced: true,
            fromCache: false,
          });
        }
      });

      return Array.from(chartMap.values()).sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('❌ Failed to list charts:', error);
      throw new Error('Failed to load chart list');
    }
  }

  /**
   * Delete chart with offline support
   */
  async deleteChart(
    chartId: string
  ): Promise<{ success: boolean; offline?: boolean }> {
    try {
      // Try online delete first
      if (navigator.onLine && !chartId.startsWith('offline_')) {
        try {
          const apiResult = await apiDeleteChart(toChartId(chartId));

          if (isSuccess(apiResult)) {
            // Remove from local cache
            await this.storage.deleteChart(chartId);
            return { success: true };
          }
        } catch (networkError) {
          console.warn(
            '⚠️ Online delete failed, queuing for sync:',
            networkError
          );
        }
      }

      // For offline charts or when online delete fails
      await this.storage.deleteChart(chartId);

      // Queue deletion for sync if it's a real chart ID
      if (!chartId.startsWith('offline_')) {
        await this.storage.enqueue({
          type: 'delete',
          payload: { id: chartId },
        });
      }

      return {
        success: true,
        offline: !navigator.onLine || chartId.startsWith('offline_'),
      };
    } catch (error) {
      console.error('❌ Failed to delete chart:', error);
      throw new Error('Failed to delete chart');
    }
  }

  /**
   * Force sync all charts
   */
  async syncAllCharts(): Promise<{
    success: boolean;
    synced: number;
    errors: number;
  }> {
    try {
      const result = await this.syncManager.forceSyncAll();

      // Trigger service worker sync
      this.notifyServiceWorker('SYNC_CHARTS');

      return {
        success: result.success,
        synced: result.synced_items,
        errors: result.failed_items,
      };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { success: false, synced: 0, errors: 1 };
    }
  }

  /**
   * Get sync status
   */
  async getSyncStatus() {
    return this.syncManager.getSyncStats();
  }

  /**
   * Get storage stats
   */
  async getStorageStats() {
    return await this.storage.getStorageStats();
  }

  /**
   * Clear offline cache
   */
  async clearOfflineCache(): Promise<void> {
    await this.storage.clearAllData();
    this.notifyServiceWorker('CLEAR_CACHE');
  }

  /**
   * Export offline charts for backup
   */
  async exportOfflineCharts(): Promise<string> {
    const data = await this.storage.exportData();
    return JSON.stringify(data);
  }

  /**
   * Import charts from backup
   */
  async importOfflineCharts(
    exportData: string
  ): Promise<{ imported: number; errors: number }> {
    try {
      const parsed = JSON.parse(exportData) as {
        charts?: Array<[string, ChartData]>;
        offlineCharts?: OfflineChart[];
        syncItems?: OfflineSyncItem[];
        metadata?: unknown;
      };
      await this.storage.importData({
        charts: parsed.charts ?? [],
        metadata: {
          exportedAt: new Date(),
          version: '1.0.1',
          totalCharts: parsed.charts?.length ?? 0,
        },
        offlineCharts: parsed.offlineCharts ?? [],
        syncItems: parsed.syncItems ?? [],
      });
      return {
        imported: parsed.charts?.length ?? 0,
        errors: 0,
      };
    } catch (error) {
      console.error('❌ Failed to import charts:', error);
      return { imported: 0, errors: 1 };
    }
  }

  /**
   * Queue chart for background sync
   */
  private queueChartForSync(
    chartId: string,
    action: 'save' | 'delete' | 'update',
    _data: unknown
  ) {
    // Our sync manager handles this automatically through the sync queue
    // Just log for now
    console.log(`📋 Chart queued for sync: ${action} ${chartId}`);
  }

  /**
   * Cache chart data in service worker
   */
  private cacheChartInServiceWorker(chartId: string, chartData?: ChartData) {
    this.notifyServiceWorker('CACHE_CHART', {
      chartId,
      chartData,
    });
  }

  /**
   * Check if chart exists locally (for quick UI updates)
   */
  async hasChartLocally(chartId: string): Promise<boolean> {
    try {
      const chart = await this.storage.getChart(chartId);
      return !!chart;
    } catch {
      return false;
    }
  }

  /**
   * Get network status from sync manager
   */
  getNetworkStatus() {
    return this.syncManager.getNetworkStatus();
  }

  /**
   * Subscribe to network status changes
   * Note: Event subscription not yet implemented in sync manager
   */
  onNetworkStatusChange(_callback: (status: { online: boolean }) => void) {
    // Not implemented yet - would need event emitter pattern
    console.warn('Network status change events not yet implemented');
    return () => {}; // Return empty unsubscribe function
  }

  /**
   * Subscribe to sync events
   * Note: Event subscription not yet implemented in sync manager
   */
  onSyncEvent(_callback: (event: unknown) => void) {
    // Not implemented yet - would need event emitter pattern
    console.warn('Sync event subscription not yet implemented');
    return () => {}; // Return empty unsubscribe function
  }
}

// Singleton instance
export const offlineChartService = new OfflineChartService();

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Set up auth listener to get user ID
  // This would integrate with your existing auth system
  const updateUserId = (user: { uid?: string } | null) => {
    offlineChartService.setUserId(user?.uid ?? null);
  };

  // Hook into your existing auth state changes
  interface WindowWithAuth extends Window {
    auth?: {
      onAuthStateChanged?: (
        callback: (user: { uid?: string } | null) => void
      ) => void;
    };
  }

  const windowWithAuth = window as WindowWithAuth;
  if (windowWithAuth.auth?.onAuthStateChanged) {
    windowWithAuth.auth.onAuthStateChanged(updateUserId);
  }
}
