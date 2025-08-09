import React, { useState, useEffect } from 'react';
import { usePerformance, usePagePerformance, useOperationTracking } from '@cosmichub/config';

/**
 * Performance monitoring demo and dashboard page
 */

export default function PerformanceMonitoring() {
  const [performanceData, setPerformanceData] = useState<any>({});

  // Track this page's performance
  usePagePerformance();
  
  // Track this component's performance
  const { startOperation, endOperation, metrics } = usePerformance();

  // Track expensive operations
  const { trackOperation } = useOperationTracking();

  // Simulate some expensive operations for demo
  const simulateExpensiveOperation = async () => {
    startOperation();
    
    try {
      // Simulate API call or heavy computation
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Simulate some DOM manipulation
      const iterations = 10000;
      for (let i = 0; i < iterations; i++) {
        Math.random() * Math.random();
      }
    } finally {
      endOperation();
    }
  };

  const quickOperation = async () => {
    startOperation();
    try {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    } finally {
      endOperation();
    }
  };

  useEffect(() => {
    setPerformanceData({
      renderTime: 'Not measured',
      mountTime: 'Not measured'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-purple via-cosmic-blue to-cosmic-purple p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-cosmic-gold mb-8 text-center">
          ⚡ Performance Monitor
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Triggers */}
          <div className="cosmic-card p-6">
            <h2 className="text-xl font-bold text-cosmic-gold mb-4">Performance Tests</h2>
            <div className="space-y-4">
              <button
                onClick={simulateExpensiveOperation}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Heavy Operation
              </button>
              <button
                onClick={quickOperation}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Quick Operation
              </button>
              <button
                onClick={() => console.log('Button clicked')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Interaction Test
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="cosmic-card p-6">
            <h2 className="text-xl font-bold text-cosmic-gold mb-4">Performance Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Render Time:</span>
                <span className="text-green-600">
                  {performanceData.renderTime || 'Measuring...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cosmic-silver">Mount Time:</span>
                <span className="text-green-600">
                  {performanceData.mountTime || 'Measuring...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
