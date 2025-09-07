/**
 * Performance dashboard component for ephemeris operations.
 *
 * Provides real-time monitoring of cache hit rates, latency,
 * and other performance metrics for the ephemeris service.
 */

import React, { useMemo, useCallback } from 'react';
import { useEphemerisPerformanceMetrics } from '../services/ephemeris-performance';

/**
 * Performance dashboard component for development/debugging.
 */
export const EphemerisPerformanceDashboard: React.FC = React.memo(() => {
  const { metrics, refreshMetrics, logSummary } =
    useEphemerisPerformanceMetrics();

  const getCacheHitRateColor = useCallback((rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const getLatencyColor = useCallback((latency: number) => {
    if (latency <= 100) return 'text-green-600';
    if (latency <= 500) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // Memoize performance indicators to avoid recalculating on every render
  const performanceIndicators = useMemo(() => {
    const indicators = [];
    
    if (metrics.cacheHitRate < 80) {
      indicators.push({
        type: 'warning',
        message: '⚠️ Cache hit rate is below target (80%). Consider increasing cache TTL or warming cache.',
        className: 'text-sm text-yellow-600 bg-yellow-50 p-2 rounded'
      });
    }

    if (metrics.averageLatency > 100) {
      indicators.push({
        type: 'error',
        message: '🚨 Average latency exceeds target (100ms). Check ephemeris server performance.',
        className: 'text-sm text-red-600 bg-red-50 p-2 rounded'
      });
    }

    if (metrics.errors > 0) {
      indicators.push({
        type: 'error',
        message: `❌ ${metrics.errors} error(s) detected. Check console logs for details.`,
        className: 'text-sm text-red-600 bg-red-50 p-2 rounded'
      });
    }

    if (metrics.cacheHitRate >= 80 && metrics.averageLatency <= 100 && metrics.errors === 0) {
      indicators.push({
        type: 'success',
        message: '✅ All performance targets met!',
        className: 'text-sm text-green-600 bg-green-50 p-2 rounded'
      });
    }

    return indicators;
  }, [metrics.cacheHitRate, metrics.averageLatency, metrics.errors]);

  return (
    <section 
      className='bg-white rounded-lg border border-gray-200 p-4'
      aria-labelledby='ephemeris-performance-title'
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 id='ephemeris-performance-title' className='text-lg font-medium'>
          Ephemeris Performance
        </h3>
        <div className='space-x-2'>
          <button
            onClick={refreshMetrics}
            onKeyDown={(e) => handleKeyPress(e, refreshMetrics)}
            className='px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200'
            aria-label='Refresh performance metrics'
            tabIndex={0}
          >
            Refresh
          </button>
          <button
            onClick={logSummary}
            onKeyDown={(e) => handleKeyPress(e, logSummary)}
            className='px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200'
            aria-label='Log performance summary to console'
            tabIndex={0}
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
        {performanceIndicators.map((indicator, index) => (
          <div key={`${indicator.type}-${index}`} className={indicator.className}>
            {indicator.message}
          </div>
        ))}
      </div>
    </section>
  );
});

EphemerisPerformanceDashboard.displayName = 'EphemerisPerformanceDashboard';

export default EphemerisPerformanceDashboard;
