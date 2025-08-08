/**
 * Consolidated Performance Monitoring System for CosmicHub
 * Tracks Core Web Vitals, component performance, build metrics, and user experience
 * Enhanced with React hooks integration and comprehensive analytics
 */

import React, { useState, useEffect, useCallback } from 'react';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
}

export interface WebVitalsMetric extends PerformanceMetric {
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

export interface ComponentMetric extends PerformanceMetric {
  componentName: string;
  renderTime: number;
  propsSize?: number;
  childrenCount?: number;
  type?: 'mount' | 'render' | 'custom' | 'interaction';
  label?: string;
}

export interface OperationMetric extends PerformanceMetric {
  operationName: string;
  success: boolean;
  error?: string;
  label?: string;
}

export interface PageMetric extends PerformanceMetric {
  pageName: string;
  type: 'load' | 'interactive' | 'visibility';
  hidden?: boolean;
}

export interface BuildMetric {
  buildTime: number;
  bundleSize: number;
  cacheHitRate: number;
  timestamp: number;
  gitCommit?: string;
}

export interface PerformanceReport {
  webVitals: { [key: string]: WebVitalsMetric | undefined };
  overallScore: number;
  componentMetrics: ComponentMetric[];
  pageMetrics: PageMetric[];
  operationMetrics: OperationMetric[];
  buildMetrics: BuildMetric[];
}

class PerformanceMonitor {
  private sessionId: string;
  private metrics: PerformanceMetric[] = [];
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    this.initializeWebVitalsTracking();
    this.initializeNavigationTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeWebVitalsTracking(): void {
    if (typeof window === 'undefined') return;

    // Core Web Vitals tracking
    this.trackCLS();
    this.trackFID();
    this.trackLCP();
    this.trackFCP();
    this.trackTTFB();
  }

