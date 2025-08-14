// /Users/Chris/Projects/CosmicHub/packages/config/src/__tests__/performance.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { performanceMonitor } from '../performance';

// Mock Firebase Performance
vi.mock('firebase/performance', () => ({
  getPerformance: vi.fn(),
  trace: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    putMetric: vi.fn(),
    putAttribute: vi.fn()
  }))
}));

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
  });

  test('records component metric correctly', () => {
    performanceMonitor.recordComponentMetric('TestComponent', 100, { type: 'render' });
    
    const report = performanceMonitor.getPerformanceReport();
    expect(report.components).toHaveLength(1);
    expect(report.components[0].componentName).toBe('TestComponent');
    expect(report.components[0].duration).toBe(100);
    expect(report.components[0].type).toBe('render');
  });

  test('records operation metric correctly', () => {
    performanceMonitor.recordOperationMetric('API_CALL', 250, true, { endpoint: '/api/charts' });
    
    const report = performanceMonitor.getPerformanceReport();
    expect(report.operations).toHaveLength(1);
    expect(report.operations[0].operationName).toBe('API_CALL');
    expect(report.operations[0].duration).toBe(250);
    expect(report.operations[0].success).toBe(true);
  });

  test('records page metric correctly', () => {
    performanceMonitor.recordPageMetric('Dashboard', 300, 'load', { route: '/' });
    
    const report = performanceMonitor.getPerformanceReport();
    expect(report.pages).toHaveLength(1);
    expect(report.pages[0].pageName).toBe('Dashboard');
    expect(report.pages[0].duration).toBe(300);
    expect(report.pages[0].type).toBe('load');
  });

  test('calculates performance summary correctly', () => {
    // Add some test data
    performanceMonitor.recordComponentMetric('Component1', 50, { type: 'render' });
    performanceMonitor.recordComponentMetric('Component2', 150, { type: 'render' });
    performanceMonitor.recordOperationMetric('SuccessOp', 100, true);
    performanceMonitor.recordOperationMetric('FailedOp', 200, false);
    
    const report = performanceMonitor.getPerformanceReport();
    
    expect(report.summary.totalMetrics).toBe(4);
    expect(report.summary.averageRenderTime).toBe(100); // (50 + 150) / 2
    expect(report.summary.errorRate).toBe(50); // 1 failed out of 2 operations
  });

  test('limits metrics storage to prevent memory issues', () => {
    // Add more than the max limit (assuming 1000 is the limit)
    for (let i = 0; i < 1005; i++) {
      performanceMonitor.recordComponentMetric(`Component${i}`, 100, { type: 'render' });
    }
    
    const report = performanceMonitor.getPerformanceReport();
    expect(report.components.length).toBeLessThanOrEqual(1000);
  });

  test('enables real-time updates with callback', () => {
    const mockCallback = vi.fn();
    const unsubscribe = performanceMonitor.enableRealTimeUpdates(mockCallback);
    
    // Record a metric
    performanceMonitor.recordComponentMetric('TestComponent', 100, { type: 'render' });
    
    expect(mockCallback).toHaveBeenCalledTimes(1);
    
    // Unsubscribe and record another metric
    unsubscribe();
    performanceMonitor.recordComponentMetric('TestComponent2', 200, { type: 'render' });
    
    expect(mockCallback).toHaveBeenCalledTimes(1); // Should not be called again
  });

  test('clears metrics correctly', () => {
    performanceMonitor.recordComponentMetric('TestComponent', 100, { type: 'render' });
    performanceMonitor.recordOperationMetric('TestOp', 200, true);
    
    let report = performanceMonitor.getPerformanceReport();
    expect(report.summary.totalMetrics).toBe(2);
    
    performanceMonitor.clearMetrics();
    
    report = performanceMonitor.getPerformanceReport();
    expect(report.summary.totalMetrics).toBe(0);
    expect(report.components).toHaveLength(0);
    expect(report.operations).toHaveLength(0);
    expect(report.pages).toHaveLength(0);
  });

  test('calculates performance score correctly', () => {
    performanceMonitor.recordComponentMetric('FastComponent', 10, { type: 'render' });
    performanceMonitor.recordOperationMetric('SuccessOp', 50, true);
    
    const metrics = performanceMonitor.getMetrics();
    
    expect(metrics.averageRenderTime).toBe(10);
    expect(metrics.totalMetrics).toBe(2);
    expect(metrics.performanceScore).toBeGreaterThan(90); // Should be high with fast renders and no errors
  });
});
