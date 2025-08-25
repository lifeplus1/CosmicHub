/**
 * Enhanced Performance Monitoring System for CosmicHub
 * Provides comprehensive performance tracking with memory ma    // Log in development
    if (process.env['    // Log in development
    if (process.env['NODE_ENV'] === 'development') {
      performanceLogger.info('Page performance metric', {
        page: pageName,
        metricType: type,
        durationMs: Number(duration.toFixed(2)),
        ...metadata
      });
    }_ENV'] === 'development') {
      if (success) {
        performanceLogger.info('Operation completed successfully', {
          operation: operationName,
          durationMs: Number(duration.toFixed(2)),
          ...metadata
        });
      } else {
        performanceLogger.error('Operation failed', {
          operation: operationName,
          durationMs: Number(duration.toFixed(2)),
          ...metadata
        });
      }
    }ment and external integrations
 */

import { logger } from './utils/logger';

const performanceLogger = logger.child({ module: 'performance' });

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface MetricMetadata {
  label?: string;
  [key: string]: unknown;
}

export type ComponentMetricType = 'render' | 'mount' | 'interaction' | 'custom';
export type PageMetricType = 'load' | 'interactive' | 'visibility';

export interface ComponentMetric extends PerformanceMetric {
  componentName: string;
  type: ComponentMetricType;
}

export interface OperationMetric extends PerformanceMetric {
  operationName: string;
  success: boolean;
}

export interface PageMetric extends PerformanceMetric {
  pageName: string;
  type: PageMetricType;
}

export interface PerformanceReport {
  components: ComponentMetric[];
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

class PerformanceMonitor {
  private maxMetrics = 1000; // Prevent memory issues
  private componentMetrics: ComponentMetric[] = [];
  private operationMetrics: OperationMetric[] = [];
  private pageMetrics: PageMetric[] = [];
  private subscribers: Set<(report: PerformanceReport) => void> = new Set();

  recordComponentMetric(
    componentName: string, 
    duration: number, 
    metadata: { type: ComponentMetricType } & MetricMetadata
  ): void {
    // Cap metrics to prevent memory issues
    if (this.componentMetrics.length >= this.maxMetrics) {
      this.componentMetrics.shift(); // Remove oldest metric
    }

    const metric: ComponentMetric = {
      name: `${componentName}:${metadata.type}`,
      duration,
      timestamp: Date.now(),
      componentName,
      type: metadata.type,
      metadata
    };

    this.componentMetrics.push(metric);
    this.notifySubscribers();

    // Send to Firebase Performance Monitoring if available
    this.sendToFirebasePerformance(componentName, duration, metadata);

    // Log in development
    if (process.env['NODE_ENV'] === 'development') {
      performanceLogger.info('Component performance metric', {
        component: componentName,
        metricType: metadata.type,
        durationMs: Number(duration.toFixed(2)),
        ...metadata
      });
    }
  }

  recordOperationMetric(
    operationName: string,
    duration: number,
    success: boolean,
    metadata?: MetricMetadata
  ): void {
    // Cap metrics to prevent memory issues
    if (this.operationMetrics.length >= this.maxMetrics) {
      this.operationMetrics.shift(); // Remove oldest metric
    }

    const metric: OperationMetric = {
      name: operationName,
      duration,
      timestamp: Date.now(),
      operationName,
      success,
      metadata: metadata ?? {}
    };

    this.operationMetrics.push(metric);
    this.notifySubscribers();

    // Send to Firebase Performance Monitoring
    this.sendToFirebasePerformance(operationName, duration, { success, ...metadata });

    // Log in development
  if (process.env['NODE_ENV'] === 'development') {
      console.log(`⚡ [${operationName}] ${success ? '✅' : '❌'}: ${duration.toFixed(2)}ms`, metadata);
    }
  }

  recordPageMetric(
    pageName: string,
    duration: number,
    type: PageMetricType,
    metadata?: MetricMetadata
  ): void {
    // Cap metrics to prevent memory issues
    if (this.pageMetrics.length >= this.maxMetrics) {
      this.pageMetrics.shift(); // Remove oldest metric
    }

    const metric: PageMetric = {
      name: `${pageName}:${type}`,
      duration,
      timestamp: Date.now(),
      pageName,
      type,
      metadata: metadata ?? {}
    };

    this.pageMetrics.push(metric);
    this.notifySubscribers();

    // Send to Firebase Performance Monitoring
    this.sendToFirebasePerformance(`${pageName}_${type}`, duration, metadata);

    // Log in development
  if (process.env['NODE_ENV'] === 'development') {
      console.log(`🌐 [${pageName}] ${type}: ${duration.toFixed(2)}ms`, metadata);
    }
  }

