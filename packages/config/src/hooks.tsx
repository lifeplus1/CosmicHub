// Consolidated React Hooks for Performance Tracking
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { performanceMonitor } from './performance';
import type { PerformanceReport } from './performance';

export interface UsePerformanceOptions {
  trackRender?: boolean;
  trackMounts?: boolean;
  trackInteractions?: boolean;
  componentName?: string;
}

export interface PerformanceHookReturn {
  startTiming: (label: string) => () => void;
  recordInteraction: (action: string, duration?: number) => void;
  trackRender: () => () => void;
  renderTime: number | null;
  mountTime: number | null;
}

/**
 * Hook for tracking component performance metrics
 * Automatically tracks render times, mount times, and provides utilities for custom metrics
 */
export const usePerformance = (
  componentName: string,
  options: UsePerformanceOptions = {}
): PerformanceHookReturn => {
  const {
    trackRender = true,
    trackMounts = true,
    trackInteractions = true
  } = options;

  const renderStartTime = useRef<number | null>(null);
  const mountStartTime = useRef<number | null>(null);
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [mountTime, setMountTime] = useState<number | null>(null);
  const timingMap = useRef<Map<string, number>>(new Map());

  // Track component mount time
  useEffect(() => {
    if (trackMounts && mountStartTime.current) {
      const duration = performance.now() - mountStartTime.current;
      setMountTime(duration);
      
      performanceMonitor.recordComponentMetric(componentName, duration, {
        type: 'mount',
        propsSize: JSON.stringify(options).length
      });
    }
  }, [componentName, trackMounts, options]);

  // Start mount timing when component is first created
  if (trackMounts && mountStartTime.current === null) {
    mountStartTime.current = performance.now();
  }

  // Track render performance
  if (trackRender) {
    // Start timing before render
    if (renderStartTime.current === null) {
      renderStartTime.current = performance.now();
    }

    // Use effect to capture render completion
    useEffect(() => {
      if (renderStartTime.current) {
        const duration = performance.now() - renderStartTime.current;
        setRenderTime(duration);
        
        performanceMonitor.recordComponentMetric(componentName, duration, {
          type: 'render'
        });
        
        renderStartTime.current = null;
      }
    });
  }

  // Utility for tracking custom timings
  const startTiming = useCallback((label: string) => {
    const startTime = performance.now();
    timingMap.current.set(label, startTime);

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      timingMap.current.delete(label);
      
      performanceMonitor.recordComponentMetric(componentName, duration, {
        type: 'custom',
        label
      });
      
      return duration;
    };
  }, [componentName]);

  // Utility for recording user interactions
  const recordInteraction = useCallback((action: string, duration?: number) => {
    if (!trackInteractions) return;

    performanceMonitor.recordComponentMetric(componentName, duration || 0, {
      type: 'interaction',
      label: action
    });
  }, [componentName, trackInteractions]);

  // Utility for tracking render cycles manually
  const trackRenderManually = useCallback(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      performanceMonitor.recordComponentMetric(componentName, duration, {
        type: 'custom'
      });
      
      return duration;
    };
  }, [componentName]);

  return {
    startTiming,
    recordInteraction,
    trackRender: trackRenderManually,
    renderTime,
    mountTime
  };
};

/**
 * HOC for automatically tracking component performance
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  options?: UsePerformanceOptions
) {
  const WrappedComponent: React.FC<P> = (props) => {
    const name = componentName || Component.displayName || Component.name || 'UnknownComponent';
    const { renderTime, mountTime } = usePerformance(name, options);

    // Log performance in development
    useEffect(() => {
      if (process.env.NODE_ENV === 'development' && (renderTime || mountTime)) {
        console.log(`🎯 Performance [${name}]:`, {
          renderTime: renderTime ? `${renderTime.toFixed(2)}ms` : 'N/A',
          mountTime: mountTime ? `${mountTime.toFixed(2)}ms` : 'N/A'
        });
      }
    }, [renderTime, mountTime, name]);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceTracking(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook for tracking expensive operations and computations
 */
export const useOperationTracking = (operationName: string) => {
  const trackOperation = useCallback(
    async function<T>(operation: () => Promise<T> | T, label?: string): Promise<T> {
      const startTime = performance.now();
      
      try {
        const result = await operation();
        const duration = performance.now() - startTime;
        
        performanceMonitor.recordOperationMetric(operationName, duration, true, {
          label: label || 'default'
        });
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        performanceMonitor.recordOperationMetric(operationName, duration, false, {
          label: label || 'default',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    },
    [operationName]
  );

  return { trackOperation };
};

/**
 * Hook for tracking page load and navigation performance
 */
export const usePagePerformance = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    // Track when page becomes interactive
    const trackInteractive = () => {
      const interactiveTime = performance.now() - startTime;
      performanceMonitor.recordPageMetric(pageName, interactiveTime, 'interactive');
    };

    // Use a small delay to ensure page is fully interactive
    const timeoutId = setTimeout(trackInteractive, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pageName]);

  // Track page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      performanceMonitor.recordPageMetric(pageName, Date.now(), 'visibility', {
        hidden: document.hidden
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pageName]);
};

/**
 * Hook for monitoring memory usage
 */
export const useMemoryTracking = (componentName: string) => {
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const usage = memInfo.usedJSHeapSize;
        setMemoryUsage(usage);
        
        performanceMonitor.recordComponentMetric(componentName, usage, {
          type: 'custom',
          label: 'memory-usage'
        });
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [componentName]);

  return memoryUsage;
};

/**
 * Hook for real-time performance monitoring
 */
export const useRealTimePerformance = () => {
  const [report, setReport] = useState<PerformanceReport>(() => performanceMonitor.getPerformanceReport());

  useEffect(() => {
    const unsubscribe = performanceMonitor.enableRealTimeUpdates(setReport);
    return unsubscribe;
  }, []);

  return report;
};
