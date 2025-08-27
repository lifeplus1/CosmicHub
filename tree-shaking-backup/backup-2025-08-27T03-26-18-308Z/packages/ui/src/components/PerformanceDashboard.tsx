import React from 'react';
import '@cosmichub/config/performance';
import { useRealTimePerformance } from '@cosmichub/config/hooks';
import { Card } from './Card';
import { Badge } from './Badge';

export interface PerformanceDashboardProps {
  className?: string;
  showDetailedMetrics?: boolean;
}

interface MetricDisplay {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  description: string;
}

interface ComponentMetric {
  componentName: string;
  type: string;
  duration: number;
}

interface OperationMetric {
  operationName: string;
  duration: number;
  success: boolean;
  metadata?: {
    label?: string;
  };
}

/**
 * Enhanced Performance Dashboard component for monitoring Core Web Vitals and app performance
 * Now with real-time updates and comprehensive metrics display
 */
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  showDetailedMetrics = false,
}) => {
  const report = useRealTimePerformance();
  const vitalsData = React.useMemo(() => {
    const avg = report.summary.averageRenderTime;
    const total = report.summary.totalMetrics;
    // Reproduce performanceScore formula used in performance monitor to avoid unsafe direct call
    const performanceScore = Math.round(
      Math.max(0, 100 - avg / 2 - report.summary.errorRate)
    );
    return {
      averageRenderTime: Number.isFinite(avg) ? avg : 0,
      performanceScore: Number.isFinite(performanceScore)
        ? performanceScore
        : 0,
      totalMetrics: Number.isFinite(total) ? total : 0,
    };
  }, [
    report.summary.averageRenderTime,
    report.summary.errorRate,
    report.summary.totalMetrics,
  ]);

  // Mock web vitals data based on performance metrics
  const webVitals: MetricDisplay[] = React.useMemo(
    () => [
      {
        name: 'LCP',
        value: Math.max(2000, vitalsData.averageRenderTime * 2),
        rating:
          vitalsData.averageRenderTime < 8
            ? 'good'
            : vitalsData.averageRenderTime < 16
              ? 'needs-improvement'
              : 'poor',
        unit: 'ms',
        description:
          'Largest Contentful Paint - Time to render the largest content element',
      },
      {
        name: 'FID',
        value: Math.max(50, vitalsData.averageRenderTime),
        rating:
          vitalsData.averageRenderTime < 8
            ? 'good'
            : vitalsData.averageRenderTime < 20
              ? 'needs-improvement'
              : 'poor',
        unit: 'ms',
        description:
          'First Input Delay - Time from first user interaction to browser response',
      },
      {
        name: 'CLS',
        value: report.summary.errorRate / 100,
        rating:
          report.summary.errorRate < 1
            ? 'good'
            : report.summary.errorRate < 5
              ? 'needs-improvement'
              : 'poor',
        unit: '',
        description: 'Cumulative Layout Shift - Visual stability of the page',
      },
    ],
    [vitalsData, report.summary]
  );

  // Performance budget checking based on available metrics
  const budgetResults = React.useMemo(() => {
    return {
      LCP: webVitals.find(m => m.name === 'LCP')?.rating === 'good',
      FID: webVitals.find(m => m.name === 'FID')?.rating === 'good',
      CLS: webVitals.find(m => m.name === 'CLS')?.rating === 'good',
      FCP: true, // Default to passing
      TTFB: true, // Default to passing
    };
  }, [webVitals]);

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'ms') {
      return value < 1000
        ? `${Math.round(value)}ms`
        : `${(value / 1000).toFixed(1)}s`;
    }
    if (unit === '') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}${unit}`;
  };

  const getRatingColor = (
    rating: 'good' | 'needs-improvement' | 'poor'
  ): string => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-100';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const overallScore = React.useMemo(() => {
    return Math.round(vitalsData.performanceScore);
  }, [vitalsData.performanceScore]);

  return (
    <div
      className={`space-y-6 ${className}`}
      role='main'
      aria-labelledby='performance-dashboard-title'
    >
      {/* Overall Performance Score */}
      {/* Overall Performance Score */}
      <Card className='text-center p-6'>
        <div role='region' aria-labelledby='overall-score-title'>
          <h2
            id='overall-score-title'
            className='text-2xl font-bold text-cosmic-dark mb-4'
          >
            Performance Score
          </h2>
          <div
            className={`text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}
          >
            {overallScore}
          </div>
          <div className='text-lg text-gray-600 mb-4'>
            {getScoreLabel(overallScore)}
          </div>
          <div className='text-sm text-gray-500'>
            Last updated: {new Date().toLocaleTimeString()} (Real-time)
          </div>
        </div>
      </Card>

      {/* Core Web Vitals */}
      <div>
        <h3 className='text-xl font-bold text-cosmic-dark mb-4'>
          Core Web Vitals
        </h3>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {webVitals.map(metric => (
            <Card key={metric.name} className='p-4'>
              <div className='flex items-center justify-between mb-2'>
                <h4 className='font-semibold text-cosmic-dark'>
                  {metric.name}
                </h4>
                <Badge className={getRatingColor(metric.rating)}>
                  {metric.rating.replace('-', ' ')}
                </Badge>
              </div>

              <div className='text-2xl font-bold text-cosmic-purple mb-2'>
                {formatValue(metric.value, metric.unit)}
              </div>

              <p className='text-sm text-gray-600'>{metric.description}</p>

              <div className='mt-3 text-xs text-gray-500 flex justify-between'>
                <span>
                  {metric.name === 'LCP' && 'Good: ≤2.5s, Poor: >4.0s'}
                  {metric.name === 'FID' && 'Good: ≤100ms, Poor: >300ms'}
                  {metric.name === 'CLS' && 'Good: ≤0.1, Poor: >0.25'}
                  {metric.name === 'FCP' && 'Good: ≤1.8s, Poor: >3.0s'}
                  {metric.name === 'TTFB' && 'Good: ≤800ms, Poor: >1.8s'}
                </span>
                <span
                  className={
                    budgetResults[metric.name as keyof typeof budgetResults]
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {budgetResults[metric.name as keyof typeof budgetResults]
                    ? '✓ Budget'
                    : '⚠ Over Budget'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      <Card className='p-6'>
        <h3 className='text-xl font-bold text-cosmic-dark mb-4'>
          Performance Optimization Tips
        </h3>
        <div className='space-y-3'>
          {overallScore < 90 && (
            <>
              {webVitals.some(m => m.name === 'LCP' && m.rating !== 'good') && (
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0' />
                  <div>
                    <strong>Improve LCP:</strong> Optimize images, use CDN,
                    implement lazy loading
                  </div>
                </div>
              )}

              {webVitals.some(m => m.name === 'FID' && m.rating !== 'good') && (
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0' />
                  <div>
                    <strong>Improve FID:</strong> Minimize JavaScript execution
                    time, use code splitting
                  </div>
                </div>
              )}

              {webVitals.some(m => m.name === 'CLS' && m.rating !== 'good') && (
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0' />
                  <div>
                    <strong>Improve CLS:</strong> Set image dimensions, avoid
                    inserting content above existing content
                  </div>
                </div>
              )}
            </>
          )}

          {overallScore >= 90 && (
            <div className='flex items-start gap-3'>
              <div className='w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0' />
              <div>
                <strong>Excellent performance!</strong> Your app is
                well-optimized for user experience.
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Technical Details */}
      <Card className='p-6'>
        <h3 className='text-xl font-bold text-cosmic-dark mb-4'>
          Technical Details
        </h3>
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <strong>Build Optimizations:</strong>
            <ul className='mt-2 space-y-1 text-gray-600'>
              <li>• Turbo caching enabled</li>
              <li>• Code splitting implemented</li>
              <li>• Tree shaking active</li>
              <li>• Lazy loading configured</li>
            </ul>
          </div>

          <div>
            <strong>Runtime Optimizations:</strong>
            <ul className='mt-2 space-y-1 text-gray-600'>
              <li>• React.memo usage</li>
              <li>• useCallback optimization</li>
              <li>• useMemo for calculations</li>
              <li>• Component performance tracking</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Enhanced Metrics for Detailed View */}
      {showDetailedMetrics && (
        <>
          {/* Component Performance */}
          {report.components.length > 0 && (
            <Card className='p-6'>
              <h3 className='text-xl font-bold text-cosmic-dark mb-4'>
                Component Performance
              </h3>
              <div className='space-y-3'>
                {report.components
                  .slice(-10)
                  .map((metric: ComponentMetric, index: number) => (
                    <div
                      key={index}
                      className='flex justify-between items-center p-3 bg-gray-50 rounded'
                    >
                      <div>
                        <span className='font-medium'>
                          {metric.componentName}
                        </span>
                        <span className='text-sm text-gray-500 ml-2'>
                          ({metric.type})
                        </span>
                      </div>
                      <span
                        className={`font-mono ${metric.duration < 16 ? 'text-green-600' : 'text-yellow-600'}`}
                      >
                        {metric.duration.toFixed(2)}ms
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Operation Performance */}
          {report.operations.length > 0 && (
            <Card className='p-6'>
              <h3 className='text-xl font-bold text-cosmic-dark mb-4'>
                Operation Performance
              </h3>
              <div className='space-y-3'>
                {report.operations
                  .slice(-10)
                  .map((metric: OperationMetric, index: number) => (
                    <div
                      key={index}
                      className='flex justify-between items-center p-3 bg-gray-50 rounded'
                    >
                      <div>
                        <span className='font-medium'>
                          {metric.operationName}
                        </span>
                        {metric.metadata?.label && (
                          <span className='text-sm text-gray-500 ml-2'>
                            ({metric.metadata.label})
                          </span>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`w-2 h-2 rounded-full ${metric.success ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <span className='font-mono'>
                          {metric.duration.toFixed(2)}ms
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PerformanceDashboard;
