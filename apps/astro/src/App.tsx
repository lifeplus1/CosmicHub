import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Dashboard from './pages/Dashboard';
import ChartCalculation from './pages/ChartCalculation';
import Profile from './pages/Profile';
import type { ChartData } from './types';

interface ExtendedChartData extends ChartData {
  latitude: number;
  longitude: number;
  timezone: string;
  julian_day: number;
  angles: Record<string, number>;
}

function MainApp(): JSX.Element {
  const { addNotification } = useCrossAppStore();
  const config = getAppConfig('astro');

  React.useEffect(() => {
    // Initialize cross-app integration if enabled
    if (isFeatureEnabled('crossAppIntegration', 'astro')) {
      addNotification({
        id: 'astro-init',
        message: 'Astrology app initialized with Healwave integration',
        type: 'info',
        timestamp: Date.now()
      });
    }
  }, [addNotification]);

  return (
    <Router>
      <div className="min-h-screen bg-cosmic-dark text-cosmic-silver">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chart" element={<ChartCalculation />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Debug info in development */}
        {config.environment === 'development' && (
          <div className="fixed bottom-4 right-4 bg-cosmic-purple p-2 rounded text-xs">
            App: {config.app} | Env: {config.environment} | Version: {config.version}
          </div>
        )}
      </div>
    </Router>
  );
}

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
