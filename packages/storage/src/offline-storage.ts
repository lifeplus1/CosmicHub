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

interface PendingSyncItem {
  action: 'create' | 'update' | 'delete';
  chart_data: Partial<OfflineChart>;
  timestamp: number;
  attempts: number;
  max_attempts: number;
  error_message?: string;
}

interface StorageInfo {
  available: number;
  percentage: number;
}

  synced_charts: number;
  unsynced_charts: number;
  pending_sync_items: number;
  storage_quota: StorageQuota;
  last_sync: string | null;
}

// Singleton instance
let offlineStorageInstance: OfflineChartStorage | null = null;

export const getOfflineStorage = (): OfflineChartStorage => {
  offlineStorageInstance ??= new OfflineChartStorage();
  return offlineStorageInstance;
};

// Convenience functions
};

};

};

};
