import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { SubscriptionProvider } from './contexts/SubscriptionContext';

const Dashboard = lazy(() => import('./pages/Dashboard')); // Lazy load for performance
const ChartCalculation = lazy(() => import('./pages/ChartCalculation'));
const Profile = lazy(() => import('./pages/Profile'));

interface ExtendedChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
  // Extend from ChartData if defined elsewhere
}

const MainApp: React.FC = React.memo(() => {
  const { addNotification } = useCrossAppStore();
  const config = getAppConfig('astro');

  React.useEffect(() => {
    // Initialize cross-app integration if enabled
    if (isFeatureEnabled('crossAppIntegration', 'astro')) {
      addNotification({
        id: 'astro-init',
        message: 'Astrology app initialized with Healwave integration',
        type: 'info',
        timestamp: Date.now(),
      });
    }
  }, [addNotification]);

  return (
    <Router>
      <div className="min-h-screen bg-cosmic-dark text-cosmic-silver">
        <Navbar />
        <main className="container px-4 py-8 mx-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chart" element={<ChartCalculation />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        
        {/* Debug info in development */}
        {config.environment === 'development' && (
          <div className="fixed p-2 text-xs rounded bottom-4 right-4 bg-cosmic-purple" aria-hidden="true">
            App: {config.app} | Env: {config.environment} | Version: {config.version}
          </div>
        )}
      </div>
    </Router>
  );
});

const App: React.FC = () => (
  <AuthProvider appName="astro">
    <SubscriptionProvider>
      <ErrorBoundary>
        <MainApp />
      </ErrorBoundary>
    </SubscriptionProvider>
  </AuthProvider>
);

export default App;

// Suggested Vitest test: 
// test('renders with auth', () => { ... });