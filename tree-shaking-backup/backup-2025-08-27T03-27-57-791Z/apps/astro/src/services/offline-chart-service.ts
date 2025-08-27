/**
 * Offline Chart Service - Integration Layer
 * Bridges offline storage with existing chart APIs for seamless offline functionality
 */

import type { ChartData } from '@/types';
import { OfflineChartStorage, OfflineSyncManager, type OfflineChart, type OfflineSyncItem } from '@cosmichub/storage';
import {
  fetchSavedCharts,
  saveChart as apiSaveChart,
  deleteChart as apiDeleteChart,
  fetchChart as _fetchChart,
} from './api';
import type { SaveChartRequest, SavedChart, ChartId } from './api.types';

// Chart calculation parameters interface
  birthData: {
    date: string;
    time: string;
    location: {
      latitude: number;
      longitude: number;
      city: string;
      country: string;
    };
  };
  systems?: string[];
  houses?: string;
  aspects?: string[];
}

// Define message types for service worker communication
interface ServiceWorkerMessage {
  type: 'SYNC_REQUEST' | 'CACHE_REQUEST';
  payload?: {
    chartId?: string;
  };
}

// Service Worker registration promise
let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Enhanced chart service with offline support
 */

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
      onAuthStateChanged?: (callback: (user: { uid?: string } | null) => void) => void;
    };
  }

  const windowWithAuth = window as WindowWithAuth;
  if (windowWithAuth.auth?.onAuthStateChanged) {
    windowWithAuth.auth.onAuthStateChanged(updateUserId);
  }
}
