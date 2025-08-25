import React, { lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@cosmichub/auth';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages to optimize bundle size
const FrequencyGenerator = lazy(() => import('./pages/FrequencyGenerator'));
const Presets = lazy(() => import('./pages/Presets'));
const Profile = lazy(() => import('./pages/Profile'));

// Removed unused internal AppConfig and Notification interfaces (types supplied by config/store modules)

const MainApp: React.FC = () => {
  const { addNotification } = useCrossAppStore();
  const config = getAppConfig('healwave');

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
      <div className='min-h-screen text-white bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'>
        <header>
          <Navbar />
        </header>
        <main
          className='container px-4 py-8 mx-auto'
          role='main'
          aria-label='Main content'
        >
          <section className='mb-8 text-center' aria-labelledby='app-title'>
            <h1 id='app-title' className='mb-4 text-4xl font-bold'>
              Healwave Frequency Generator
            </h1>
            <p className='text-xl text-blue-200'>
              Therapeutic sound frequencies for healing and wellness
            </p>
            <div className='mt-4'>
              <button
                onClick={handleOpenAstroApp}
                className='px-4 py-2 bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90 rounded-lg transition-colors'
                aria-label='Open Astrology App in a new tab'
              >
                Open Astrology App
              </button>
            </div>
          </section>

          <Suspense
            fallback={
              <div className='flex items-center justify-center p-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500'></div>
              </div>
            }
          >
            <Routes>
              <Route path='/' element={<FrequencyGenerator />} />
              <Route path='/presets' element={<Presets />} />
              <Route path='/profile' element={<Profile />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />

        {config.app.environment === 'development' && (
          <div
            className='fixed p-2 text-xs bg-purple-600 rounded bottom-4 right-4'
            aria-live='polite'
            role='status'
          >
            App: {config.app.name} | Env: {config.app.environment} | Version:{' '}
            {config.app.version}
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
