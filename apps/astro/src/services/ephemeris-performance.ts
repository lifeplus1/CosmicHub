/**
 * Performance monitoring for ephemeris operations.
 * 
 * This module provides utilities to monitor cache hit rates, latency,
 * and other performance metrics for the ephemeris service.
 */

import * as React from 'react';

interface PerformanceMetrics {
  cacheHitRate: number;
  averageLatency: number;
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  lastUpdated: Date;
}

interface PerformanceEntry {
  timestamp: Date;
  operation: string;
  latency: number;
  cacheHit: boolean;
  success: boolean;
  error?: string;
}

class EphemerisPerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private maxEntries = 1000; // Keep last 1000 entries

  /**
   * Record a performance entry for an ephemeris operation.
   */
  recordOperation(
    operation: string,
    latency: number,
    cacheHit: boolean,
    success: boolean,
    error?: string
  ): void {
    const entry: PerformanceEntry = {
      timestamp: new Date(),
      operation,
      latency,
      cacheHit,
      success,
      error,
    };

    this.entries.push(entry);

    // Keep only the most recent entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Ephemeris] ${operation}: ${latency}ms (cache: ${cacheHit ? 'hit' : 'miss'})`);
    }
  }

  /**
   * Get current performance metrics.
   */
  getMetrics(): PerformanceMetrics {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Filter to last hour for more relevant metrics
    const recentEntries = this.entries.filter(
      entry => entry.timestamp >= oneHourAgo
    );

    const totalRequests = recentEntries.length;
    const cacheHits = recentEntries.filter(entry => entry.cacheHit).length;
    const cacheMisses = totalRequests - cacheHits;
    const errors = recentEntries.filter(entry => !entry.success).length;
    
    const totalLatency = recentEntries.reduce((sum, entry) => sum + entry.latency, 0);
    const averageLatency = totalRequests > 0 ? totalLatency / totalRequests : 0;
    
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    return {
      cacheHitRate,
      averageLatency,
      totalRequests,
      cacheHits,
      cacheMisses,
      errors,
      lastUpdated: now,
    };
  }

  /**
   * Get entries for a specific operation.
   */
  getOperationEntries(operation: string): PerformanceEntry[] {
    return this.entries.filter(entry => entry.operation === operation);
  }

  /**
   * Clear all performance data.
   */
  clear(): void {
    this.entries = [];
  }

  /**
   * Get performance summary as a formatted string.
   */
  getSummary(): string {
    const metrics = this.getMetrics();
    
    return [
      `Ephemeris Performance Summary:`,
      `  Total requests: ${metrics.totalRequests}`,
      `  Cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%`,
      `  Average latency: ${metrics.averageLatency.toFixed(0)}ms`,
      `  Errors: ${metrics.errors}`,
      `  Last updated: ${metrics.lastUpdated.toISOString()}`,
    ].join('\n');
  }

  /**
   * Log current performance summary to console.
   */
  logSummary(): void {
    console.log(this.getSummary());
  }
}

// Global performance monitor instance
export const ephemerisMonitor = new EphemerisPerformanceMonitor();

/**
 * Higher-order function to wrap ephemeris operations with performance monitoring.
 */
export function withPerformanceMonitoring<T extends any[], R>(
  operation: string,
  fn: (...args: T) => Promise<R>,
  checkCache?: (...args: T) => boolean
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    const cacheHit = checkCache ? checkCache(...args) : false;
    
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      ephemerisMonitor.recordOperation(operation, latency, cacheHit, true);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      ephemerisMonitor.recordOperation(operation, latency, cacheHit, false, errorMessage);
      
      throw error;
    }
  };
}

/**
 * React hook to get real-time performance metrics.
 */
export function useEphemerisPerformanceMetrics() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(() => 
    ephemerisMonitor.getMetrics()
  );

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(ephemerisMonitor.getMetrics());
    };

    // Update metrics every 30 seconds
    const interval = setInterval(updateMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshMetrics = React.useCallback(() => {
    setMetrics(ephemerisMonitor.getMetrics());
  }, []);

  return {
    metrics,
    refreshMetrics,
    logSummary: ephemerisMonitor.logSummary.bind(ephemerisMonitor),
  };
}

// Export performance monitor for external use
export { ephemerisMonitor as default };
