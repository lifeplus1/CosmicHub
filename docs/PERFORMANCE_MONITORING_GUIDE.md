# 📊 Comprehensive Performance Monitoring Guide

## 🎯 Overview

The CosmicHub Performance Monitoring System is a comprehensive, enterprise-grade solution that tracks Core Web Vitals, component performance, operation metrics, and provides real-time monitoring capabilities. This system consolidates all performance monitoring features into a single, unified package.

## Features

### 🎯 Core Web Vitals Tracking
- **LCP (Largest Contentful Paint)**: Main content load time
- **FID (First Input Delay)**: Interaction responsiveness  
- **CLS (Cumulative Layout Shift)**: Layout stability
- **FCP (First Contentful Paint)**: Initial content render time
- **TTFB (Time to First Byte)**: Server response time

### 📊 Component Performance Monitoring
- Automatic render time tracking
- Mount time measurement
- Custom timing utilities
- React performance optimization integration

### 🔄 Real-time Performance Dashboard
- Live performance metrics updates
- Performance budgets and alerts
- Visual performance score calculation
- Comprehensive analytics reporting

### 🎛️ React Hooks Integration
- `usePerformance()` - Component-level tracking
- `useOperationTracking()` - Async operation monitoring
- `usePagePerformance()` - Page-level metrics
- `useRealTimePerformance()` - Live dashboard data

## Quick Start

### Basic Usage

```typescript
import { performanceMonitor, usePerformance } from '@cosmichub/config/performance';

// Component with automatic performance tracking
const MyComponent: React.FC = () => {
  const { startTiming, recordInteraction } = usePerformance('MyComponent');
  
  const handleExpensiveOperation = () => {
    const stopTiming = startTiming('expensiveOperation');
    
    // Your expensive operation here
    
    stopTiming(); // Automatically records timing
  };

  return <div onClick={() => recordInteraction('click')}>...</div>;
};
```

### Performance Dashboard

```typescript
import { PerformanceDashboard } from '@cosmichub/ui';

// Basic dashboard
<PerformanceDashboard />

// Enhanced dashboard with detailed metrics
<PerformanceDashboard showDetailedMetrics={true} />
```

### Operation Tracking

```typescript
import { useOperationTracking } from '@cosmichub/config/performance';

const DataComponent: React.FC = () => {
  const { trackOperation } = useOperationTracking('DataOperations');
  
  const loadData = async () => {
    const result = await trackOperation(async () => {
      const response = await fetch('/api/data');
      return response.json();
    }, 'loadUserData');
    
    return result;
  };
};
```

## Advanced Features

### Performance Budgets

```typescript
// Set performance budgets
const budgets = {
  LCP: 2500,    // milliseconds
  FID: 100,     // milliseconds  
  CLS: 0.1,     // score
  FCP: 1800,    // milliseconds
  TTFB: 800     // milliseconds
};

// Check if metrics meet budgets
const budgetResults = performanceMonitor.checkPerformanceBudget(budgets);
```

### Real-time Monitoring

```typescript
import { useRealTimePerformance } from '@cosmichub/config/performance';

const RealtimeDashboard: React.FC = () => {
  const report = useRealTimePerformance();
  
  return (
    <div>
      <h2>Overall Score: {report.overallScore}</h2>
      <p>Component Metrics: {report.componentMetrics.length}</p>
      <p>Operation Metrics: {report.operationMetrics.length}</p>
    </div>
  );
};
```

### HOC Performance Tracking

```typescript
import { withPerformanceTracking } from '@cosmichub/config/performance';

const HeavyComponent = withPerformanceTracking(
  ({ data }) => {
    // Component implementation
    return <div>{data.map(item => <Item key={item.id} {...item} />)}</div>;
  },
  'HeavyComponent',
  { trackRender: true, trackMounts: true }
);
```

## API Reference

### PerformanceMonitor Class

#### Methods

- `recordWebVital(name, value, rating, delta?)` - Record Core Web Vital
- `recordComponentMetric(name, renderTime, additionalData?)` - Track component performance
- `recordOperationMetric(name, duration, success, additionalData?)` - Track operations
- `recordPageMetric(name, value, type, additionalData?)` - Track page metrics
- `getPerformanceReport()` - Get comprehensive performance data
- `checkPerformanceBudget(budgets)` - Validate performance against budgets
- `enableRealTimeUpdates(callback)` - Subscribe to real-time updates

### React Hooks

#### usePerformance(componentName, options?)

