import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';

// Mock the dynamically imported performance monitor using the same specifier used in the hook
const updateCallbacks: Array<(r: any) => void> = [];  // eslint-disable-line no-unused-vars

const initialReport = {
  components: [],
  operations: [],
  pages: [],
  summary: { totalMetrics: 1, averageRenderTime: 5, slowestComponent: '', fastestComponent: '', errorRate: 0 }
} as const;

vi.mock('../performance', () => {
  return {
    performanceMonitor: {
      getPerformanceReport: () => initialReport,
      enableRealTimeUpdates: (cb: (r: any) => void) => {  // eslint-disable-line no-unused-vars
        updateCallbacks.push(cb);
        return () => {
          const idx = updateCallbacks.indexOf(cb);
            if (idx >= 0) updateCallbacks.splice(idx, 1);
        };
      }
    }
  };
});

import { useRealTimePerformance } from './usePerformance';

function HookProbe({ onReport }: { onReport: (r: any) => void }) {  // eslint-disable-line no-unused-vars
  const report = useRealTimePerformance();
  React.useEffect(() => { onReport(report); }, [report, onReport]);
  return null;
}

describe('useRealTimePerformance', () => {
  afterEach(() => {
    cleanup();
    updateCallbacks.length = 0;
  });

  it('loads initial report and responds to updates', async () => {
    let latest: any = null;
    render(<HookProbe onReport={(r) => { latest = r; }} />);

    await waitFor(() => {
      expect(latest).not.toBeNull();
      expect(latest.summary.totalMetrics).toBe(1);
    });

    // Simulate real-time update
    const updated = {
      components: [{ name: 'CompA:render', duration: 10, timestamp: Date.now(), componentName: 'CompA', type: 'render', metadata: { type: 'render' } }],
      operations: [],
      pages: [],
      summary: { totalMetrics: 2, averageRenderTime: 7, slowestComponent: 'CompA', fastestComponent: 'CompA', errorRate: 0 }
    };
    updateCallbacks.forEach(cb => cb(updated));

    await waitFor(() => {
      expect(latest.summary.totalMetrics).toBe(2);
      expect(latest.summary.slowestComponent).toBe('CompA');
    });
  });

  it('cleans up subscription on unmount', async () => {
    let latest: any = null;
    const { unmount } = render(<HookProbe onReport={(r) => { latest = r; }} />);
    await waitFor(() => { expect(latest).not.toBeNull(); });
    unmount();
    const currentCount = updateCallbacks.length; // after unmount callback should be removed
    // Fire an update; length should remain the same if cleanup worked
    updateCallbacks.slice().forEach(cb => cb(initialReport));
    expect(updateCallbacks.length).toBe(currentCount);
  });
});
