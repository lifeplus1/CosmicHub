/**
 * Context Performance Monitoring Hook
 * Tracks re-renders and provides performance metrics for context providers
 */

import { useEffect, useRef } from 'react';

interface ContextMetrics {
  name: string;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  totalRenderTime: number;
  startTime: number;
}

// Global metrics storage
const contextMetrics = new Map<string, ContextMetrics>();

/**
 * Hook to monitor context provider performance
 */
export function useContextPerformance(
  contextName: string,
  dependencies: readonly unknown[] = [],
  enabled: boolean = process.env.NODE_ENV === 'development'
): ContextMetrics | null {
  const renderStartTime = useRef<number>(0);
  const lastDependenciesRef = useRef<readonly unknown[]>(dependencies);

  // Track render start (only if enabled)
  if (enabled) {
    renderStartTime.current = performance.now();
  }

  useEffect(() => {
    if (!enabled) return;

    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    // Get or create metrics
    let metrics = contextMetrics.get(contextName);
    metrics ??= {
      name: contextName,
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      startTime: Date.now(),
    };

    // Update metrics
    metrics.renderCount++;
    metrics.lastRenderTime = renderDuration;
    metrics.totalRenderTime += renderDuration;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    contextMetrics.set(contextName, metrics);

    // Check for unnecessary re-renders (dependencies didn't change)
    if (
      metrics.renderCount > 1 &&
      arraysEqual(lastDependenciesRef.current, dependencies)
    ) {
      console.warn(
        `🚨 Unnecessary re-render in ${contextName} context (${renderDuration.toFixed(2)}ms). ` +
          'Dependencies did not change but context re-rendered.'
      );
    }

    lastDependenciesRef.current = dependencies;

    // Log periodic performance reports (every 10 renders)
    if (metrics.renderCount % 10 === 0) {
      console.log(`📊 ${contextName} Context Performance:`, {
        renders: metrics.renderCount,
        avgTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
        lastTime: `${renderDuration.toFixed(2)}ms`,
        totalTime: `${metrics.totalRenderTime.toFixed(2)}ms`,
      });
    }
  });

  return enabled ? (contextMetrics.get(contextName) ?? null) : null;
}

/**
 * Get all context metrics for debugging
 */
export function getAllContextMetrics(): ContextMetrics[] {
  return Array.from(contextMetrics.values());
}

/**
 * Get specific context metrics
 */
export function getContextMetrics(contextName: string): ContextMetrics | null {
  return contextMetrics.get(contextName) ?? null;
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearContextMetrics(): void {
  contextMetrics.clear();
}

/**
 * Generate performance report
 */

/**
 * Shallow array comparison utility
 */
function arraysEqual(a: readonly unknown[], b: readonly unknown[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Log performance report to console
 */

// Auto-generate report every 30 seconds in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = getAllContextMetrics();
    if (metrics.length > 0) {
      console.group('🔍 Context Performance Monitor');
      console.log('Context performance metrics:', metrics);
      console.groupEnd();
    }
  }, 30000); // 30 seconds
}
