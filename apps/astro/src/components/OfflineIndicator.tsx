/**
 * Offline Indicator Component
 * Shows network status and sync progress
 */

import React, { useState, useEffect } from 'react';
import {
  getOfflineSyncManager,
  type NetworkStatus,
  type SyncResult,
} from '@cosmichub/storage';

interface OfflineIndicatorProps {
  className?: string;
  showSyncButton?: boolean;
  compact?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showSyncButton = true,
  compact = false,
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: navigator.onLine,
    connection: 'fast',
    lastChecked: new Date().toISOString(),
  });
  const [syncStats, setSyncStats] = useState<{
    pending_items: number;
    last_sync: string | null;
    sync_in_progress: boolean;
  }>({
    pending_items: 0,
    last_sync: null,
    sync_in_progress: false,
  });
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const syncManager = getOfflineSyncManager();

  useEffect(() => {
    const updateStatus = async (): Promise<void> => {
      const status = syncManager.getNetworkStatus();
      const stats = await syncManager.getSyncStats();

      setNetworkStatus(status);
      setSyncStats({
        pending_items: stats.pending_items,
        last_sync: stats.last_sync,
        sync_in_progress: stats.sync_in_progress,
      });
    };

    // Initial update
    void updateStatus();

    // Update every 5 seconds
    const interval = setInterval(() => {
      void updateStatus();
    }, 5000);

    // Listen for network status changes
    const handleOnline = (): void => {
      void updateStatus();
    };

    const handleOffline = (): void => {
      void updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncManager]);

  const handleManualSync = async (): Promise<void> => {
    try {
      const result = await syncManager.forceSyncAll();
      setLastSyncResult(result);

      // Clear result after 5 seconds
      setTimeout(() => {
        setLastSyncResult(null);
      }, 5000);
    } catch (error) {
      console.error('Manual sync failed:', error);
      setLastSyncResult({
        success: false,
        synced_items: 0,
        failed_items: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  };

  const getStatusIcon = (): string => {
    if (!networkStatus.online) return '🔴';
    if (syncStats.sync_in_progress) return '🔄';
    if (syncStats.pending_items > 0) return '⚠️';
    return '🟢';
  };

  const getStatusText = (): string => {
    if (!networkStatus.online) return 'Offline';
    if (syncStats.sync_in_progress) return 'Syncing...';
    if (syncStats.pending_items > 0)
      return `${syncStats.pending_items} pending`;
    return 'Online';
  };

  const getConnectionQuality = (): string => {
    switch (networkStatus.connection) {
      case 'fast':
        return '4G';
      case 'slow':
        return '3G';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const formatLastSync = (): string => {
    if (!syncStats.last_sync) return 'Never';

    const syncDate = new Date(syncStats.last_sync);
    const now = new Date();
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <span className='text-sm' role='img' aria-label='Network status'>
          {getStatusIcon()}
        </span>
        <span className='text-xs text-gray-600'>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-3 shadow-sm ${className}`}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='text-lg' role='img' aria-label='Network status'>
            {getStatusIcon()}
          </span>
          <div>
            <div className='text-sm font-medium text-gray-900'>
              {getStatusText()}
            </div>
            <div className='text-xs text-gray-500'>
              {networkStatus.online ? getConnectionQuality() : 'No connection'}
            </div>
          </div>
        </div>

        {showSyncButton && networkStatus.online && (
          <button
            onClick={() => {
              void handleManualSync();
            }}
            disabled={syncStats.sync_in_progress}
            className='px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-800 disabled:text-gray-500 rounded transition-colors'
            aria-label='Manual sync'
          >
            {syncStats.sync_in_progress ? 'Syncing...' : 'Sync'}
          </button>
        )}
      </div>

      {/* Additional info */}
      <div className='mt-2 pt-2 border-t border-gray-100'>
        <div className='flex justify-between text-xs text-gray-500'>
          <span>Last sync: {formatLastSync()}</span>
          {syncStats.pending_items > 0 && (
            <span className='text-amber-600 font-medium'>
              {syncStats.pending_items} items pending
            </span>
          )}
        </div>
      </div>

      {/* Sync result feedback */}
      {lastSyncResult && (
        <div
          className={`mt-2 p-2 rounded text-xs ${
            lastSyncResult.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {lastSyncResult.success
            ? `✅ Synced ${lastSyncResult.synced_items} items successfully`
            : `❌ Sync failed: ${lastSyncResult.errors[0]}`}
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
