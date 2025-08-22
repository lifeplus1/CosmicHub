import type { PerformanceReport } from '../performance';
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
interface MemoryInfo {
    used: number;
    total: number;
    limit: number;
}
/**
 * Core performance measurement hook
 */
export declare function usePerformance(): {
    isTracking: boolean;
    metrics: PerformanceMetrics | null;
    start: () => void;
    end: () => PerformanceMetrics | null;
    measure: <T>(name: string, op: () => Promise<T> | T) => Promise<{
        result: T;
        metrics: PerformanceMetrics;
    }>;
};
/**
 * Hook for tracking multiple operations
 */
export declare function useOperationTracking(): {
    operations: OperationMetrics[];
    startOperation: (name: string, metadata?: Record<string, unknown>) => string;
    endOperation: (id: string, errorMessage?: string) => void;
    trackOperation: <T>(name: string, op: () => Promise<T> | T, metadata?: Record<string, unknown>) => Promise<T>;
    clearOperations: () => void;
    getOperationsByStatus: (status: OperationMetrics['status']) => OperationMetrics[];
    getOperationStats: () => {
        total: number;
        completed: number;
        errors: number;
        pending: number;
        averageDuration: number;
    };
};
/**
 * Hook for page-level performance monitoring
 */
export declare function usePagePerformance(): {
    metrics: Partial<PagePerformanceMetrics>;
    isLoading: boolean;
    refreshMetrics: () => void;
};
/**
 * Hook for memory usage monitoring
 */
export declare function useMemoryMonitoring(): {
    memoryInfo: MemoryInfo | null;
    updateMemoryInfo: () => void;
    getMemoryUsagePercentage: () => number;
    formatBytes: (bytes: number) => string;
};
export declare function useRealTimePerformance(): PerformanceReport;
export {};
//# sourceMappingURL=usePerformance.d.ts.map