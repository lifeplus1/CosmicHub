/**
 * Optimized App Component with Lazy Loading and Performance Monitoring
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';
import { CosmicLoading } from './components/CosmicLoading';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load main routes for optimal performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ChartCalculation = React.lazy(() => import('./pages/ChartCalculation'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Calculator = React.lazy(() => import('./pages/Calculator'));
const Numerology = React.lazy(() => import('./pages/Numerology'));
const HumanDesign = React.lazy(() => import('./pages/HumanDesign'));
const Synastry = React.lazy(() => import('./pages/Synastry'));
const AIInterpretation = React.lazy(() => import('./pages/AIInterpretation'));

// Performance monitoring utilities
const reportPerformance = (metric: string, value: number) => {
  console.log(`Performance metric ${metric}: ${value}ms`);
};

// Performance observer for monitoring
const performanceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'largest-contentful-paint') {
      reportPerformance('LCP', entry.startTime);
    } else if (entry.entryType === 'first-input') {
      const fidEntry = entry as any; // Type assertion for first-input entry
      reportPerformance('FID', fidEntry.processingStart - fidEntry.startTime);
    } else if (entry.entryType === 'layout-shift') {
      const clsEntry = entry as any; // Type assertion for layout-shift entry
      reportPerformance('CLS', clsEntry.value);
    }
  }
});

// Performance monitoring component
const AppPerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Initialize performance monitoring
    performanceObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    return () => performanceObserver.disconnect();
  }, []);

  return null;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider appType="astro">
          <Router>
            <AppPerformanceMonitor />
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <CosmicLoading />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/chart" element={<ChartCalculation />} />
                  <Route path="/synastry" element={<Synastry />} />
                  <Route path="/human-design" element={<HumanDesign />} />
                  <Route path="/numerology" element={<Numerology />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/ai-interpretation" element={<AIInterpretation />} />
                </Routes>
              </Suspense>
            </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