  recordMetric(name: string, duration: number, metadata?: MetricMetadata): void {
    // Generic metric recording for backwards compatibility
    this.recordOperationMetric(name, duration, true, metadata);
  }

  getPerformanceReport(): PerformanceReport {
    const totalMetrics = this.componentMetrics.length + this.operationMetrics.length + this.pageMetrics.length;
    
    const renderMetrics = this.componentMetrics.filter(m => m.type === 'render');
    const averageRenderTime = renderMetrics.length > 0 
      ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length 
      : 0;

    const slowestComponent = renderMetrics.length > 0
      ? renderMetrics.reduce((max, m) => m.duration > max.duration ? m : max).componentName
      : '';

    const fastestComponent = renderMetrics.length > 0
      ? renderMetrics.reduce((min, m) => m.duration < min.duration ? m : min).componentName
      : '';

    const failedOperations = this.operationMetrics.filter(m => !m.success).length;
    const errorRate = this.operationMetrics.length > 0 
      ? (failedOperations / this.operationMetrics.length) * 100 
      : 0;

    return {
      components: this.componentMetrics,
      operations: this.operationMetrics,
      pages: this.pageMetrics,
      summary: {
        totalMetrics,
        averageRenderTime,
        slowestComponent,
        fastestComponent,
        errorRate
      }
    };
  }

  getMetrics(): { averageRenderTime: number; totalMetrics: number; performanceScore: number } {
    const report = this.getPerformanceReport();
    const performanceScore = Math.max(0, 100 - (report.summary.averageRenderTime / 2) - report.summary.errorRate);
    
    return {
      averageRenderTime: report.summary.averageRenderTime,
      totalMetrics: report.summary.totalMetrics,
      performanceScore: Math.round(performanceScore)
    };
  }

  enableRealTimeUpdates(callback: (report: PerformanceReport) => void): () => void {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  clearMetrics(): void {
    this.componentMetrics = [];
    this.operationMetrics = [];
    this.pageMetrics = [];
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    const report = this.getPerformanceReport();
    this.subscribers.forEach(callback => callback(report));
  }

  private sendToFirebasePerformance(
    name: string, 
    duration: number, 
    metadata?: MetricMetadata
  ): void {
    try {
      // Only send to Firebase in production and if available
  if (process.env['NODE_ENV'] === 'production' && typeof window !== 'undefined') {
        // Dynamic import to avoid issues in environments without Firebase
        // Check if Firebase Performance is available before importing
  void this.tryFirebasePerformanceImport(name, duration, metadata);
      }
    } catch (error) {
      // Silently fail if Firebase is not available
  if (process.env['NODE_ENV'] === 'development') {
        console.log('Firebase Performance Monitoring skipped:', error);
      }
    }
  }

  private async tryFirebasePerformanceImport(
    name: string, 
    duration: number, 
    metadata?: MetricMetadata
  ): Promise<void> {
    try {
      // Configure Firebase Performance monitoring
      if (typeof window !== 'undefined' && process.env['NODE_ENV'] === 'production') {
        // In production, attempt to use Firebase Performance
        const { getPerformance, trace } = await import('firebase/performance');
        
        // Use lazy import for Firebase app
        const firebaseModule = await import('./firebase');
        const perf = getPerformance(firebaseModule.app);
        const performanceTrace = trace(perf, name);
        
        // Record custom timing
        performanceTrace.start();
        setTimeout(() => {
          performanceTrace.stop();
        }, duration);
        
        // Add custom attributes if provided
        if (metadata) {
          Object.entries(metadata).forEach(([key, value]) => {
            performanceTrace.putAttribute(key, String(value));
          });
        }
      } else if (process.env['NODE_ENV'] === 'development') {
        performanceLogger.info('Performance trace recorded', { 
          operation: name, 
          durationMs: duration,
          ...metadata 
        });
      }
    } catch {
      // Firebase Performance not available or not configured
      if (process.env['NODE_ENV'] === 'development') {
        performanceLogger.warn('Firebase Performance Monitoring not available, skipping trace', { operation: name });
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export minimal function for Docker build compatibility
export const reportPerformance = () => {
  return performanceMonitor.getPerformanceReport();
};

// Service Worker Integration Helper
export const initServiceWorkerPerformanceCache = () => {
  if ('serviceWorker' in navigator && process.env['NODE_ENV'] === 'production') {
    void navigator.serviceWorker.register('/performance-sw.js')
      .then(registration => {
        performanceLogger.info('Performance service worker registered', { registration: registration.scope });
      })
      .catch(error => {
        performanceLogger.error('Performance service worker registration failed', { 
          error: error instanceof Error ? error.message : String(error) 
        });
      });
  }
};