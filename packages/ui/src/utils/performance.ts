// Performance Monitoring Framework
// Advanced performance tracking and optimization utilities

import React, { useEffect, useRef, useCallback } from 'react';

// Performance metrics interface
export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  memoryUsage?: number;
  interactionTime?: number;
}

// Memory info interface
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Extended performance interface
interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

// Performance hook for component monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const mountTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    renderCountRef.current = 1;
    lastRenderTimeRef.current = performance.now();

    // Log initial mount
    console.log(`[Performance] ${componentName} mounted at ${mountTimeRef.current}ms`);

    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTimeRef.current;
      console.log(`[Performance] ${componentName} unmounted after ${totalLifetime.toFixed(2)}ms lifetime`);
    };
  }, [componentName]);

  const trackRender = useCallback(() => {
    const now = performance.now();
    const renderTime = now - lastRenderTimeRef.current;
    renderCountRef.current += 1;
    lastRenderTimeRef.current = now;

    if (renderTime > 16.67) { // More than one frame at 60fps
      console.warn(`[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }

    return {
      renderTime,
      renderCount: renderCountRef.current,
      componentName
    };
  }, [componentName]);

  const trackInteraction = useCallback((interactionName: string) => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (duration > 100) { // Interactions should be < 100ms
        console.warn(`[Performance] ${componentName} slow interaction "${interactionName}": ${duration.toFixed(2)}ms`);
      }

      return duration;
    };
  }, [componentName]);

  return {
    trackRender,
    trackInteraction,
    getMetrics: () => ({
      componentName,
      mountTime: mountTimeRef.current,
      renderTime: lastRenderTimeRef.current - mountTimeRef.current,
      updateCount: renderCountRef.current,
    })
  };
};

// Performance optimization HOC
export const withPerformanceTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  const Component = (props: P) => {
    const { trackRender } = usePerformanceMonitor(componentName);

    useEffect(() => {
      trackRender();
    });

    return React.createElement(WrappedComponent, props);
  };

  Component.displayName = `withPerformanceTracking(${componentName})`;
  return Component;
};

// Memory usage tracker
export const useMemoryMonitor = () => {
  const checkMemoryUsage = useCallback(() => {
    const perf = performance as ExtendedPerformance;
    if (perf.memory) {
      const memInfo = perf.memory;
      return {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        limit: memInfo.jsHeapSizeLimit,
        usagePercent: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }, []);

  return { checkMemoryUsage };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const scripts = resources.filter(r => r.name.endsWith('.js'));

    return scripts.map(script => ({
      url: script.name,
      size: script.transferSize,
      loadTime: script.responseEnd - script.requestStart
    }));
  }
  return [];
};

// Performance budget checker
export const checkPerformanceBudget = (metrics: PerformanceMetrics) => {
  const budgets = {
    maxRenderTime: 16.67, // 60fps
    maxMountTime: 100, // 100ms
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  };

  const violations = [];

  if (metrics.renderTime > budgets.maxRenderTime) {
    violations.push(`Render time ${metrics.renderTime.toFixed(2)}ms exceeds budget of ${budgets.maxRenderTime}ms`);
  }

  if (metrics.mountTime > budgets.maxMountTime) {
    violations.push(`Mount time ${metrics.mountTime.toFixed(2)}ms exceeds budget of ${budgets.maxMountTime}ms`);
  }

  if (metrics.memoryUsage && metrics.memoryUsage > budgets.maxMemoryUsage) {
    violations.push(`Memory usage ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB exceeds budget of ${(budgets.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
  }

  return violations;
};
