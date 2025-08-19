import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// Lightweight internal logger (no-op in prod build)
const logDev = (...args: unknown[]): void => { if (import.meta.env?.DEV) { // eslint-disable-next-line no-console
  console.log(...args); } };
const warnDev = (...args: unknown[]): void => { if (import.meta.env?.DEV) { // eslint-disable-next-line no-console
  console.warn(...args); } };
const errorDev = (...args: unknown[]): void => { // eslint-disable-next-line no-console
  console.error(...args); };

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
  metadata?: Record<string, unknown>;
}

export interface PagePerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  navigationTiming: PerformanceTiming;
}

// Shape of real-time performance monitoring report
export interface RealTimePerformanceReportSummary {
  totalMetrics: number;
  averageRenderTime: number;
  slowestComponent: string;
  fastestComponent: string;
  errorRate: number;
}

export interface RealTimePerformanceReport {
  components: unknown[];
  operations: unknown[];
  pages: unknown[];
  summary: RealTimePerformanceReportSummary;
}

interface PerformanceMonitorLike {
  getPerformanceReport: () => RealTimePerformanceReport;
  enableRealTimeUpdates: (cb: (r: RealTimePerformanceReport) => void) => (() => void);
}

// Non-standard memory interface (Chrome specific); defined defensively.
interface PerformanceMemoryLike {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryInfo { used: number; total: number; limit: number }

// Guard helpers
function isPerformanceMonitor(value: unknown): value is PerformanceMonitorLike {
  return typeof value === 'object' && value !== null &&
    typeof (value as Record<string, unknown>).getPerformanceReport === 'function' &&
    typeof (value as Record<string, unknown>).enableRealTimeUpdates === 'function';
}

/**
 * Core performance measurement hook
 */
export function usePerformance(): {
  isTracking: boolean;
  metrics: PerformanceMetrics | null;
  start: () => void;
  end: () => PerformanceMetrics | null;
  measure: <T>(name: string, op: () => Promise<T> | T) => Promise<{ result: T; metrics: PerformanceMetrics }>;
} {
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback((): void => {
    startTimeRef.current = performance.now();
    setIsTracking(true);
    setMetrics(null);
  }, []);

  const end = useCallback((): PerformanceMetrics | null => {
    if (isTracking !== true) return null;
    const endTime = performance.now();
    const newMetrics: PerformanceMetrics = {
      duration: endTime - startTimeRef.current,
      startTime: startTimeRef.current,
      endTime,
      memory: (performance as unknown as { memory?: PerformanceMemoryLike }).memory?.usedJSHeapSize,
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
      const m: PerformanceMetrics = {
        duration: endTime - startTime,
        startTime,
        endTime,
        memory: (performance as unknown as { memory?: PerformanceMemoryLike }).memory?.usedJSHeapSize,
      };
      logDev(`Performance measure '${operationName}'`, m);
      return { result, metrics: m };
    } catch (err) {
      const endTime = performance.now();
      const m: PerformanceMetrics = {
        duration: endTime - startTime,
        startTime,
        endTime,
        memory: (performance as unknown as { memory?: PerformanceMemoryLike }).memory?.usedJSHeapSize,
      };
      errorDev(`Performance measure failed '${operationName}'`, err, m);
      throw Object.assign(err instanceof Error ? err : new Error('Operation failed'), { metrics: m });
    }
  }, []);

  return { isTracking, metrics, start, end, measure };
}

/**
 * Hook for tracking multiple operations
 */
export function useOperationTracking(): {
  operations: OperationMetrics[];
  startOperation: (name: string, metadata?: Record<string, unknown>) => string;
  endOperation: (id: string, errorMessage?: string) => void;
  trackOperation: <T>(name: string, op: () => Promise<T> | T, metadata?: Record<string, unknown>) => Promise<T>;
  clearOperations: () => void;
  getOperationsByStatus: (status: OperationMetrics['status']) => OperationMetrics[];
  getOperationStats: () => { total: number; completed: number; errors: number; pending: number; averageDuration: number };
} {
  const [operationsMap, setOperationsMap] = useState<Map<string, OperationMetrics>>(new Map());

  const operations = useMemo(() => Array.from(operationsMap.values()), [operationsMap]);

  const startOperation = useCallback((operationName: string, metadata?: Record<string, unknown>): string => {
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    const operation: OperationMetrics = {
      operationId,
      operationName,
      startTime: performance.now(),
      status: 'pending',
      metadata,
    };
    setOperationsMap(prev => new Map(prev).set(operationId, operation));
    return operationId;
  }, []);

  const endOperation = useCallback((operationId: string, errorMessage?: string): void => {
    setOperationsMap(prev => {
      const next = new Map(prev);
      const op = next.get(operationId);
  if (op !== undefined) {
        const endTime = performance.now();
        next.set(operationId, {
          ...op,
            endTime,
            duration: endTime - op.startTime,
            status: (errorMessage !== undefined && errorMessage !== null && errorMessage !== '') ? 'error' : 'completed',
            error: errorMessage,
        });
      }
      return next;
    });
  }, []);

  const trackOperation = useCallback(async <T>(name: string, op: () => Promise<T> | T, metadata?: Record<string, unknown>): Promise<T> => {
    const id = startOperation(name, metadata);
    try {
      const result = await op();
      endOperation(id);
      return result;
    } catch (err) {
      endOperation(id, err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [startOperation, endOperation]);

  const clearOperations = useCallback((): void => { setOperationsMap(new Map()); }, []);

  const getOperationsByStatus = useCallback((status: OperationMetrics['status']): OperationMetrics[] =>
    operations.filter(o => o.status === status), [operations]);

  const getOperationStats = useCallback(() => {
    const completed = operations.filter(o => o.status === 'completed');
    const errors = operations.filter(o => o.status === 'error');
    const pending = operations.filter(o => o.status === 'pending');
    const avgDuration = completed.length > 0 ? completed.reduce((s, o) => s + (o.duration ?? 0), 0) / completed.length : 0;
    return { total: operations.length, completed: completed.length, errors: errors.length, pending: pending.length, averageDuration: avgDuration };
  }, [operations]);

  return { operations, startOperation, endOperation, trackOperation, clearOperations, getOperationsByStatus, getOperationStats };
}

/**
 * Hook for page-level performance monitoring
 */
export function usePagePerformance(): { metrics: Partial<PagePerformanceMetrics>; isLoading: boolean; refreshMetrics: () => void } {
  const [metrics, setMetrics] = useState<Partial<PagePerformanceMetrics>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const collectMetrics = (): void => {
      try {
        // navigationTiming (deprecated) fallback; prefer PerformanceNavigationTiming entry
        const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const navigationTiming = performance.timing;
  const pageLoadTime = (navEntry !== undefined) ? navEntry.duration : (navigationTiming.loadEventEnd - navigationTiming.navigationStart);

        // Paint entries
        const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
        const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
  const firstContentfulPaint = (fcpEntry !== undefined && fcpEntry !== null) ? fcpEntry.startTime : 0;

        // LCP
        let largestContentfulPaint = 0;
        let lcpObserver: PerformanceObserver | undefined;
        if (typeof PerformanceObserver === 'function') {
          try {
            lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const last = entries[entries.length - 1];
              if (entries.length > 0 && last !== undefined) {
                largestContentfulPaint = last.startTime;
                setMetrics(prev => ({ ...prev, largestContentfulPaint }));
              }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch {
            // ignore
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
      } catch (err) {
        warnDev('Failed to collect page performance metrics', err);
        setIsLoading(false);
      }
    };

    if (document.readyState === 'complete') {
      collectMetrics();
      return; // no cleanup needed
    }
    window.addEventListener('load', collectMetrics, { once: true });
    return () => window.removeEventListener('load', collectMetrics);
  }, []);

  const refreshMetrics = useCallback((): void => {
    setIsLoading(true);
  const navigationTiming = performance.timing;
    const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
    setMetrics({ pageLoadTime, navigationTiming });
    setIsLoading(false);
  }, []);

  return { metrics, isLoading, refreshMetrics };
}

/**
 * Hook for memory usage monitoring
 */
export function useMemoryMonitoring(): {
  memoryInfo: MemoryInfo | null;
  updateMemoryInfo: () => void;
  getMemoryUsagePercentage: () => number;
  formatBytes: (bytes: number) => string;
} {
  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);

  const updateMemoryInfo = useCallback((): void => {
    const perfAny = performance as unknown as { memory?: PerformanceMemoryLike };
  if (perfAny.memory !== undefined && perfAny.memory !== null) {
      const memory = perfAny.memory;
      setMemoryInfo({ used: memory.usedJSHeapSize, total: memory.totalJSHeapSize, limit: memory.jsHeapSizeLimit });
    }
  }, []);

  useEffect(() => {
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);
    return () => clearInterval(interval);
  }, [updateMemoryInfo]);

  const getMemoryUsagePercentage = useCallback((): number => {
    if (memoryInfo === null) return 0;
    return memoryInfo.limit > 0 ? (memoryInfo.used / memoryInfo.limit) * 100 : 0;
  }, [memoryInfo]);

  const formatBytes = useCallback((bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / Math.pow(1024, i);
    return `${Math.round(value * 100) / 100} ${sizes[i]}`;
  }, []);

  return { memoryInfo, updateMemoryInfo, getMemoryUsagePercentage, formatBytes };
}

/**
 * Hook for real-time performance monitoring
 * Provides live updates of performance metrics
 */
export function useRealTimePerformance(): RealTimePerformanceReport {
  const [report, setReport] = useState<RealTimePerformanceReport>({
    components: [],
    operations: [],
    pages: [],
    summary: { totalMetrics: 0, averageRenderTime: 0, slowestComponent: '', fastestComponent: '', errorRate: 0 }
  });

  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const setup = async (): Promise<void> => {
      try {
        const mod: unknown = await import('../performance');
        const pmCandidate = (mod as Record<string, unknown>).performanceMonitor;
        if (!mounted || !isPerformanceMonitor(pmCandidate)) return;
        setReport(pmCandidate.getPerformanceReport());
        cleanup = pmCandidate.enableRealTimeUpdates((r) => { if (mounted) setReport(r); });
      } catch (err) {
        warnDev('Failed to setup performance monitoring', err);
      }
    };
    void setup();
  return () => { mounted = false; if (typeof cleanup === 'function') cleanup(); };
  }, []);

  return report;
}