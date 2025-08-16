import { useState, useEffect, useCallback, useRef } from 'react';

export interface PerformanceMetrics {
  duration: number;
  startTime: number;
  endTime: number;
  memory?: number;
  paintTime?: number;
  loadTime?: number;
}

export interface OperationMetrics {
  operationId: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'completed' | 'error';
  error?: string;
  metadata?: Record<string, any>;
}

export interface PagePerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  navigationTiming: PerformanceTiming;
}

/**
 * Core performance measurement hook
 */
export function usePerformance() {
  const [isTracking, setIsTracking] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsTracking(true);
    setMetrics(null);
  }, []);

  const end = useCallback(() => {
    if (!isTracking) return null;

    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    const newMetrics: PerformanceMetrics = {
      duration,
      startTime: startTimeRef.current,
      endTime,
      memory: (performance as any).memory?.usedJSHeapSize,
    };

    setMetrics(newMetrics);
    setIsTracking(false);
    
    return newMetrics;
  }, [isTracking]);

  const measure = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T> | T
  ): Promise<{ result: T; metrics: PerformanceMetrics }> => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      
      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        startTime,
        endTime,
        memory: (performance as any).memory?.usedJSHeapSize,
      };

      return { result, metrics };
    } catch (error) {
      const endTime = performance.now();
      
      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        startTime,
        endTime,
        memory: (performance as any).memory?.usedJSHeapSize,
      };

      throw { error, metrics };
    }
  }, []);

  return {
    isTracking,
    metrics,
    start,
    end,
    measure,
  };
}

/**
 * Hook for tracking multiple operations
 */
export function useOperationTracking() {
  const [operations, setOperations] = useState<Map<string, OperationMetrics>>(new Map());

  const startOperation = useCallback((operationName: string, metadata?: Record<string, any>) => {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operation: OperationMetrics = {
      operationId,
      operationName,
      startTime: performance.now(),
      status: 'pending',
      metadata,
    };

    setOperations(prev => new Map(prev).set(operationId, operation));
    return operationId;
  }, []);

  const endOperation = useCallback((operationId: string, error?: string) => {
    setOperations(prev => {
      const newMap = new Map(prev);
      const operation = newMap.get(operationId);
      
      if (operation) {
        const endTime = performance.now();
        const updatedOperation: OperationMetrics = {
          ...operation,
          endTime,
          duration: endTime - operation.startTime,
          status: error ? 'error' : 'completed',
          error,
        };
        newMap.set(operationId, updatedOperation);
      }
      
      return newMap;
    });
  }, []);

  const trackOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const operationId = startOperation(operationName, metadata);
    
    try {
      const result = await operation();
      endOperation(operationId);
      return result;
    } catch (error) {
      endOperation(operationId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [startOperation, endOperation]);

  const clearOperations = useCallback(() => {
    setOperations(new Map());
  }, []);

  const getOperationsByStatus = useCallback((status: OperationMetrics['status']) => {
    return Array.from(operations.values()).filter(op => op.status === status);
  }, [operations]);

  const getOperationStats = useCallback(() => {
    const ops = Array.from(operations.values());
    const completed = ops.filter(op => op.status === 'completed');
    const errors = ops.filter(op => op.status === 'error');
    const pending = ops.filter(op => op.status === 'pending');

    const avgDuration = completed.length > 0
      ? completed.reduce((sum, op) => sum + (op.duration || 0), 0) / completed.length
      : 0;

    return {
      total: ops.length,
      completed: completed.length,
      errors: errors.length,
      pending: pending.length,
      averageDuration: avgDuration,
    };
  }, [operations]);

  return {
    operations: Array.from(operations.values()),
    startOperation,
    endOperation,
    trackOperation,
    clearOperations,
    getOperationsByStatus,
    getOperationStats,
  };
}

/**
 * Hook for page-level performance monitoring
 */
export function usePagePerformance() {
  const [metrics, setMetrics] = useState<Partial<PagePerformanceMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const collectMetrics = () => {
      try {
        const navigationTiming = performance.timing;
        const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;

        // Collect paint metrics if available
        const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        const firstContentfulPaint = fcpEntry ? fcpEntry.startTime : 0;

        // Collect LCP if available
        let largestContentfulPaint = 0;
        if ('PerformanceObserver' in window) {
          try {
            const lcpObserver = new PerformanceObserver((entryList) => {
              const entries = entryList.getEntries() as any[];
              const lastEntry = entries[entries.length - 1];
              if (lastEntry) {
                largestContentfulPaint = lastEntry.startTime;
                setMetrics(prev => ({
                  ...prev,
                  largestContentfulPaint,
                }));
              }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // LCP not supported
          }
        }

        const pageMetrics: Partial<PagePerformanceMetrics> = {
          pageLoadTime,
          firstContentfulPaint,
          largestContentfulPaint,
          navigationTiming,
        };

        setMetrics(pageMetrics);
        setIsLoading(false);
      } catch (error) {
        console.warn('Failed to collect page performance metrics:', error);
        setIsLoading(false);
      }
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
      return () => {}; // Return empty cleanup function
    } else {
      window.addEventListener('load', collectMetrics);
      return () => window.removeEventListener('load', collectMetrics);
    }
  }, []);

  const refreshMetrics = useCallback(() => {
    setIsLoading(true);
    // Re-collect metrics
    const navigationTiming = performance.timing;
    const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
    
    setMetrics({
      pageLoadTime,
      navigationTiming,
    });
    setIsLoading(false);
  }, []);

  return {
    metrics,
    isLoading,
    refreshMetrics,
  };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitoring() {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
  } | null>(null);

  const updateMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      });
    }
  }, []);

  useEffect(() => {
    updateMemoryInfo();
    
    // Update every 5 seconds
    const interval = setInterval(updateMemoryInfo, 5000);
    return () => clearInterval(interval);
  }, [updateMemoryInfo]);

  const getMemoryUsagePercentage = useCallback(() => {
    if (!memoryInfo) return 0;
    return (memoryInfo.used / memoryInfo.limit) * 100;
  }, [memoryInfo]);

  const formatBytes = useCallback((bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  }, []);

  return {
    memoryInfo,
    updateMemoryInfo,
    getMemoryUsagePercentage,
    formatBytes,
  };
}

/**
 * Hook for real-time performance monitoring
 * Provides live updates of performance metrics
 */
export function useRealTimePerformance() {
  const [report, setReport] = useState<any>(() => {
    // Initialize with default structure
    return {
      components: [],
      operations: [],
      pages: [],
      summary: {
        totalMetrics: 0,
        averageRenderTime: 0,
        slowestComponent: '',
        fastestComponent: '',
        errorRate: 0
      }
    };
  });

  useEffect(() => {
    let mounted = true;

    // Import performance monitor dynamically to avoid build issues
    const setupPerformanceMonitoring = async () => {
      try {
        const { performanceMonitor } = await import('../performance');
        
        if (!mounted) return;

        // Get initial report
        setReport(performanceMonitor.getPerformanceReport());

        // Subscribe to real-time updates
        const unsubscribe = performanceMonitor.enableRealTimeUpdates((newReport) => {
          if (mounted) {
            setReport(newReport);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.warn('Failed to setup performance monitoring:', error);
        return () => {};
      }
    };

    let cleanup: (() => void) | undefined;
    
    setupPerformanceMonitoring().then((unsubscribe) => {
      cleanup = unsubscribe;
    });

    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  return report;
}