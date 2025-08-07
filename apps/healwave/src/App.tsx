import React, { lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import { Button, Spinner } from '@cosmichub/ui';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages to optimize bundle size
const FrequencyGenerator = lazy(() => import('./pages/FrequencyGenerator'));
const Presets = lazy(() => import('./pages/Presets'));
const Profile = lazy(() => import('./pages/Profile'));

interface AppConfig {
  app: string;
  environment: string;
  version: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  timestamp: number;
}

const MainApp: React.FC = () => {
  const { addNotification } = useCrossAppStore();
  const config = getAppConfig('healwave') as AppConfig;

  // Memoize handleOpenAstroApp to prevent unnecessary re-renders
  const handleOpenAstroApp = useCallback(() => {
    window.open('/astro', '_blank', 'noopener,noreferrer');
  }, []);

  useEffect(() => {
    if (isFeatureEnabled('crossAppIntegration')) {
      addNotification({
        id: `healwave-init-${Date.now()}`,
        message: 'Healwave app initialized with cross-app integration',
        type: 'info',
        timestamp: Date.now(),
      });
    }
  }, [addNotification]);

  return (
    <Router>
      <div className="min-h-screen text-white bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <header>
          <Navbar />
        </header>
        <main className="container px-4 py-8 mx-auto" role="main" aria-label="Main content">
          <section className="mb-8 text-center" aria-labelledby="app-title">
            <h1 id="app-title" className="mb-4 text-4xl font-bold">Healwave Frequency Generator</h1>
            <p className="text-xl text-blue-200">
              Therapeutic sound frequencies for healing and wellness
            </p>
            <div className="mt-4">
              <Button
                onClick={handleOpenAstroApp}
                className="bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90"
                aria-label="Open Astrology App in a new tab"
              >
                Open Astrology App
              </Button>
            </div>
          </section>

          <Suspense fallback={<Spinner aria-label="Loading page content" />}>
            <Routes>
              <Route path="/" element={<FrequencyGenerator />} />
              <Route path="/presets" element={<Presets />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />

        {config.environment === 'development' && (
          <div
            className="fixed p-2 text-xs bg-purple-600 rounded bottom-4 right-4"
            aria-live="polite"
            role="status"
          >
            App: {config.app} | Env: {config.environment} | Version: {config.version}
          </div>
        )}
      </div>
    </Router>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  </AuthProvider>
);

export default App;