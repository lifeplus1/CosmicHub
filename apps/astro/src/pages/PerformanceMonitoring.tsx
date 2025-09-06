import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  usePerformance,
  usePagePerformance,
  useOperationTracking,
  useMemoryMonitoring,
} from '../hooks/usePerformance';
import { usePerformanceRegression } from '../hooks/usePerformanceRegression';
// Removed useEphemerisPerformanceMetrics (unused)
import { EphemerisPerformanceDashboard } from '../components/EphemerisPerformanceDashboard';

interface PerformanceData {
  renderTime: number | string;
  mountTime: string;
  pageLoadTime: number | string;
  lastRenderTime?: number;
  lastResult?: string;
}

/**
 * Performance monitoring demo and dashboard page
 */

export default function PerformanceMonitoring(): React.ReactElement {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    renderTime: 'Not measured',
    mountTime: 'Component mounted',
    pageLoadTime: 'Loading...',
  });
  const memoryBarRef = useRef<HTMLDivElement>(null);

  // Performance monitoring hooks
  const { metrics: perfMetrics, isTracking, measure } = usePerformance();
  const { operations, clearOperations, trackOperation } =
    useOperationTracking();
  const { metrics: pageMetrics, isLoading: pageLoading } = usePagePerformance();
  const { memoryInfo, formatBytes, getMemoryUsagePercentage } =
    useMemoryMonitoring();
  
  // 🚀 NEW: Performance regression monitoring
  const {
    baselines,
    regressions,
    alerts,
    acknowledgeAlert,
    getPerformanceHealth,
    exportBaselines,
  } = usePerformanceRegression();

  // Update memory usage bar width without inline styles
  const memoryUsagePercent = useMemo(() => {
    const usage = getMemoryUsagePercentage();
    return Number.isFinite(usage) ? Math.min(usage, 100) : 0;
  }, [getMemoryUsagePercentage]);

  useEffect(() => {
    const currentRef = memoryBarRef.current;
    if (currentRef === null) return;
    currentRef.style.width = `${memoryUsagePercent}%`;
  }, [memoryUsagePercent]);

  // Simulate some expensive operations for demo
  const simulateExpensiveOperation = async (): Promise<void> => {
    await trackOperation('Heavy Operation', async () => {
      await new Promise(resolve =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );
      const iterations = 10_000;
      for (let i = 0; i < iterations; i += 1) {
        void (Math.random() * Math.random());
      }
    });
  };

  const quickOperation = async (): Promise<void> => {
    await trackOperation('Quick Operation', async () => {
      await new Promise(resolve =>
        setTimeout(resolve, 100 + Math.random() * 200)
      );
    });
  };

  const measureRenderOperation = async (): Promise<void> => {
    const { result, metrics } = await measure('Render Test', async () => {
      for (let i = 0; i < 1000; i += 1) {
        await Promise.resolve(); // Add a microtask to make the async operation meaningful
        document.createElement('div');
      }
      return 'Render complete';
    });

    setPerformanceData(prev => ({
      ...prev,
      lastRenderTime: metrics.duration,
      lastResult: result,
    }));
  };

  useEffect(() => {
    setPerformanceData(prev => ({
      ...prev,
      renderTime:
        perfMetrics !== null &&
        perfMetrics !== undefined &&
        typeof perfMetrics.duration === 'number'
          ? perfMetrics.duration
          : 'Not measured',
      mountTime: 'Component mounted',
      pageLoadTime:
        typeof pageMetrics.pageLoadTime === 'number'
          ? pageMetrics.pageLoadTime
          : 'Loading...',
    }));
  }, [perfMetrics, pageMetrics]);

  // Calculate operation stats
  const operationStats = React.useMemo(() => {
    const total = operations.length;
    const completed = operations.filter(op => op.status === 'completed').length;
    const errors = operations.filter(op => op.status === 'error').length;
    const completedOps = operations.filter(
      op => typeof op.duration === 'number' && Number.isFinite(op.duration)
    );
    const averageDuration =
      completedOps.length > 0
        ? completedOps.reduce(
            (sum, op) =>
              sum + (typeof op.duration === 'number' ? op.duration : 0),
            0
          ) / completedOps.length
        : 0;
    return { total, completed, errors, averageDuration };
  }, [operations]);

  const lastOperation =
    operations.length > 0 ? operations[operations.length - 1] : undefined;

  return (
    <div className='min-h-screen bg-gradient-to-br from-cosmic-purple via-cosmic-blue to-cosmic-purple p-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold text-cosmic-gold mb-8 text-center'>
          ⚡ Performance Monitor
        </h1>

        <div
          className='grid gap-6 lg:grid-cols-3 md:grid-cols-2'
          aria-label='Performance dashboard sections'
          role='region'
        >
          {/* Performance Triggers */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'
            role='group'
            aria-label='Performance test controls'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              Performance Tests
            </h2>
            <div className='space-y-4'>
              <button
                type='button'
                onClick={() => {
                  if (isTracking !== true) {
                    void simulateExpensiveOperation();
                  }
                }}
                disabled={isTracking === true}
                className='w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors'
                aria-label={
                  isTracking === true
                    ? 'Running heavy operation test. Please wait.'
                    : 'Start heavy operation test to measure performance.'
                }
              >
                {isTracking === true ? (
                  <span aria-hidden='true' className='inline-flex items-center'>
                    <span className='animate-pulse'>Running...</span>
                  </span>
                ) : (
                  <span aria-hidden='true'>Heavy Operation</span>
                )}
              </button>
              <button
                type='button'
                onClick={() => {
                  if (isTracking !== true) {
                    void quickOperation();
                  }
                }}
                disabled={isTracking === true}
                className='w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors'
                aria-label={
                  isTracking === true
                    ? 'Running quick operation test. Please wait.'
                    : 'Start quick operation test to measure performance.'
                }
              >
                {isTracking === true ? (
                  <span aria-hidden='true' className='inline-flex items-center'>
                    <span className='animate-pulse'>Running...</span>
                  </span>
                ) : (
                  <span aria-hidden='true'>Quick Operation</span>
                )}
              </button>
              <button
                type='button'
                onClick={() => {
                  if (isTracking !== true) {
                    void measureRenderOperation();
                  }
                }}
                disabled={isTracking === true}
                className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors'
                aria-label={
                  isTracking === true
                    ? 'Measuring render time test. Please wait.'
                    : 'Start render time test to measure performance.'
                }
              >
                {isTracking === true ? (
                  <span aria-hidden='true' className='inline-flex items-center'>
                    <span className='animate-pulse'>Measuring...</span>
                  </span>
                ) : (
                  <span aria-hidden='true'>Render Test</span>
                )}
              </button>
              <button
                type='button'
                onClick={() => clearOperations()}
                className='w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors'
                aria-label='Clear operations history to reset tracked performance metrics.'
              >
                <span aria-hidden='true'>Clear History</span>
              </button>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'
            aria-label='Real-time performance metrics'
            role='region'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              Real-time Metrics
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>Last Operation:</span>
                <span className='text-green-600'>
                  {perfMetrics !== null &&
                  perfMetrics !== undefined &&
                  typeof perfMetrics.duration === 'number'
                    ? `${perfMetrics.duration.toFixed(2)}ms`
                    : 'None'}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>Page Load:</span>
                <span className='text-green-600'>
                  {pageLoading
                    ? 'Loading...'
                    : typeof pageMetrics.pageLoadTime === 'number'
                      ? `${pageMetrics.pageLoadTime.toFixed(2)}ms`
                      : 'N/A'}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>FCP:</span>
                <span className='text-green-600'>
                  {typeof pageMetrics.firstContentfulPaint === 'number'
                    ? `${pageMetrics.firstContentfulPaint.toFixed(2)}ms`
                    : 'N/A'}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>Last Render:</span>
                <span className='text-green-600'>
                  {typeof performanceData.lastRenderTime === 'number'
                    ? `${performanceData.lastRenderTime.toFixed(2)}ms`
                    : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'
            aria-label='Memory usage panel'
            role='region'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              Memory Usage
            </h2>
            {memoryInfo !== null && memoryInfo !== undefined ? (
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-cosmic-silver'>Used:</span>
                  <span className='text-green-600'>
                    {formatBytes(memoryInfo.used)}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-cosmic-silver'>Total:</span>
                  <span className='text-green-600'>
                    {formatBytes(memoryInfo.total)}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-cosmic-silver'>Usage:</span>
                  <span className='text-green-600'>
                    {memoryUsagePercent.toFixed(1)}%
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2'>
                  <div
                    ref={memoryBarRef}
                    className={`memory-usage-bar h-2 rounded-full transition-all duration-300 ${
                      memoryUsagePercent > 80
                        ? 'bg-red-600'
                        : memoryUsagePercent > 60
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                    }`}
                    aria-label={`Memory usage ${memoryUsagePercent.toFixed(1)} percent`}
                  />
                </div>
              </div>
            ) : (
              <div className='text-cosmic-silver'>
                Memory info not available
              </div>
            )}
          </div>

          {/* Operation Statistics */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'
            role='region'
            aria-label='Aggregated operation statistics'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              Operation Stats
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>Total Operations:</span>
                <span className='text-green-600'>{operationStats.total}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>Completed:</span>
                <span className='text-green-600'>
                  {operationStats.completed}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>Errors:</span>
                <span className='text-red-600'>{operationStats.errors}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-cosmic-silver'>Average Time:</span>
                <span className='text-green-600'>
                  {operationStats.averageDuration > 0
                    ? `${operationStats.averageDuration.toFixed(2)}ms`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Operations */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20 md:col-span-2 lg:col-span-2'
            role='region'
            aria-label='Recent operations list'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              Recent Operations
            </h2>
            <div
              className='space-y-2 max-h-48 overflow-y-auto'
              aria-live='polite'
            >
              {lastOperation !== null && lastOperation !== undefined && (
                <div className='sr-only' role='status'>
                  Last operation {lastOperation.operationName} status{' '}
                  {lastOperation.status}
                  {typeof lastOperation.duration === 'number'
                    ? ` duration ${lastOperation.duration.toFixed(2)} milliseconds`
                    : ''}
                </div>
              )}
              {operations
                ?.slice(-10)
                ?.reverse()
                ?.map(op => {
                  if (
                    !op?.operationId ||
                    !op.operationName ||
                    typeof op.operationId !== 'string' ||
                    typeof op.operationName !== 'string' ||
                    op.operationId === '' ||
                    op.operationName === ''
                  ) {
                    return null;
                  }
                  return (
                    <div
                      key={op.operationId}
                      className='flex justify-between items-center p-2 bg-cosmic-dark/30 rounded'
                    >
                      <div className='flex-1'>
                        <span className='text-cosmic-silver font-medium'>
                          {op.operationName}
                        </span>
                        <div className='text-xs text-cosmic-silver opacity-70'>
                          {typeof op.startTime === 'number'
                            ? new Date(
                                op.startTime + performance.timeOrigin
                              ).toLocaleTimeString()
                            : 'Unknown time'}
                        </div>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            op.status === 'completed'
                              ? 'bg-green-600'
                              : op.status === 'error'
                                ? 'bg-red-600'
                                : 'bg-yellow-600'
                          }`}
                        >
                          {op.status}
                        </span>
                        {typeof op.duration === 'number' && (
                          <span className='text-cosmic-silver text-sm'>
                            {op.duration.toFixed(2)}ms
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              {!operations?.length && (
                <div className='text-cosmic-silver text-center py-4'>
                  No operations tracked yet
                </div>
              )}
            </div>
          </div>

          {/* 🚀 NEW: Performance Health Score */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'
            role='region'
            aria-label='Performance health monitoring'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              🏥 Performance Health
            </h2>
            {(() => {
              const health = getPerformanceHealth();
              return (
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-cosmic-silver'>Health Score:</span>
                    <span className={`font-bold ${
                      health.score >= 90 ? 'text-green-600' :
                      health.score >= 70 ? 'text-yellow-600' :
                      health.score >= 50 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {health.score}/100
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-cosmic-silver'>Status:</span>
                    <span className={`font-semibold ${
                      health.status === 'excellent' ? 'text-green-600' :
                      health.status === 'good' ? 'text-yellow-600' :
                      health.status === 'fair' ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-cosmic-silver'>Recent Issues:</span>
                    <span className='text-cosmic-silver'>{health.recentRegressions}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-cosmic-silver'>Critical Issues:</span>
                    <span className={health.criticalIssues > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                      {health.criticalIssues}
                    </span>
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2 mt-4'>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        health.score >= 90 ? 'bg-green-600' :
                        health.score >= 70 ? 'bg-yellow-600' :
                        health.score >= 50 ? 'bg-orange-600' : 'bg-red-600'
                      }`}
                      data-width={health.score}
                      aria-label={`Performance health score ${health.score} percent`}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 🚀 NEW: Performance Baselines */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'
            role='region'
            aria-label='Performance baselines'
          >
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold text-cosmic-gold'>
                📊 Baselines
              </h2>
              <button
                type='button'
                onClick={exportBaselines}
                className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors'
                aria-label='Export performance baseline data'
              >
                Export
              </button>
            </div>
            <div className='space-y-2 max-h-48 overflow-y-auto'>
              {baselines.length > 0 ? (
                baselines.slice(-5).map((baseline) => (
                  <div
                    key={baseline.operationName}
                    className='flex justify-between items-center p-2 bg-cosmic-dark/30 rounded'
                  >
                    <div className='flex-1'>
                      <span className='text-cosmic-silver font-medium'>
                        {baseline.operationName}
                      </span>
                      <div className='text-xs text-cosmic-silver opacity-70'>
                        {baseline.sampleCount} samples
                      </div>
                    </div>
                    <div className='text-right'>
                      <span className='text-green-600 font-semibold'>
                        {baseline.averageDuration.toFixed(2)}ms
                      </span>
                      {baseline.standardDeviation > 0 && (
                        <div className='text-xs text-cosmic-silver opacity-70'>
                          ±{baseline.standardDeviation.toFixed(1)}ms
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-cosmic-silver text-center py-4'>
                  No baselines established yet
                </div>
              )}
            </div>
          </div>

          {/* 🚀 NEW: Performance Alerts */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20'
            role='region'
            aria-label='Performance alerts'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              🚨 Active Alerts
            </h2>
            <div className='space-y-2 max-h-48 overflow-y-auto' aria-live='polite'>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded border-l-4 ${
                      alert.severity === 'critical' ? 'border-red-600 bg-red-900/20' :
                      alert.severity === 'high' ? 'border-orange-600 bg-orange-900/20' :
                      alert.severity === 'medium' ? 'border-yellow-600 bg-yellow-900/20' :
                      'border-blue-600 bg-blue-900/20'
                    }`}
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1'>
                        <span className={`font-semibold ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'high' ? 'text-orange-400' :
                          alert.severity === 'medium' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          {alert.message}
                        </span>
                        <div className='text-xs text-cosmic-silver opacity-70 mt-1'>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() => acknowledgeAlert(alert.id)}
                        className='ml-2 text-xs bg-cosmic-dark/50 hover:bg-cosmic-dark text-cosmic-silver px-2 py-1 rounded transition-colors'
                        aria-label='Acknowledge alert'
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-cosmic-silver text-center py-4'>
                  No active alerts
                </div>
              )}
            </div>
          </div>

          {/* 🚀 NEW: Recent Regressions */}
          <div
            className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20 lg:col-span-3'
            role='region'
            aria-label='Recent performance regressions'
          >
            <h2 className='text-xl font-bold text-cosmic-gold mb-4'>
              📉 Recent Performance Regressions
            </h2>
            <div className='space-y-3 max-h-64 overflow-y-auto'>
              {regressions.length > 0 ? (
                regressions.slice(0, 10).map((regression, _index) => (
                  <div
                    key={`${regression.operationName}-${regression.timestamp}`}
                    className={`p-4 rounded-lg border-l-4 ${
                      regression.severity === 'critical' ? 'border-red-600 bg-red-900/10' :
                      regression.severity === 'major' ? 'border-orange-600 bg-orange-900/10' :
                      regression.severity === 'moderate' ? 'border-yellow-600 bg-yellow-900/10' :
                      'border-blue-600 bg-blue-900/10'
                    }`}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <h3 className='font-semibold text-cosmic-silver'>
                          {regression.operationName}
                        </h3>
                        <div className='text-sm text-cosmic-silver/70'>
                          {new Date(regression.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className='text-right'>
                        <span className={`font-bold text-lg ${
                          regression.severity === 'critical' ? 'text-red-400' :
                          regression.severity === 'major' ? 'text-orange-400' :
                          regression.severity === 'moderate' ? 'text-yellow-400' :
                          'text-blue-400'
                        }`}>
                          +{regression.regressionPercentage.toFixed(1)}%
                        </span>
                        <div className='text-xs text-cosmic-silver/70'>
                          {regression.currentDuration.toFixed(2)}ms vs {regression.baselineAverage.toFixed(2)}ms
                        </div>
                      </div>
                    </div>
                    {regression.suggestions.length > 0 && (
                      <div className='mt-3 p-2 bg-cosmic-dark/30 rounded'>
                        <h4 className='text-sm font-medium text-cosmic-gold mb-1'>
                          💡 Suggestions:
                        </h4>
                        <ul className='text-sm text-cosmic-silver/80 space-y-1'>
                          {regression.suggestions.slice(0, 2).map((suggestion, idx) => (
                            <li key={idx} className='flex items-start'>
                              <span className='mr-2'>•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className='text-cosmic-silver text-center py-8'>
                  🎉 No performance regressions detected!
                  <div className='text-sm text-cosmic-silver/60 mt-2'>
                    Your optimization efforts are paying off.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ephemeris Performance (existing) */}
          <div className='cosmic-glass p-6 rounded-lg border border-cosmic-silver/20 lg:col-span-3'>
            <EphemerisPerformanceDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
