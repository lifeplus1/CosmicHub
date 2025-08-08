/**
 * React Performance Optimization Implementation
 * Demonstrates the consolidated performance monitoring system in action
 */

import React, { lazy, Suspense, memo, useCallback, useMemo } from 'react';
import { 
  usePerformance, 
  withPerformanceTracking, 
  useOperationTracking,
  usePagePerformance 
} from './hooks';

// Mock components for demo purposes - these would be real components in your app
const HeavyChart = lazy(() => Promise.resolve({ default: () => <div>Heavy Chart Component</div> }));
const DataVisualization = lazy(() => Promise.resolve({ default: () => <div>Data Visualization Component</div> }));
const ComplexCalculator = lazy(() => Promise.resolve({ default: () => <div>Complex Calculator Component</div> }));

// Performance-tracked component example
const OptimizedComponent = memo(withPerformanceTracking(
  ({ data, onUpdate }: { data: any[], onUpdate: (id: string) => void }) => {
    const { startTiming, recordInteraction } = usePerformance('OptimizedComponent');
    
    // Expensive computation with performance tracking
    const processedData = useMemo(() => {
      const stopTiming = startTiming('dataProcessing');
      
      const result = data.map(item => ({
        ...item,
        computed: item.value * Math.random() * 1000
      }));
      
      stopTiming();
      return result;
    }, [data, startTiming]);

    // Optimized event handler
    const handleClick = useCallback((id: string) => {
      recordInteraction('click', performance.now());
      onUpdate(id);
    }, [onUpdate, recordInteraction]);

    return (
      <div className="optimized-component">
        {processedData.map(item => (
          <div key={item.id} onClick={() => handleClick(item.id)}>
            {item.name}: {item.computed.toFixed(2)}
          </div>
        ))}
      </div>
    );
  },
  'OptimizedComponent',
  { trackRender: true, trackMounts: true, trackInteractions: true }
));

// Page-level performance tracking
const PerformanceOptimizedPage: React.FC = () => {
  usePagePerformance('PerformanceOptimizedPage');
  const { trackOperation } = useOperationTracking('PageOperations');
  
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Tracked async operation
  const loadData = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await trackOperation(async () => {
        // Simulate API call
        const response = await fetch('/api/data');
        return response.json();
      }, 'loadData');
      
      setData(result);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [trackOperation]);

  const handleUpdate = useCallback(async (id: string) => {
    await trackOperation(async () => {
      // Simulate update operation
      await new Promise(resolve => setTimeout(resolve, 100));
      setData(prev => prev.map(item => 
        item.id === id ? { ...item, updated: true } : item
      ));
    }, 'updateItem');
  }, [trackOperation]);

  return (
    <div className="performance-optimized-page">
      <h1>Performance Optimized Page</h1>
      
      {/* Suspense boundaries for lazy-loaded components */}
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart data={data} />
      </Suspense>
      
      <Suspense fallback={<div>Loading visualization...</div>}>
        <DataVisualization data={data} />
      </Suspense>
      
      {/* Performance-tracked component */}
      <OptimizedComponent data={data} onUpdate={handleUpdate} />
      
      {/* Conditionally loaded heavy component */}
      {data.length > 100 && (
        <Suspense fallback={<div>Loading calculator...</div>}>
          <ComplexCalculator data={data} />
        </Suspense>
      )}
      
      <button onClick={loadData} disabled={loading}>
        {loading ? 'Loading...' : 'Load Data'}
      </button>
    </div>
  );
};

export default PerformanceOptimizedPage;

// Example of optimized hook patterns
export const useOptimizedDataFetching = (endpoint: string) => {
  const { trackOperation } = useOperationTracking('DataFetching');
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await trackOperation(async () => {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      }, `fetch_${endpoint}`);

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, trackOperation]);

  return { data, loading, error, fetchData };
};

// Performance monitoring utilities
export const performanceUtils = {
  // Measure component render performance
  measureRender: <T extends Record<string, any>>(
    Component: React.ComponentType<T>,
    props: T
  ) => {
    const start = performance.now();
    const element = React.createElement(Component, props);
    const end = performance.now();
    
    console.log(`Render time for ${Component.name}: ${end - start}ms`);
    return element;
  },

  // Track heavy operations
  trackHeavyOperation: async function<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await operation();
      const end = performance.now();
      
      console.log(`${operationName} completed in ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${operationName} failed after ${end - start}ms:`, error);
      throw error;
    }
  },

  // Bundle size analysis
  analyzeBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        transferSize: navigation.transferSize || 0,
        encodedBodySize: navigation.encodedBodySize || 0,
        decodedBodySize: navigation.decodedBodySize || 0,
        compressionRatio: navigation.encodedBodySize && navigation.decodedBodySize 
          ? (navigation.decodedBodySize - navigation.encodedBodySize) / navigation.decodedBodySize 
          : 0
      };
    }
    
    return null;
  }
};

// Export types for TypeScript support
export type PerformanceOptimizedComponentProps<T = any> = {
  data: T[];
  onUpdate: (id: string) => void;
};

export type DataFetchingState<T = any> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
};
