import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// Lightweight internal logger (no-op in prod build)
const logDev = (...args) => { if (import.meta.env?.DEV) {
    console.log(...args);
} };
const warnDev = (...args) => { if (import.meta.env?.DEV) {
    console.warn(...args);
} };
const errorDev = (...args) => { console.error(...args); };
// Guard helpers
function isPerformanceMonitor(value) {
    return typeof value === 'object' && value !== null &&
        typeof value.getPerformanceReport === 'function' &&
        typeof value.enableRealTimeUpdates === 'function';
}
/**
 * Core performance measurement hook
 */
export function usePerformance() {
    const [isTracking, setIsTracking] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const startTimeRef = useRef(0);
    const start = useCallback(() => {
        startTimeRef.current = performance.now();
        setIsTracking(true);
        setMetrics(null);
    }, []);
    const end = useCallback(() => {
        if (isTracking !== true)
            return null;
        const endTime = performance.now();
        const newMetrics = {
            duration: endTime - startTimeRef.current,
            startTime: startTimeRef.current,
            endTime,
            memory: performance.memory?.usedJSHeapSize,
        };
        setMetrics(newMetrics);
        setIsTracking(false);
        return newMetrics;
    }, [isTracking]);
    const measure = useCallback(async (operationName, operation) => {
        const startTime = performance.now();
        try {
            const result = await operation();
            const endTime = performance.now();
            const m = {
                duration: endTime - startTime,
                startTime,
                endTime,
                memory: performance.memory?.usedJSHeapSize,
            };
            logDev(`Performance measure '${operationName}'`, m);
            return { result, metrics: m };
        }
        catch (err) {
            const endTime = performance.now();
            const m = {
                duration: endTime - startTime,
                startTime,
                endTime,
                memory: performance.memory?.usedJSHeapSize,
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
export function useOperationTracking() {
    const [operationsMap, setOperationsMap] = useState(new Map());
    const operations = useMemo(() => Array.from(operationsMap.values()), [operationsMap]);
    const startOperation = useCallback((operationName, metadata) => {
        const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        const operation = {
            operationId,
            operationName,
            startTime: performance.now(),
            status: 'pending',
            metadata,
        };
        setOperationsMap(prev => new Map(prev).set(operationId, operation));
        return operationId;
    }, []);
    const endOperation = useCallback((operationId, errorMessage) => {
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
    const trackOperation = useCallback(async (name, op, metadata) => {
        const id = startOperation(name, metadata);
        try {
            const result = await op();
            endOperation(id);
            return result;
        }
        catch (err) {
            endOperation(id, err instanceof Error ? err.message : 'Unknown error');
            throw err;
        }
    }, [startOperation, endOperation]);
    const clearOperations = useCallback(() => { setOperationsMap(new Map()); }, []);
    const getOperationsByStatus = useCallback((status) => operations.filter(o => o.status === status), [operations]);
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
export function usePagePerformance() {
    const [metrics, setMetrics] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const collectMetrics = () => {
            try {
                // navigationTiming (deprecated) fallback; prefer PerformanceNavigationTiming entry
                const navEntry = performance.getEntriesByType('navigation')[0];
                const navigationTiming = performance.timing;
                const pageLoadTime = (navEntry !== undefined) ? navEntry.duration : (navigationTiming.loadEventEnd - navigationTiming.navigationStart);
                // Paint entries
                const paintEntries = performance.getEntriesByType('paint');
                const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
                const firstContentfulPaint = (fcpEntry !== undefined && fcpEntry !== null) ? fcpEntry.startTime : 0;
                // LCP
                let largestContentfulPaint = 0;
                let lcpObserver;
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
                    }
                    catch {
                        // ignore
                    }
                }
                const pageMetrics = {
                    pageLoadTime,
                    firstContentfulPaint,
                    largestContentfulPaint,
                    navigationTiming,
                };
                setMetrics(pageMetrics);
                setIsLoading(false);
            }
            catch (err) {
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
    const refreshMetrics = useCallback(() => {
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
export function useMemoryMonitoring() {
    const [memoryInfo, setMemoryInfo] = useState(null);
    const updateMemoryInfo = useCallback(() => {
        const perfAny = performance;
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
    const getMemoryUsagePercentage = useCallback(() => {
        if (memoryInfo === null)
            return 0;
        return memoryInfo.limit > 0 ? (memoryInfo.used / memoryInfo.limit) * 100 : 0;
    }, [memoryInfo]);
    const formatBytes = useCallback((bytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0)
            return '0 Bytes';
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
function isPerformanceReport(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const v = value;
    return Array.isArray(v.components) && Array.isArray(v.operations) && Array.isArray(v.pages) && typeof v.summary === 'object' && v.summary !== null;
}
export function useRealTimePerformance() {
    const [report, setReport] = useState({
        components: [],
        operations: [],
        pages: [],
        summary: { totalMetrics: 0, averageRenderTime: 0, slowestComponent: '', fastestComponent: '', errorRate: 0 }
    });
    useEffect(() => {
        let mounted = true;
        let cleanup;
        const setup = async () => {
            try {
                const mod = await import('../performance');
                const pmCandidate = mod.performanceMonitor;
                if (!mounted || !isPerformanceMonitor(pmCandidate))
                    return;
                const initial = pmCandidate.getPerformanceReport();
                if (isPerformanceReport(initial))
                    setReport(initial);
                cleanup = pmCandidate.enableRealTimeUpdates((r) => { if (mounted && isPerformanceReport(r))
                    setReport(r); });
            }
            catch (err) {
                warnDev('Failed to setup performance monitoring', err);
            }
        };
        void setup();
        return () => { mounted = false; if (typeof cleanup === 'function')
            cleanup(); };
    }, []);
    return report;
}
//# sourceMappingURL=usePerformance.js.map