/**
 * Enhanced Performance Monitoring System for CosmicHub
 * Provides comprehensive performance tracking with memory management and external integrations
 */

// Simple logger for production builds
const logger = {
  info: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${message}`, data);
    }
  },
  error: (message, data) => {
    console.error(`[Performance Error] ${message}`, data);
  },
  warn: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Performance Warning] ${message}`, data);
    }
  },
};
class PerformanceMonitor {
  maxMetrics = 1000; // Prevent memory issues
  componentMetrics = [];
  operationMetrics = [];
  pageMetrics = [];
  subscribers = new Set();
  recordComponentMetric(componentName, duration, metadata) {
    // Cap metrics to prevent memory issues
    if (this.componentMetrics.length >= this.maxMetrics) {
      this.componentMetrics.shift(); // Remove oldest metric
    }
    const metric = {
      name: `${componentName}:${metadata.type}`,
      duration,
      timestamp: Date.now(),
      componentName,
      type: metadata.type,
      metadata,
    };
    this.componentMetrics.push(metric);
    this.notifySubscribers();
    // Send to Firebase Performance Monitoring if available
    this.sendToFirebasePerformance(componentName, duration, metadata);
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('Component performance metric', {
        component: componentName,
        type: metadata.type,
        durationMs: Number(duration.toFixed(2)),
        ...metadata,
      });
    }
  }
  recordOperationMetric(operationName, duration, success, metadata) {
    // Cap metrics to prevent memory issues
    if (this.operationMetrics.length >= this.maxMetrics) {
      this.operationMetrics.shift(); // Remove oldest metric
    }
    const metric = {
      name: operationName,
      duration,
      timestamp: Date.now(),
      operationName,
      success,
      metadata,
    };
    this.operationMetrics.push(metric);
    this.notifySubscribers();
    // Send to Firebase Performance Monitoring
    this.sendToFirebasePerformance(operationName, duration, {
      success,
      ...metadata,
    });
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      if (success) {
        logger.info('Operation completed successfully', {
          operation: operationName,
          durationMs: Number(duration.toFixed(2)),
          ...metadata,
        });
      } else {
        logger.error('Operation failed', {
          operation: operationName,
          durationMs: Number(duration.toFixed(2)),
          ...metadata,
        });
      }
    }
  }
  recordPageMetric(pageName, duration, type, metadata) {
    // Cap metrics to prevent memory issues
    if (this.pageMetrics.length >= this.maxMetrics) {
      this.pageMetrics.shift(); // Remove oldest metric
    }
    const metric = {
      name: `${pageName}:${type}`,
      duration,
      timestamp: Date.now(),
      pageName,
      type,
      metadata,
    };
    this.pageMetrics.push(metric);
    this.notifySubscribers();
    // Send to Firebase Performance Monitoring
    this.sendToFirebasePerformance(`${pageName}_${type}`, duration, metadata);
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      logger.info('Page performance metric', {
        page: pageName,
        type: type,
        durationMs: Number(duration.toFixed(2)),
        ...metadata,
      });
    }
  }
  recordMetric(name, duration, metadata) {
    // Generic metric recording for backwards compatibility
    this.recordOperationMetric(name, duration, true, metadata);
  }
  getPerformanceReport() {
    const totalMetrics =
      this.componentMetrics.length +
      this.operationMetrics.length +
      this.pageMetrics.length;
    const renderMetrics = this.componentMetrics.filter(
      m => m.type === 'render'
    );
    const averageRenderTime =
      renderMetrics.length > 0
        ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) /
          renderMetrics.length
        : 0;
    const slowestComponent =
      renderMetrics.length > 0
        ? renderMetrics.reduce((max, m) =>
            m.duration > max.duration ? m : max
          ).componentName
        : '';
    const fastestComponent =
      renderMetrics.length > 0
        ? renderMetrics.reduce((min, m) =>
            m.duration < min.duration ? m : min
          ).componentName
        : '';
    const failedOperations = this.operationMetrics.filter(
      m => !m.success
    ).length;
    const errorRate =
      this.operationMetrics.length > 0
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
        errorRate,
      },
    };
  }
  getMetrics() {
    const report = this.getPerformanceReport();
    const performanceScore = Math.max(
      0,
      100 - report.summary.averageRenderTime / 2 - report.summary.errorRate
    );
    return {
      averageRenderTime: report.summary.averageRenderTime,
      totalMetrics: report.summary.totalMetrics,
      performanceScore: Math.round(performanceScore),
    };
  }
  enableRealTimeUpdates(callback) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }
  clearMetrics() {
    this.componentMetrics = [];
    this.operationMetrics = [];
    this.pageMetrics = [];
    this.notifySubscribers();
  }
  notifySubscribers() {
    const report = this.getPerformanceReport();
    this.subscribers.forEach(callback => callback(report));
  }
  sendToFirebasePerformance(name, duration, metadata) {
    try {
      // Only send to Firebase in production and if available
      if (
        process.env.NODE_ENV === 'production' &&
        typeof window !== 'undefined'
      ) {
        // Dynamic import to avoid issues in environments without Firebase
        // Check if Firebase Performance is available before importing
        this.tryFirebasePerformanceImport(name, duration, metadata);
      }
    } catch (error) {
      // Silently fail if Firebase is not available
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Firebase Performance Monitoring skipped', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  async tryFirebasePerformanceImport(name, duration, metadata) {
    try {
      // Configure Firebase Performance monitoring
      if (typeof window !== 'undefined' && import.meta.env.PROD) {
        // In production, attempt to use Firebase Performance
        const { getPerformance, trace } = await import('firebase/performance');
        // Use lazy import for Firebase app
        const firebaseModule = await import('@cosmichub/config/firebase');
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
      } else if (import.meta.env.DEV) {
        logger.info('Performance trace recorded', {
          operation: name,
          durationMs: duration,
          ...metadata,
        });
      }
    } catch {
      // Firebase Performance not available or not configured
      if (import.meta.env.DEV) {
        logger.warn(
          'Firebase Performance Monitoring not available, skipping trace',
          { operation: name }
        );
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
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/performance-sw.js')
      .then(registration => {
        logger.info('Performance service worker registered', {
          scope: registration.scope,
        });
      })
      .catch(error => {
        logger.error('Performance service worker registration failed', {
          error: error instanceof Error ? error.message : String(error),
        });
      });
  }
};
//# sourceMappingURL=performance.js.map
