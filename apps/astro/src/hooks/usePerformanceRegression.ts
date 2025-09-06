import { useState, useEffect, useCallback, useRef } from 'react';
import { usePerformance, useMemoryMonitoring, usePagePerformance } from './usePerformance';

interface PerformanceBaseline {
  operationName: string;
  averageDuration: number;
  sampleCount: number;
  lastUpdated: number;
  memoryImpact?: number;
  standardDeviation: number;
}

interface PerformanceRegression {
  operationName: string;
  currentDuration: number;
  baselineAverage: number;
  regressionPercentage: number;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  timestamp: number;
  suggestions: string[];
}

interface RegressionAlert {
  id: string;
  type: 'performance' | 'memory' | 'bundle';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  acknowledged: boolean;
  data: Record<string, unknown>;
}

// Performance baseline storage key
const BASELINE_STORAGE_KEY = 'cosmic-performance-baselines';
const REGRESSION_THRESHOLD = 0.3; // 30% regression threshold
const SAMPLE_SIZE_THRESHOLD = 5; // Minimum samples for baseline

/**
 * Enhanced performance monitoring with regression detection
 * Builds on existing performance infrastructure
 */
export function usePerformanceRegression() {
  const [baselines, setBaselines] = useState<Map<string, PerformanceBaseline>>(new Map());
  const [regressions, setRegressions] = useState<PerformanceRegression[]>([]);
  const [alerts, setAlerts] = useState<RegressionAlert[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use existing performance hooks
  const { metrics: perfMetrics } = usePerformance();
  const { memoryInfo } = useMemoryMonitoring();
  const { metrics: _pageMetrics } = usePagePerformance();

  // Load baselines from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BASELINE_STORAGE_KEY);
      if (stored) {
        const baselineData = JSON.parse(stored) as Record<string, PerformanceBaseline>;
        const baselineMap = new Map<string, PerformanceBaseline>();
        Object.entries(baselineData).forEach(([key, value]) => {
          baselineMap.set(key, value);
        });
        setBaselines(baselineMap);
      }
    } catch (error) {
      console.warn('Failed to load performance baselines:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save baselines to localStorage
  const saveBaselines = useCallback((newBaselines: Map<string, PerformanceBaseline>) => {
    try {
      const baselineObj = Object.fromEntries(newBaselines);
      localStorage.setItem(BASELINE_STORAGE_KEY, JSON.stringify(baselineObj));
    } catch (error) {
      console.warn('Failed to save performance baselines:', error);
    }
  }, []);

  // Calculate standard deviation
  const _calculateStandardDeviation = useCallback((values: number[], mean: number) => {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }, []);

  // Update baseline for an operation
  const updateBaseline = useCallback((
    operationName: string,
    duration: number,
    memoryDelta?: number
  ) => {
    if (!isInitialized) return;

    setBaselines(prev => {
      const newBaselines = new Map(prev);
      const existing = newBaselines.get(operationName);
      
      if (existing) {
        // Update running average using exponential moving average
        const alpha = 0.1; // Smoothing factor
        const newAverage = alpha * duration + (1 - alpha) * existing.averageDuration;
        const newSampleCount = existing.sampleCount + 1;
        
        // Calculate new standard deviation (simplified)
        const variance = alpha * Math.pow(duration - existing.averageDuration, 2) + 
                        (1 - alpha) * Math.pow(existing.standardDeviation, 2);
        const newStdDev = Math.sqrt(variance);

        newBaselines.set(operationName, {
          ...existing,
          averageDuration: newAverage,
          sampleCount: newSampleCount,
          lastUpdated: Date.now(),
          memoryImpact: memoryDelta ? 
            (alpha * memoryDelta + (1 - alpha) * (existing.memoryImpact ?? 0)) :
            existing.memoryImpact,
          standardDeviation: newStdDev,
        });
      } else {
        // Create new baseline
        newBaselines.set(operationName, {
          operationName,
          averageDuration: duration,
          sampleCount: 1,
          lastUpdated: Date.now(),
          memoryImpact: memoryDelta,
          standardDeviation: 0,
        });
      }
      
      saveBaselines(newBaselines);
      return newBaselines;
    });
  }, [isInitialized, saveBaselines]);

  // Detect performance regression
  const detectRegression = useCallback((
    operationName: string,
    currentDuration: number
  ): PerformanceRegression | null => {
    const baseline = baselines.get(operationName);
    
    if (!baseline || baseline.sampleCount < SAMPLE_SIZE_THRESHOLD) {
      return null; // Not enough data for meaningful comparison
    }

    const regressionRatio = currentDuration / baseline.averageDuration;
    const regressionPercentage = (regressionRatio - 1) * 100;
    
    // Only consider it regression if it exceeds threshold
    if (regressionPercentage < REGRESSION_THRESHOLD * 100) {
      return null;
    }

    // Determine severity
    let severity: PerformanceRegression['severity'];
    if (regressionPercentage > 200) severity = 'critical';
    else if (regressionPercentage > 100) severity = 'major';
    else if (regressionPercentage > 50) severity = 'moderate';
    else severity = 'minor';

    // Generate suggestions based on regression type
    const suggestions: string[] = [];
    if (regressionPercentage > 100) {
      suggestions.push('Consider adding React.memo to prevent unnecessary re-renders');
      suggestions.push('Check for memory leaks in useEffect hooks');
      suggestions.push('Verify that expensive computations are properly memoized');
    } else if (regressionPercentage > 50) {
      suggestions.push('Review recent code changes for performance impact');
      suggestions.push('Consider optimizing data structures or algorithms');
    } else {
      suggestions.push('Monitor for continued degradation');
      suggestions.push('Check for external factors (network, API response times)');
    }

    return {
      operationName,
      currentDuration,
      baselineAverage: baseline.averageDuration,
      regressionPercentage,
      severity,
      timestamp: Date.now(),
      suggestions,
    };
  }, [baselines]);

  // Create alert from regression
  const createAlert = useCallback((regression: PerformanceRegression) => {
    const alertId = `regression-${regression.operationName}-${regression.timestamp}`;
    
    let alertSeverity: RegressionAlert['severity'];
    switch (regression.severity) {
      case 'critical': alertSeverity = 'critical'; break;
      case 'major': alertSeverity = 'high'; break;
      case 'moderate': alertSeverity = 'medium'; break;
      default: alertSeverity = 'low';
    }

    const alert: RegressionAlert = {
      id: alertId,
      type: 'performance',
      message: `Performance regression detected in ${regression.operationName}: ${regression.regressionPercentage.toFixed(1)}% slower than baseline`,
      severity: alertSeverity,
      timestamp: regression.timestamp,
      acknowledged: false,
      data: regression as unknown as Record<string, unknown>,
    };

    setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep last 50 alerts
    return alert;
  }, []);

  // Monitor current performance and detect regressions
  useEffect(() => {
    if (!perfMetrics || !isInitialized) return;

    const operationName = 'general-operation'; // Default operation name
    const duration = perfMetrics.duration;
    
    if (typeof duration === 'number' && duration > 0) {
      // Update baseline
      updateBaseline(operationName, duration);
      
      // Check for regression
      const regression = detectRegression(operationName, duration);
      if (regression) {
        setRegressions(prev => [regression, ...prev.slice(0, 20)]); // Keep last 20 regressions
        createAlert(regression);
      }
    }
  }, [perfMetrics, isInitialized, updateBaseline, detectRegression, createAlert]);

  // Monitor memory usage for regressions
  useEffect(() => {
    if (!memoryInfo || !isInitialized) return;

    const memoryUsagePercent = (memoryInfo.used / memoryInfo.total) * 100;
    
    // Check memory regression (simplified)
    if (memoryUsagePercent > 80) {
      const alert: RegressionAlert = {
        id: `memory-${Date.now()}`,
        type: 'memory',
        message: `High memory usage detected: ${memoryUsagePercent.toFixed(1)}%`,
        severity: memoryUsagePercent > 90 ? 'critical' : 'high',
        timestamp: Date.now(),
        acknowledged: false,
        data: { memoryUsagePercent, memoryInfo },
      };
      
      setAlerts(prev => {
        // Don't spam memory alerts
        const recentMemoryAlert = prev.find(a => 
          a.type === 'memory' && 
          Date.now() - a.timestamp < 30000 // 30 seconds
        );
        if (recentMemoryAlert) return prev;
        
        return [alert, ...prev].slice(0, 50);
      });
    }
  }, [memoryInfo, isInitialized]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  }, []);

  // Clear old alerts
  const clearOldAlerts = useCallback(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    setAlerts(prev => prev.filter(alert => 
      alert.timestamp > oneHourAgo || !alert.acknowledged
    ));
  }, []);

  // Get performance health score
  const getPerformanceHealth = useCallback(() => {
    const recentRegressions = regressions.filter(r => 
      Date.now() - r.timestamp < 60 * 60 * 1000 // Last hour
    );

    const criticalRegressions = recentRegressions.filter(r => r.severity === 'critical').length;
    const majorRegressions = recentRegressions.filter(r => r.severity === 'major').length;
    const moderateRegressions = recentRegressions.filter(r => r.severity === 'moderate').length;

    // Calculate health score (0-100)
    let score = 100;
    score -= criticalRegressions * 25;
    score -= majorRegressions * 15;
    score -= moderateRegressions * 10;

    return {
      score: Math.max(0, score),
      status: score >= 90 ? 'excellent' : 
              score >= 70 ? 'good' : 
              score >= 50 ? 'fair' : 'poor',
      recentRegressions: recentRegressions.length,
      criticalIssues: criticalRegressions,
    };
  }, [regressions]);

  // Export baseline data for analysis
  const exportBaselines = useCallback(() => {
    const data = {
      baselines: Object.fromEntries(baselines),
      regressions: regressions.slice(0, 10), // Last 10 regressions
      exportTime: Date.now(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [baselines, regressions]);

  return {
    // State
    baselines: Array.from(baselines.values()),
    regressions,
    alerts: alerts.filter(a => !a.acknowledged), // Only show unacknowledged
    allAlerts: alerts,
    isInitialized,

    // Actions
    updateBaseline,
    detectRegression,
    acknowledgeAlert,
    clearOldAlerts,
    exportBaselines,

    // Analytics
    getPerformanceHealth,
    
    // Utilities
    regressionThreshold: REGRESSION_THRESHOLD,
    sampleThreshold: SAMPLE_SIZE_THRESHOLD,
  };
}

/**
 * Hook for tracking specific operation performance with regression detection
 */
export function useOperationRegression(operationName: string) {
  const { updateBaseline, detectRegression, baselines } = usePerformanceRegression();
  const [isTracking, setIsTracking] = useState(false);
  const startTimeRef = useRef<number>();

  const startOperation = useCallback(() => {
    startTimeRef.current = performance.now();
    setIsTracking(true);
  }, []);

  const endOperation = useCallback(() => {
    if (!startTimeRef.current) return null;

    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    setIsTracking(false);

    // Update baseline and check for regression
    updateBaseline(operationName, duration);
    const regression = detectRegression(operationName, duration);

    return {
      duration,
      regression,
      baseline: baselines.find(b => b.operationName === operationName),
    };
  }, [operationName, updateBaseline, detectRegression, baselines]);

  const trackOperation = useCallback(async <T>(
    operation: () => Promise<T> | T
  ): Promise<{ result: T; metrics: { duration: number; regression?: PerformanceRegression } }> => {
    startOperation();
    
    try {
      const result = await Promise.resolve(operation());
      const metrics = endOperation();
      
      return {
        result,
        metrics: {
          duration: metrics?.duration ?? 0,
          regression: metrics?.regression ?? undefined,
        },
      };
    } catch (error) {
      endOperation();
      throw error;
    }
  }, [startOperation, endOperation]);

  return {
    isTracking,
    startOperation,
    endOperation,
    trackOperation,
  };
}
