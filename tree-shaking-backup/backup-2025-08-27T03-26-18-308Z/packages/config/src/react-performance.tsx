/**
 * React Performance Optimization Implementation
 * Demonstrates the consolidated performance monitoring system in action
 */

// @ts-nocheck
/* eslint-disable */
import React, { lazy, Suspense, memo, useCallback } from 'react';

const devConsole = {
  log: import.meta.env?.DEV ? console.log.bind(console) : undefined,
  warn: import.meta.env?.DEV ? console.warn.bind(console) : undefined,
  error: console.error.bind(console),
};
/* eslint-enable no-console */
import {
  usePerformance,
  useOperationTracking,
  usePagePerformance,
} from './hooks';

// Mock components for demo purposes - these would be real components in your app
const HeavyChart = lazy(() =>
  Promise.resolve({
    default: ({ data }: { data: any[] }) => (
      <div>Heavy Chart Component ({data.length} items)</div>
    ),
  })
);
const DataVisualization = lazy(() =>
  Promise.resolve({
    default: ({ data }: { data: any[] }) => (
      <div>Data Visualization Component ({data.length} data points)</div>
    ),
  })
);
const ComplexCalculator = lazy(() =>
  Promise.resolve({
    default: ({ data }: { data: any[] }) => (
      <div>Complex Calculator Component (processing {data.length} items)</div>
    ),
  })
);

// Performance-tracked component example
const OptimizedComponent: React.FC<{
  data: any[];
  onUpdate: (id: string) => void;
}> = memo(
  ({ data, onUpdate }: { data: any[]; onUpdate: (id: string) => void }) => {
    const performance = usePerformance();
    const [processedData, setProcessedData] = React.useState<any[]>([]);

    // Expensive computation with performance tracking
    React.useEffect(() => {
      const processData = async () => {
        const { result } = await performance.measure('dataProcessing', () => {
          return data.map(item => ({
            ...item,
            computed: item.value * Math.random() * 1000,
          }));
        });
        setProcessedData(result);
      };

      void processData();
    }, [data, performance]);

    // Optimized event handler
    const handleClick = useCallback(
      (id: string) => {
        void performance.measure('click', () => {
          onUpdate(id);
        });
      },
      [onUpdate, performance]
    );

    return (
      <div className='optimized-component'>
        {processedData.map((item: any) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            role='button'
            tabIndex={0}
          >
            {item.name}: {item.computed.toFixed(2)}
          </div>
        ))}
      </div>
    );
  }
);
OptimizedComponent.displayName = 'OptimizedComponent';

// Page-level performance tracking
const PerformanceOptimizedPage: React.FC = () => {
  const pagePerformance = usePagePerformance();
  const performanceOps = useOperationTracking();

  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Tracked async operation
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const { result } = await performanceOps.trackOperation(
        'loadData',
        async () => {
          // Simulate API call
          const response = await fetch('/api/data');
          return response.json();
        }
      );

      setData(result as any[]);
    } catch (error) {
      devConsole.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [performanceOps]);

  const handleUpdate = useCallback(
    async (id: string) => {
      await performanceOps.trackOperation('updateItem', async () => {
        // Simulate update operation
        await new Promise(resolve => setTimeout(resolve, 100));
        setData(prev =>
          prev.map(item => (item.id === id ? { ...item, updated: true } : item))
        );
      });
    },
    [performanceOps]
  );

  return (
    <div className='performance-optimized-page'>
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
  const performanceOps = useOperationTracking();
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { result } = await performanceOps.trackOperation(
        `fetch_${endpoint}`,
        async () => {
          const response = await fetch(endpoint);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        }
      );

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, performanceOps]);

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

    devConsole.log?.(`Render time for ${Component.name}: ${end - start}ms`);
    return element;
  },

  // Track heavy operations
  trackHeavyOperation: async function <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await operation();
      const end = performance.now();

      devConsole.log?.(`${operationName} completed in ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      devConsole.error(
        `${operationName} failed after ${end - start}ms:`,
        error
      );
      throw error;
    }
  },

  // Bundle size analysis
  analyzeBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      return {
        transferSize: navigation.transferSize || 0,
        encodedBodySize: navigation.encodedBodySize || 0,
        decodedBodySize: navigation.decodedBodySize || 0,
        compressionRatio:
          navigation.encodedBodySize && navigation.decodedBodySize
            ? (navigation.decodedBodySize - navigation.encodedBodySize) /
              navigation.decodedBodySize
            : 0,
      };
    }

    return null;
  },
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
