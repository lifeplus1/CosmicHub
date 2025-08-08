/**
 * Optimized App Component with Lazy Loading and Performance Monitoring
 */

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../shared/AuthContext';
import { SubscriptionProvider } from '../shared/SubscriptionContext';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { reportPerformance } from '@cosmichub/config/performance';

// Lazy load main routes for optimal performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ChartPage = React.lazy(() => import('./pages/ChartPage'));
const SynastryPage = React.lazy(() => import('./pages/SynastryPage'));
const GeneKeysPage = React.lazy(() => import('./pages/GeneKeysPage'));
const NumerologyPage = React.lazy(() => import('./pages/NumerologyPage'));
const TransitPage = React.lazy(() => import('./pages/TransitPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));

// Performance monitoring component
const AppPerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          reportPerformance('LCP', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          reportPerformance('FID', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
          reportPerformance('CLS', entry.value);
        }
      });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

    return () => observer.disconnect();
  }, []);

  return null;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <AppPerformanceMonitor />
            <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <LoadingSpinner size="lg" />
                </div>
              }>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/chart" element={<ChartPage />} />
                  <Route path="/synastry" element={<SynastryPage />} />
                  <Route path="/gene-keys" element={<GeneKeysPage />} />
                  <Route path="/numerology" element={<NumerologyPage />} />
                  <Route path="/transits" element={<TransitPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
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
