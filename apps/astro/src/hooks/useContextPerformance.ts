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

  if (!enabled) return null;

  // Track render start
  renderStartTime.current = performance.now();

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;

    // Get or create metrics
    let metrics = contextMetrics.get(contextName);
    if (!metrics) {
      metrics = {
        name: contextName,
        renderCount: 0,
        averageRenderTime: 0,
        lastRenderTime: 0,
        totalRenderTime: 0,
        startTime: Date.now(),
      };
    }

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

  return contextMetrics.get(contextName) || null;
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
  return contextMetrics.get(contextName) || null;
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
export function generatePerformanceReport(): string {
  const metrics = getAllContextMetrics();

  if (metrics.length === 0) {
    return 'No context performance data available.';
  }

  const sortedMetrics = metrics.sort(
    (a, b) => b.averageRenderTime - a.averageRenderTime
  );

  let report = '📊 Context Performance Report\n';
  report += '================================\n\n';

  sortedMetrics.forEach(metric => {
    const uptime = Date.now() - metric.startTime;
    report += `🔧 ${metric.name}:\n`;
    report += `  • Renders: ${metric.renderCount}\n`;
    report += `  • Avg Time: ${metric.averageRenderTime.toFixed(2)}ms\n`;
    report += `  • Last Time: ${metric.lastRenderTime.toFixed(2)}ms\n`;
    report += `  • Total Time: ${metric.totalRenderTime.toFixed(2)}ms\n`;
    report += `  • Uptime: ${(uptime / 1000).toFixed(1)}s\n`;
    report += `  • Renders/sec: ${(metric.renderCount / (uptime / 1000)).toFixed(2)}\n\n`;
  });

  // Add warnings for problematic contexts
  const problematicContexts = sortedMetrics.filter(
    m =>
      m.averageRenderTime > 5 ||
      m.renderCount / ((Date.now() - m.startTime) / 1000) > 5
  );

  if (problematicContexts.length > 0) {
    report += '⚠️  Performance Warnings:\n';
    report += '=========================\n\n';

    problematicContexts.forEach(metric => {
      if (metric.averageRenderTime > 5) {
        report += `• ${metric.name}: Slow renders (${metric.averageRenderTime.toFixed(2)}ms avg)\n`;
      }
      if (metric.renderCount / ((Date.now() - metric.startTime) / 1000) > 5) {
        report += `• ${metric.name}: High render frequency (${(metric.renderCount / ((Date.now() - metric.startTime) / 1000)).toFixed(2)}/sec)\n`;
      }
    });
  }

  return report;
}

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
export function logPerformanceReport(): void {
  console.log(generatePerformanceReport());
}

// Auto-generate report every 30 seconds in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const metrics = getAllContextMetrics();
    if (metrics.length > 0) {
      console.group('🔍 Context Performance Monitor');
      console.log(generatePerformanceReport());
      console.groupEnd();
    }
  }, 30000); // 30 seconds
}
