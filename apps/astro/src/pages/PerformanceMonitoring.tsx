import React, { useEffect } from 'react';
import { PerformanceDashboard } from '@cosmichub/ui';
import { usePerformance, usePagePerformance, useOperationTracking } from '@cosmichub/config';
import { Button } from '@cosmichub/ui';

/**
 * Performance monitoring demo and dashboard page
 */
export const PerformanceMonitoring: React.FC = () => {
  // Track this page's performance
  usePagePerformance('PerformanceMonitoring');
  
  // Track this component's performance
  const { startTiming, recordInteraction, renderTime, mountTime } = usePerformance('PerformanceMonitoring', {
    trackRender: true,
    trackMounts: true,
    trackInteractions: true
  });

  // Track expensive operations
  const { trackOperation } = useOperationTracking('PerformanceDemo');

  // Simulate some expensive operations for demo
  const simulateExpensiveOperation = async () => {
    const endTiming = startTiming('expensive-operation');
    
    await trackOperation(async () => {
      // Simulate API call or heavy computation
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate some DOM manipulation
      const iterations = 10000;
      for (let i = 0; i < iterations; i++) {
        Math.random() * Math.random();
      }
    }, 'heavy-computation');

    endTiming();
    recordInteraction('expensive-operation-completed');
  };

  const simulateQuickOperation = async () => {
    await trackOperation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    }, 'quick-operation');

    recordInteraction('quick-operation-completed');
  };

  // Log component performance in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🎯 PerformanceMonitoring Component Stats:', {
        renderTime: renderTime ? `${renderTime.toFixed(2)}ms` : 'Not measured',
        mountTime: mountTime ? `${mountTime.toFixed(2)}ms` : 'Not measured'
      });
    }
  }, [renderTime, mountTime]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cosmic-dark mb-4">
          Performance Monitoring Dashboard
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Real-time monitoring of Core Web Vitals, component performance, and user experience metrics.
          This dashboard helps ensure CosmicHub maintains excellent performance standards.
        </p>
      </div>

      {/* Performance Testing Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-cosmic-dark mb-4">Performance Testing</h2>
        <p className="text-gray-600 mb-6">
          Test different operation types to see how they affect performance metrics:
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={simulateExpensiveOperation}
            className="bg-red-600 hover:bg-red-700 text-white"
            variant="primary"
          >
            🐌 Simulate Expensive Operation (1-3s)
          </Button>
          
          <Button
            onClick={simulateQuickOperation}
            className="bg-green-600 hover:bg-green-700 text-white"
            variant="primary"
          >
            ⚡ Simulate Quick Operation (100-300ms)
          </Button>
          
          <Button
            onClick={() => recordInteraction('button-click-test')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            variant="primary"
          >
            📊 Record Interaction
          </Button>
        </div>

        {/* Component Performance Stats */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-cosmic-dark mb-2">This Component's Performance:</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Render Time:</span> {' '}
              <span className={renderTime && renderTime > 16 ? 'text-red-600' : 'text-green-600'}>
                {renderTime ? `${renderTime.toFixed(2)}ms` : 'Measuring...'}
              </span>
            </div>
            <div>
              <span className="font-medium">Mount Time:</span> {' '}
              <span className={mountTime && mountTime > 100 ? 'text-red-600' : 'text-green-600'}>
                {mountTime ? `${mountTime.toFixed(2)}ms` : 'Measuring...'}
              </span>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            💡 Render time should be under 16ms for 60fps. Mount time should be under 100ms for good UX.
          </div>
        </div>
      </div>

      {/* Performance Dashboard */}
      <PerformanceDashboard />

      {/* Implementation Notes */}
      <div className="bg-cosmic-purple bg-opacity-10 rounded-xl p-6 border border-cosmic-purple border-opacity-30">
        <h3 className="text-xl font-bold text-cosmic-purple mb-4">🔧 Implementation Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-cosmic-dark mb-2">Automatic Tracking:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Core Web Vitals (LCP, FID, CLS, FCP, TTFB)</li>
              <li>• Component render and mount times</li>
              <li>• Page load and navigation performance</li>
              <li>• User interactions and operations</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-cosmic-dark mb-2">Development Tools:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Real-time performance dashboard</li>
              <li>• Console logging in development</li>
              <li>• Performance scoring and recommendations</li>
              <li>• Integration with monitoring services</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-cosmic-purple border-opacity-20">
          <h4 className="font-semibold text-cosmic-purple mb-2">Usage in Components:</h4>
          <pre className="text-sm text-gray-600 overflow-x-auto">
{`// Track component performance
const { renderTime, recordInteraction } = usePerformance('MyComponent');

// Track expensive operations  
const { trackOperation } = useOperationTracking('DataProcessing');

// Track page performance
usePagePerformance('HomePage');`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoring;
