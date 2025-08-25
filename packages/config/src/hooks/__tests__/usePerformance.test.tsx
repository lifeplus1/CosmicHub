import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act, cleanup, waitFor } from '@testing-library/react';
import {
  usePerformance,
  useOperationTracking,
  usePagePerformance,
  useMemoryMonitoring,
} from '../usePerformance';

function renderHook<T>(hook: () => T): { get: () => T } {
  let latest: T;
  function HookConsumer() {
    latest = hook();
    return null;
  }
  render(<HookConsumer />);
  return { get: () => latest! };
}

describe('usePerformance basic timing', () => {
  afterEach(() => cleanup());

  it('starts and ends tracking returning metrics', async () => {
    const { get } = renderHook(() => usePerformance());
    expect(get().isTracking).toBe(false);
    act(() => get().start());
    expect(get().isTracking).toBe(true);
    act(() => {
      get().end();
    });
    await waitFor(() => {
      expect(get().metrics).not.toBeNull();
    });
    const metrics = get().metrics!;
    expect(typeof metrics.duration).toBe('number');
    expect(metrics.duration).toBeGreaterThanOrEqual(0);
    expect(metrics.endTime).toBeGreaterThanOrEqual(metrics.startTime);
  });

  it('measures async operation', async () => {
    const { get } = renderHook(() => usePerformance());
    const { measure } = get();
    const asyncOp = vi.fn(async () => {
      await new Promise(r => setTimeout(r, 5));
      return 42;
    });
    let resultValue: number | undefined;
    let metricsDuration: number | undefined;
    await act(async () => {
      const { result, metrics } = await measure('testOp', asyncOp);
      resultValue = result;
      metricsDuration = metrics.duration;
    });
    expect(asyncOp).toHaveBeenCalled();
    expect(resultValue).toBe(42);
    expect(metricsDuration).toBeDefined();
    expect(metricsDuration ?? 0).toBeGreaterThan(0);
  });
});

describe('useOperationTracking', () => {
  afterEach(() => cleanup());

  it('tracks start and end operations', async () => {
    const { get } = renderHook(() => useOperationTracking());
    const api = get();
    let id: string = '';
    act(() => {
      id = api.startOperation('loadData');
    });
    await waitFor(() => {
      expect(get().operations.length).toBe(1);
    });
    act(() => api.endOperation(id));
    await waitFor(() => {
      expect(get().operations[0].status).toBe('completed');
    });
    const op = get().operations[0];
    expect(op.duration).toBeDefined();
  });

  it('trackOperation wraps async function success and error', async () => {
    const { get } = renderHook(() => useOperationTracking());
    const success = await act(async () =>
      get().trackOperation('successOp', async () => 7)
    );
    expect(success).toBe(7);
    await expect(
      get().trackOperation('failOp', async () => {
        throw new Error('nope');
      })
    ).rejects.toThrow('nope');
    await waitFor(() => {
      expect(get().operations.some(o => o.operationName === 'failOp')).toBe(
        true
      );
    });
    const fail = get().operations.find(o => o.operationName === 'failOp');
    expect(fail?.status).toBe('error');
  });
});

describe('usePagePerformance', () => {
  afterEach(() => cleanup());

  it('collects basic page metrics when document is complete', () => {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: () => 'complete',
    });
    const originalGetEntriesByType =
      performance.getEntriesByType.bind(performance);
    performance.getEntriesByType = (type: string) => {
      if (type === 'paint') {
        return [
          { name: 'first-contentful-paint', startTime: 12 },
        ] as unknown as PerformanceEntry[];
      }
      if (type === 'navigation') {
        return [{ duration: 123 }] as unknown as PerformanceEntry[];
      }
      return originalGetEntriesByType(type);
    };
    const { get } = renderHook(() => usePagePerformance());
    const { metrics, isLoading } = get();
    expect(isLoading).toBe(false);
    expect(metrics.pageLoadTime).toBeDefined();
    expect(metrics.firstContentfulPaint).toBe(12);
    performance.getEntriesByType = originalGetEntriesByType;
  });
});

describe('useMemoryMonitoring', () => {
  afterEach(() => cleanup());

  it('reads memory info (if available)', () => {
    (performance as unknown as { memory?: any }).memory = {
      usedJSHeapSize: 1000,
      totalJSHeapSize: 4000,
      jsHeapSizeLimit: 8000,
    };
    const { get } = renderHook(() => useMemoryMonitoring());
    const { memoryInfo, getMemoryUsagePercentage, formatBytes } = get();
    if (memoryInfo) {
      expect(memoryInfo.used).toBe(1000);
      expect(getMemoryUsagePercentage()).toBeGreaterThan(0);
      expect(formatBytes(1024)).toBe('1 KB');
    }
  });
});

// Note: useRealTimePerformance left for a dedicated integration-style test with module mocking.
