/**
 * Enhanced Performance Monitoring System for CosmicHub
 * Provides comprehensive performance tracking with memory management and external integrations
 */
    duration: number;
    timestamp: number;
    metadata?: Record<string, unknown>;
}
    [key: string]: unknown;
}
export type ComponentMetricType = 'render' | 'mount' | 'interaction' | 'custom';
export interface ComponentMetric extends PerformanceMetric {
    componentName: string;
    type: ComponentMetricType;
}
    success: boolean;
}
    type: PageMetricType;
}
    operations: OperationMetric[];
    pages: PageMetric[];
    summary: {
        totalMetrics: number;
        averageRenderTime: number;
        slowestComponent: string;
        fastestComponent: string;
        errorRate: number;
    };
}
declare class PerformanceMonitor {
    private maxMetrics;
    private componentMetrics;
    private operationMetrics;
    private pageMetrics;
    private subscribers;
    recordComponentMetric(componentName: string, duration: number, metadata: {
        type: ComponentMetricType;
    } & MetricMetadata): void;
    recordOperationMetric(operationName: string, duration: number, success: boolean, metadata?: MetricMetadata): void;
    recordPageMetric(pageName: string, duration: number, type: PageMetricType, metadata?: MetricMetadata): void;
    recordMetric(name: string, duration: number, metadata?: MetricMetadata): void;
    getPerformanceReport(): PerformanceReport;
    getMetrics(): {
        averageRenderTime: number;
        totalMetrics: number;
        performanceScore: number;
    };
    enableRealTimeUpdates(callback: (report: PerformanceReport) => void): () => void;
    clearMetrics(): void;
    private notifySubscribers;
    private sendToFirebasePerformance;
    private tryFirebasePerformanceImport;
}
export declare const performanceMonitor: PerformanceMonitor;
export declare const reportPerformance: () => PerformanceReport;
export declare const initServiceWorkerPerformanceCache: () => void;
export {};
//# sourceMappingURL=performance.d.ts.map