Returns:
- `startTiming(label)` - Start custom timing measurement
- `recordInteraction(action, duration?)` - Record user interactions
- `renderTime` - Component render time
- `mountTime` - Component mount time

Options:
- `trackRender: boolean` - Enable render time tracking
- `trackMounts: boolean` - Enable mount time tracking  
- `trackInteractions: boolean` - Enable interaction tracking

#### useOperationTracking(operationName)

Returns:
- `trackOperation(operation, label?)` - Track async operations

#### usePagePerformance(pageName)

Automatically tracks:
- Page load performance
- Page visibility changes
- Navigation timing

#### useRealTimePerformance()

Returns:
- Live `PerformanceReport` object with real-time updates

## Performance Optimization Patterns

### 1. React.memo for Component Optimization

```typescript
const OptimizedComponent = memo(withPerformanceTracking(
  ({ data }) => {
    // Component logic
  },
  'OptimizedComponent'
));
```

### 2. Lazy Loading with Suspense

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Usage with performance tracking
<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

### 3. Memoized Expensive Calculations

```typescript
const ExpensiveComponent: React.FC = ({ data }) => {
  const { startTiming } = usePerformance('ExpensiveComponent');
  
  const processedData = useMemo(() => {
    const stopTiming = startTiming('dataProcessing');
    const result = heavyDataProcessing(data);
    stopTiming();
    return result;
  }, [data, startTiming]);
  
  return <div>{processedData}</div>;
};
```

### 4. Operation Performance Tracking

```typescript
const DataService = {
  async loadUserData(userId: string) {
    return performanceMonitor.trackOperation(async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    }, 'loadUserData');
  }
};
```

## Performance Budgets & Thresholds

### Core Web Vitals Thresholds

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| FCP | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| TTFB | ≤ 800ms | 800ms - 1.8s | > 1.8s |

### Component Performance Targets

- **Render Time**: < 16ms (60 FPS)
- **Mount Time**: < 100ms
- **Interaction Response**: < 100ms

## Integration Examples

### Express Backend Integration

```typescript
// Backend endpoint for receiving metrics
app.post('/api/metrics', (req, res) => {
  const metrics = req.body;
  
  // Store metrics in database
  await metricsDB.insert(metrics);
  
  // Send to analytics service
  await analyticsService.track(metrics);
  
  res.status(200).json({ status: 'received' });
});
```

### Analytics Integration

```typescript
// Custom analytics integration
performanceMonitor.enableRealTimeUpdates((report) => {
  // Send to Google Analytics
  gtag('event', 'performance_measurement', {
    metric_name: 'overall_score',
    value: report.overallScore
  });
  
  // Send to custom analytics
  analytics.track('performance_report', report);
});
```

## Troubleshooting

### Common Issues

1. **High CLS Scores**: Ensure images have dimensions set, avoid injecting content above existing content
2. **Poor LCP**: Optimize images, implement lazy loading, use CDN
3. **High FID**: Minimize JavaScript execution time, implement code splitting
4. **Slow TTFB**: Optimize server response time, implement caching

### Debugging Performance

```typescript
// Enable development logging
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.enableRealTimeUpdates((report) => {
    console.log('Performance Report:', report);
  });
}
```

## Best Practices

1. **Use React.memo** for components that receive stable props
2. **Implement lazy loading** for heavy components
3. **Track critical user operations** with useOperationTracking
4. **Set performance budgets** and monitor them regularly
5. **Use Suspense boundaries** for code-split components
6. **Minimize re-renders** with useCallback and useMemo
7. **Monitor real-time metrics** in production

## Migration from Previous Systems

If you were using separate performance monitoring components, you can migrate to the consolidated system:

```typescript
// Before (separate files)
import { usePerformance } from '@cosmichub/config/hooks/usePerformance';
import { performanceMonitor } from '@cosmichub/config/performance';

// After (consolidated)
import { 
  usePerformance, 
  performanceMonitor 
} from '@cosmichub/config/performance';
```

The API remains the same, ensuring backward compatibility while providing enhanced features and better TypeScript support.

## TypeScript Support

The system provides comprehensive TypeScript definitions:

```typescript
import type {
  PerformanceMetric,
  WebVitalsMetric,
  ComponentMetric,
  OperationMetric,
  PageMetric,
  PerformanceReport,
  UsePerformanceOptions,
  PerformanceHookReturn
} from '@cosmichub/config/performance';
```

This consolidated system provides enterprise-grade performance monitoring with real-time capabilities, React integration, and comprehensive analytics - all in a single, well-typed package.
