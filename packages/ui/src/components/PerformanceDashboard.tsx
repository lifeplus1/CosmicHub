import React from 'react';
import { 
  performanceMonitor, 
  useRealTimePerformance,
  type PerformanceReport
} from '@cosmichub/config/performance';
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

/**
 * Enhanced Performance Dashboard component for monitoring Core Web Vitals and app performance
 * Now with real-time updates and comprehensive metrics display
 */
export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ 
  className = '', 
  showDetailedMetrics = false 
}) => {
  const report = useRealTimePerformance();
  const webVitals = React.useMemo(() => {
    const vitalsReport = report.webVitals;
    
    const metrics: MetricDisplay[] = [
      {
        name: 'LCP',
        value: vitalsReport.LCP?.value || 0,
        rating: vitalsReport.LCP?.rating || 'poor',
        unit: 'ms',
        description: 'Largest Contentful Paint - How long it takes for the main content to load'
      },
      {
        name: 'FID',
        value: vitalsReport.FID?.value || 0,
        rating: vitalsReport.FID?.rating || 'poor',
        unit: 'ms',
        description: 'First Input Delay - How responsive your page is to user interactions'
      },
      {
        name: 'CLS',
        value: vitalsReport.CLS?.value || 0,
        rating: vitalsReport.CLS?.rating || 'poor',
        unit: '',
        description: 'Cumulative Layout Shift - How much your page layout shifts as it loads'
      },
      {
        name: 'FCP',
        value: vitalsReport.FCP?.value || 0,
        rating: vitalsReport.FCP?.rating || 'poor',
        unit: 'ms',
        description: 'First Contentful Paint - Time to first meaningful content'
      },
      {
        name: 'TTFB',
        value: vitalsReport.TTFB?.value || 0,
        rating: vitalsReport.TTFB?.rating || 'poor',
        unit: 'ms',
        description: 'Time to First Byte - Server response time'
      }
    ];

    return metrics.filter(m => m.value > 0);
  }, [report.webVitals]);

  // Performance budget checking
  const performanceBudgets = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800
  };

  const budgetResults = React.useMemo(() => 
    performanceMonitor.checkPerformanceBudget(performanceBudgets), 
    [report.webVitals]
  );

  const formatValue = (value: number, unit: string): string => {
    if (unit === 'ms') {
      return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`;
    }
    if (unit === '') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}${unit}`;
  };

  const getRatingColor = (rating: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Performance Score */}
      <Card className="text-center p-6">
        <h2 className="text-2xl font-bold text-cosmic-dark mb-4">Performance Score</h2>
        <div className={`text-6xl font-bold ${getScoreColor(report.overallScore)} mb-2`}>
          {report.overallScore}
        </div>
        <div className="text-lg text-gray-600 mb-4">
          {getScoreLabel(report.overallScore)}
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()} (Real-time)
        </div>
      </Card>

      {/* Core Web Vitals */}
      <div>
        <h3 className="text-xl font-bold text-cosmic-dark mb-4">Core Web Vitals</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {webVitals.map((metric) => (
            <Card key={metric.name} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-cosmic-dark">{metric.name}</h4>
                <Badge className={getRatingColor(metric.rating)}>
                  {metric.rating.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="text-2xl font-bold text-cosmic-purple mb-2">
                {formatValue(metric.value, metric.unit)}
              </div>
              
              <p className="text-sm text-gray-600">
                {metric.description}
              </p>
              
              <div className="mt-3 text-xs text-gray-500 flex justify-between">
                <span>
                  {metric.name === 'LCP' && 'Good: ≤2.5s, Poor: >4.0s'}
                  {metric.name === 'FID' && 'Good: ≤100ms, Poor: >300ms'}
                  {metric.name === 'CLS' && 'Good: ≤0.1, Poor: >0.25'}
                  {metric.name === 'FCP' && 'Good: ≤1.8s, Poor: >3.0s'}
                  {metric.name === 'TTFB' && 'Good: ≤800ms, Poor: >1.8s'}
                </span>
                <span className={budgetResults[metric.name] ? 'text-green-600' : 'text-red-600'}>
                  {budgetResults[metric.name] ? '✓ Budget' : '⚠ Over Budget'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance Tips */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-cosmic-dark mb-4">Performance Optimization Tips</h3>
        <div className="space-y-3">
          {report.overallScore < 90 && (
            <>
              {webVitals.some(m => m.name === 'LCP' && m.rating !== 'good') && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Improve LCP:</strong> Optimize images, use CDN, implement lazy loading
                  </div>
                </div>
              )}
              
              {webVitals.some(m => m.name === 'FID' && m.rating !== 'good') && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Improve FID:</strong> Minimize JavaScript execution time, use code splitting
                  </div>
                </div>
              )}
              
              {webVitals.some(m => m.name === 'CLS' && m.rating !== 'good') && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                  <div>
                    <strong>Improve CLS:</strong> Set image dimensions, avoid inserting content above existing content
                  </div>
                </div>
              )}
            </>
          )}
          
          {report.overallScore >= 90 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
              <div>
                <strong>Excellent performance!</strong> Your app is well-optimized for user experience.
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Technical Details */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-cosmic-dark mb-4">Technical Details</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Build Optimizations:</strong>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• Turbo caching enabled</li>
              <li>• Code splitting implemented</li>
              <li>• Tree shaking active</li>
              <li>• Lazy loading configured</li>
            </ul>
          </div>
          
          <div>
            <strong>Runtime Optimizations:</strong>
            <ul className="mt-2 space-y-1 text-gray-600">
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
          {report.componentMetrics.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-cosmic-dark mb-4">Component Performance</h3>
              <div className="space-y-3">
                {report.componentMetrics.slice(-10).map((metric: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{metric.componentName}</span>
                      <span className="text-sm text-gray-500 ml-2">({metric.type})</span>
                    </div>
                    <span className={`font-mono ${metric.renderTime < 16 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {metric.renderTime.toFixed(2)}ms
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Operation Performance */}
          {report.operationMetrics.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-cosmic-dark mb-4">Operation Performance</h3>
              <div className="space-y-3">
                {report.operationMetrics.slice(-10).map((metric: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{metric.operationName}</span>
                      {metric.label && (
                        <span className="text-sm text-gray-500 ml-2">({metric.label})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${metric.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-mono">{metric.value.toFixed(2)}ms</span>
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