  private trackCLS(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.recordWebVital('CLS', (entry as any).value, this.getCLSRating((entry as any).value));
          }
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
    }
  }

  private trackFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any;
          this.recordWebVital('FID', fidEntry.processingStart - fidEntry.startTime, 
            this.getFIDRating(fidEntry.processingStart - fidEntry.startTime));
        }
      });
      observer.observe({ type: 'first-input', buffered: true });
    }
  }

  private trackLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordWebVital('LCP', lastEntry.startTime, this.getLCPRating(lastEntry.startTime));
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }
  }

  private trackFCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordWebVital('FCP', entry.startTime, this.getFCPRating(entry.startTime));
          }
        }
      });
      observer.observe({ type: 'paint', buffered: true });
    }
  }

  private trackTTFB(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        this.recordWebVital('TTFB', ttfb, this.getTTFBRating(ttfb));
      }
    }
  }

  private initializeNavigationTracking(): void {
    if (typeof window === 'undefined') return;

    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
        
        this.recordMetric('PageLoad', loadTime);
        this.recordMetric('DOMContentLoaded', domContentLoaded);
      }, 0);
    });

    // Track SPA navigation
    this.trackSPANavigation();
  }

  private trackSPANavigation(): void {
    let currentPath = window.location.pathname;
    
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        const navigationTime = performance.now();
        this.recordMetric('SPANavigation', navigationTime);
        currentPath = window.location.pathname;
      }
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
  }

  // Web Vitals Rating Functions
  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  // Enhanced API with new metric types
  recordWebVital(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor', delta?: number): void {
    const metric: WebVitalsMetric = {
      name,
      value,
      rating,
      delta,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    };

    this.metrics.push(metric);
    this.sendMetricToAnalytics(metric);
  }

  recordMetric(name: string, value: number, additionalData?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      ...additionalData
    };

    this.metrics.push(metric);
    this.sendMetricToAnalytics(metric);
  }

  recordComponentMetric(componentName: string, renderTime: number, additionalData?: Record<string, any>): void {
    const metric: ComponentMetric = {
      name: 'ComponentRender',
      componentName,
      renderTime,
      value: renderTime,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      ...additionalData
    };

    this.metrics.push(metric);
    this.sendMetricToAnalytics(metric);
  }

  recordOperationMetric(operationName: string, duration: number, success: boolean, additionalData?: Record<string, any>): void {
    const metric: OperationMetric = {
      name: 'Operation',
      operationName,
      value: duration,
      success,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      ...additionalData
    };

    this.metrics.push(metric);
    this.sendMetricToAnalytics(metric);
  }

  recordPageMetric(pageName: string, value: number, type: 'load' | 'interactive' | 'visibility', additionalData?: Record<string, any>): void {
    const metric: PageMetric = {
      name: 'PagePerformance',
      pageName,
      value,
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      ...additionalData
    };

    this.metrics.push(metric);
    this.sendMetricToAnalytics(metric);
  }

  recordBuildMetric(buildData: Omit<BuildMetric, 'timestamp'>): void {
    const metric: BuildMetric = {
      ...buildData,
      timestamp: Date.now()
    };

    // In production, send to analytics; in development, log to console
    if (this.isProduction) {
      this.sendBuildMetricToAnalytics(metric);
    } else {
      console.log('📊 Build Metrics:', metric);
    }
  }

  private sendMetricToAnalytics(metric: PerformanceMetric | WebVitalsMetric): void {
    if (!this.isProduction) {
      console.log('📈 Performance Metric:', metric);
      return;
    }

    // Send to analytics service (e.g., Google Analytics, custom endpoint)
    this.batchSendMetrics([metric]);
  }

  private sendBuildMetricToAnalytics(metric: BuildMetric): void {
    // Send build metrics to monitoring service
    if (this.isProduction) {
      // TODO: Integrate with monitoring service (e.g., Datadog, New Relic)
      fetch('/api/metrics/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      }).catch(console.error);
    }
  }

  private batchSendMetrics(metrics: PerformanceMetric[]): void {
    // Batch send metrics to reduce network requests
    if (metrics.length === 0) return;

    // Use sendBeacon for reliability on page unload
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon('/api/metrics', JSON.stringify(metrics));
    } else {
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
        keepalive: true
      }).catch(console.error);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getWebVitalsReport(): { [key: string]: WebVitalsMetric | undefined } {
    const vitals = this.metrics.filter(m => 
      ['CLS', 'FID', 'LCP', 'FCP', 'TTFB'].includes(m.name)
    ) as WebVitalsMetric[];

    return {
      CLS: vitals.find(m => m.name === 'CLS'),
      FID: vitals.find(m => m.name === 'FID'),
      LCP: vitals.find(m => m.name === 'LCP'),
      FCP: vitals.find(m => m.name === 'FCP'),
      TTFB: vitals.find(m => m.name === 'TTFB')
    };
  }

  getComponentMetrics(): ComponentMetric[] {
    return this.metrics.filter(m => m.name === 'ComponentRender') as ComponentMetric[];
  }

  getOperationMetrics(): OperationMetric[] {
    return this.metrics.filter(m => m.name === 'Operation') as OperationMetric[];
  }

  getPageMetrics(): PageMetric[] {
    return this.metrics.filter(m => m.name === 'PagePerformance') as PageMetric[];
  }

  getPerformanceReport(): PerformanceReport {
    return {
      webVitals: this.getWebVitalsReport(),
      overallScore: this.getPerformanceScore(),
      componentMetrics: this.getComponentMetrics(),
      pageMetrics: this.getPageMetrics(),
      operationMetrics: this.getOperationMetrics(),
      buildMetrics: [] // Build metrics are stored separately
    };
  }

  getPerformanceScore(): number {
    const vitals = this.getWebVitalsReport();
    let score = 0;
    let count = 0;

    Object.values(vitals).forEach(vital => {
      if (vital) {
        count++;
        switch (vital.rating) {
          case 'good': score += 100; break;
          case 'needs-improvement': score += 50; break;
          case 'poor': score += 0; break;
        }
      }
    });

    return count > 0 ? Math.round(score / count) : 0;
  }

  // Enhanced analytics with real-time dashboard support
  enableRealTimeUpdates(callback: (report: PerformanceReport) => void): () => void {
    const interval = setInterval(() => {
      callback(this.getPerformanceReport());
    }, 1000);

    return () => clearInterval(interval);
  }

  // Performance budget checking
  checkPerformanceBudget(budgets: { [metricName: string]: number }): { [metricName: string]: boolean } {
    const vitals = this.getWebVitalsReport();
    const results: { [metricName: string]: boolean } = {};

    Object.entries(budgets).forEach(([metricName, budget]) => {
      const metric = vitals[metricName];
      results[metricName] = metric ? metric.value <= budget : true;
    });

    return results;
  }

  // Cleanup
  destroy(): void {
    this.metrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hooks for Performance Monitoring

export interface PerformanceReport {
  webVitals: Record<string, WebVitalsMetric>;
  componentMetrics: any[];
  operationMetrics: any[];
  memoryUsage: { used: number; total: number; };
  timestamp: number;
}

export const useRealTimePerformance = (): PerformanceReport => {
  const [report, setReport] = useState<PerformanceReport>({
    webVitals: {},
    componentMetrics: [],
    operationMetrics: [],
    memoryUsage: { used: 0, total: 0 },
    timestamp: Date.now()
  });

  useEffect(() => {
    const updateReport = () => {
      const webVitals = performanceMonitor.getWebVitals();
      const memoryInfo = (performance as any).memory || { usedJSHeapSize: 0, totalJSHeapSize: 0 };
      
      setReport({
        webVitals,
        componentMetrics: [],
        operationMetrics: [],
        memoryUsage: {
          used: memoryInfo.usedJSHeapSize || 0,
          total: memoryInfo.totalJSHeapSize || 0
        },
        timestamp: Date.now()
      });
    };

    updateReport();
    const interval = setInterval(updateReport, 5000);
    return () => clearInterval(interval);
  }, []);

  return report;
};

export const usePerformance = () => {
  return {
    monitor: performanceMonitor,
    trackMetric: useCallback((name: string, value: number) => {
      performanceMonitor.trackMetric(name, value);
    }, [])
  };
};

export const useOperationTracking = (operationName: string) => {
  return useCallback(async <T>(operation: () => Promise<T> | T): Promise<T> => {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      performanceMonitor.trackMetric(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      performanceMonitor.trackMetric(`${operationName}_error`, duration);
      throw error;
    }
  }, [operationName]);
};

export const usePagePerformance = () => {
  const [metrics, setMetrics] = useState({});
  
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getWebVitals());
    };
    
    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return metrics;
};

export const withPerformanceTracking = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const displayName = componentName || Component.displayName || Component.name || 'Component';
    
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        performanceMonitor.trackMetric(`component_${displayName}`, duration);
      };
    });

    return React.createElement(Component, { ...props, ref });
  });
};
