/**
 * Performance dashboard component for ephemeris operations.
 *
 * Provides real-time monitoring of cache hit rates, latency,
 * and other performance metrics for the ephemeris service.
 */

import React from 'react';
import { useEphemerisPerformanceMetrics } from '../services/ephemeris-performance';

/**
 * Performance dashboard component for development/debugging.
 */
export const EphemerisPerformanceDashboard: React.FC = () => {
  const { metrics, refreshMetrics, logSummary } =
    useEphemerisPerformanceMetrics();

  const getCacheHitRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLatencyColor = (latency: number) => {
    if (latency <= 100) return 'text-green-600';
    if (latency <= 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className='bg-white rounded-lg border border-gray-200 p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-medium'>Ephemeris Performance</h3>
        <div className='space-x-2'>
          <button
            onClick={refreshMetrics}
            className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
            aria-label='Refresh performance metrics'
          >
            Refresh
          </button>
          <button
            onClick={logSummary}
            className='px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200'
            aria-label='Log performance summary to console'
          >
            Log Summary
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div>
          <div className='text-sm text-gray-500'>Requests</div>
          <div
            className='text-xl font-semibold'
            aria-label={`Total requests: ${metrics.totalRequests}`}
          >
            {metrics.totalRequests}
          </div>
        </div>

        <div>
          <div className='text-sm text-gray-500'>Cache Hit Rate</div>
          <div
            className={`text-xl font-semibold ${getCacheHitRateColor(metrics.cacheHitRate)}`}
            aria-label={`Cache hit rate: ${metrics.cacheHitRate.toFixed(1)} percent`}
          >
            {metrics.cacheHitRate.toFixed(1)}%
          </div>
        </div>

        <div>
          <div className='text-sm text-gray-500'>Avg Latency</div>
          <div
            className={`text-xl font-semibold ${getLatencyColor(metrics.averageLatency)}`}
            aria-label={`Average latency: ${metrics.averageLatency.toFixed(0)} milliseconds`}
          >
            {metrics.averageLatency.toFixed(0)}ms
          </div>
        </div>

        <div>
          <div className='text-sm text-gray-500'>Errors</div>
          <div
            className={`text-xl font-semibold ${metrics.errors > 0 ? 'text-red-600' : 'text-green-600'}`}
            aria-label={`Error count: ${metrics.errors}`}
          >
            {metrics.errors}
          </div>
        </div>
      </div>

      <div className='mt-4 text-xs text-gray-500'>
        Last updated: {metrics.lastUpdated.toLocaleTimeString()}
      </div>

      {/* Performance indicators */}
      <div className='mt-4 space-y-2'>
        {metrics.cacheHitRate < 80 && (
          <div className='text-sm text-yellow-600 bg-yellow-50 p-2 rounded'>
            ⚠️ Cache hit rate is below target (80%). Consider increasing cache
            TTL or warming cache.
          </div>
        )}

        {metrics.averageLatency > 100 && (
          <div className='text-sm text-red-600 bg-red-50 p-2 rounded'>
            🚨 Average latency exceeds target (100ms). Check ephemeris server
            performance.
          </div>
        )}

        {metrics.errors > 0 && (
          <div className='text-sm text-red-600 bg-red-50 p-2 rounded'>
            ❌ {metrics.errors} error(s) detected. Check console logs for
            details.
          </div>
        )}

        {metrics.cacheHitRate >= 80 &&
          metrics.averageLatency <= 100 &&
          metrics.errors === 0 && (
            <div className='text-sm text-green-600 bg-green-50 p-2 rounded'>
              ✅ All performance targets met!
            </div>
          )}
      </div>
    </div>
  );
};

export default EphemerisPerformanceDashboard;
