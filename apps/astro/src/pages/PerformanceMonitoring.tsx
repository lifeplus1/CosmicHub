import React, { useState, useEffect, useRef } from 'react';
import { 
  usePerformance, 
  usePagePerformance, 
  useOperationTracking,
  useMemoryMonitoring,
  type OperationMetrics,
  type PerformanceMetrics
} from '../hooks/usePerformance';
import { useEphemerisPerformanceMetrics } from '../services/ephemeris-performance';
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

export default function PerformanceMonitoring(): JSX.Element {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    renderTime: 'Not measured',
    mountTime: 'Component mounted',
    pageLoadTime: 'Loading...'
  });
  const { metrics } = useEphemerisPerformanceMetrics();
  const memoryBarRef = useRef<HTMLDivElement>(null);
  
    // Performance monitoring hooks
  const { metrics: perfMetrics, isTracking, measure } = usePerformance();
  const { operations, clearOperations, trackOperation } = useOperationTracking();
  const { metrics: pageMetrics, isLoading: pageLoading } = usePagePerformance();
  const { memoryInfo, formatBytes, getMemoryUsagePercentage } = useMemoryMonitoring();

  // Update memory usage bar width without inline styles
  useEffect(() => {
    if (memoryBarRef.current && memoryInfo) {
      const percentage = Math.min(getMemoryUsagePercentage(), 100);
      memoryBarRef.current.style.width = `${percentage}%`;
    }
  }, [memoryInfo, getMemoryUsagePercentage]);

  // Simulate some expensive operations for demo
  const simulateExpensiveOperation = async (): Promise<void> => {
    await trackOperation('Heavy Operation', async () => {
      // Simulate API call or heavy computation
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate some DOM manipulation
      const iterations = 10000;
      for (let i = 0; i < iterations; i++) {
        Math.random() * Math.random();
      }
    });
  };

  const quickOperation = async (): Promise<void> => {
    await trackOperation('Quick Operation', async () => {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    });
  };

  const measureRenderOperation = async (): Promise<void> => {
    const { result, metrics } = await measure('Render Test', async () => {
      // Simulate React re-render work
      for (let i = 0; i < 1000; i++) {
        document.createElement('div');
      }
      return 'Render complete';
    });
    
    setPerformanceData((prev: PerformanceData) => ({
      ...prev,
      lastRenderTime: metrics.duration,
      lastResult: result,
    }));
  };

  useEffect(() => {
    setPerformanceData(prev => ({
      ...prev,
      renderTime: perfMetrics?.duration ?? 'Not measured',
      mountTime: 'Component mounted',
      pageLoadTime: pageMetrics.pageLoadTime ?? 'Loading...',
    }));
  }, [perfMetrics, pageMetrics]);

    // Calculate operation stats
  const operationStats = React.useMemo(() => {
    const total = operations.length;
    const completed = operations.filter(op => op.status === 'completed').length;
    const errors = operations.filter(op => op.status === 'error').length;
    const completedOps = operations.filter(op => op.duration);
    const averageDuration = completedOps.length > 0 
      ? completedOps.reduce((sum, op) => sum + (op.duration || 0), 0) / completedOps.length 
      : 0;
    
    return { total, completed, errors, averageDuration };
  }, [operations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-purple via-cosmic-blue to-cosmic-purple p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-cosmic-gold mb-8 text-center">
          ⚡ Performance Monitor
        </h1>
        
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
          {/* Performance Triggers */}
          <div className="cosmic-glass p-6 rounded-lg border border-cosmic-silver/20">
            <h2 className="text-xl font-bold text-cosmic-gold mb-4">Performance Tests</h2>
            <div className="space-y-4">
              <button
                onClick={simulateExpensiveOperation}
                disabled={isTracking}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                aria-label={isTracking ? 'Running heavy operation test. Please wait.' : 'Start heavy operation test to measure performance.'}
                role="button"
              >
                <span aria-hidden="true">{isTracking ? 'Running...' : 'Heavy Operation'}</span>
              </button>
              <button
                onClick={quickOperation}
                disabled={isTracking}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                aria-label={isTracking ? 'Running quick operation test. Please wait.' : 'Start quick operation test to measure performance.'}
                role="button"
              >
                <span aria-hidden="true">{isTracking ? 'Running...' : 'Quick Operation'}</span>
              </button>
              <button
                onClick={measureRenderOperation}
                disabled={isTracking}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                aria-label={isTracking ? 'Measuring render time test. Please wait.' : 'Start render time test to measure performance.'}
                role="button"
              >
                <span aria-hidden="true">{isTracking ? 'Measuring...' : 'Render Test'}</span>
              </button>
              <button
                onClick={clearOperations}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                aria-label="Clear operations history to reset tracked performance metrics."
                role="button"
              >
                <span aria-hidden="true">Clear History</span>
              </button>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="cosmic-glass p-6 rounded-lg border border-cosmic-silver/20">
            <h2 className="text-xl font-bold text-cosmic-gold mb-4">Real-time Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Last Operation:</span>
                <span className="text-green-600">
                  {perfMetrics ? `${perfMetrics.duration.toFixed(2)}ms` : 'None'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Page Load:</span>
                <span className="text-green-600">
                  {pageLoading ? 'Loading...' : pageMetrics.pageLoadTime ? `${pageMetrics.pageLoadTime.toFixed(2)}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">FCP:</span>
                <span className="text-green-600">
                  {pageMetrics.firstContentfulPaint ? `${pageMetrics.firstContentfulPaint.toFixed(2)}ms` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Last Render:</span>
                <span className="text-green-600">
                  {performanceData.lastRenderTime ? `${performanceData.lastRenderTime.toFixed(2)}ms` : 'None'}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="cosmic-glass p-6 rounded-lg border border-cosmic-silver/20">
            <h2 className="text-xl font-bold text-cosmic-gold mb-4">Memory Usage</h2>
            {memoryInfo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-silver">Used:</span>
                  <span className="text-green-600">{formatBytes(memoryInfo.used)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-silver">Total:</span>
                  <span className="text-green-600">{formatBytes(memoryInfo.total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-silver">Usage:</span>
                  <span className="text-green-600">{getMemoryUsagePercentage().toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    ref={memoryBarRef}
                    className={`memory-usage-bar h-2 rounded-full transition-all duration-300 ${
                      getMemoryUsagePercentage() > 80 ? 'bg-red-600' : 
                      getMemoryUsagePercentage() > 60 ? 'bg-yellow-600' : 'bg-green-600'
                    }`}
                  />
                </div>
              </div>
            ) : (
              <div className="text-cosmic-silver">Memory info not available</div>
            )}
          </div>

          {/* Operation Statistics */}
          <div className="cosmic-glass p-6 rounded-lg border border-cosmic-silver/20">
            <h2 className="text-xl font-bold text-cosmic-gold mb-4">Operation Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Total Operations:</span>
                <span className="text-green-600">{operationStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Completed:</span>
                <span className="text-green-600">{operationStats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Errors:</span>
                <span className="text-red-600">{operationStats.errors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Average Time:</span>
                <span className="text-green-600">
                  {operationStats.averageDuration > 0 ? `${operationStats.averageDuration.toFixed(2)}ms` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Operations */}
          <div className="cosmic-glass p-6 rounded-lg border border-cosmic-silver/20 md:col-span-2 lg:col-span-2">
            <h2 className="text-xl font-bold text-cosmic-gold mb-4">Recent Operations</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {operations.slice(-10).reverse().map((op: OperationMetrics, index: number) => (
                <div key={op.operationId} className="flex justify-between items-center p-2 bg-cosmic-dark/30 rounded">
                  <div className="flex-1">
                    <span className="text-cosmic-silver font-medium">{op.operationName}</span>
                    <div className="text-xs text-cosmic-silver opacity-70">
                      {new Date(op.startTime + performance.timeOrigin).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      op.status === 'completed' ? 'bg-green-600' : 
                      op.status === 'error' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}>
                      {op.status}
                    </span>
                    {op.duration && (
                      <span className="text-cosmic-silver text-sm">
                        {op.duration.toFixed(2)}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {operations.length === 0 && (
                <div className="text-cosmic-silver text-center py-4">
                  No operations tracked yet
                </div>
              )}
            </div>
          </div>

          {/* Ephemeris Performance (existing) */}
          <div className="cosmic-glass p-6 rounded-lg border border-cosmic-silver/20 lg:col-span-3">
            <EphemerisPerformanceDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
