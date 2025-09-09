import React, { lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AuthProvider } from '@cosmichub/auth';
import { UnrestrictedSubscriptionProvider } from './providers/UnrestrictedSubscriptionProvider';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import { ErrorBoundary } from '@cosmichub/ui';
import { devConsole } from './config/devConsole';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages to optimize bundle size
const FrequencyGenerator = lazy(() => import('./pages/FrequencyGenerator'));
const HealWaveSessions = lazy(() => import('./pages/HealWaveSessions'));
const Presets = lazy(() => import('./pages/Presets'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileTest = lazy(() => import('./components/ProfileTest'));
const Upgrade = lazy(() => import('./pages/Upgrade'));
const TailwindRadixTest = lazy(() => import('./components/TailwindRadixTest'));

const MainApp: React.FC = () => {
  const { addNotification } = useCrossAppStore();
  const config = getAppConfig('healwave');

  // Check if we're running AB test mode (for unrestricted access)
  const _isABTestMode = window.location.pathname === '/' || window.location.search.includes('abtest=true');

  // Initialize development auth tools
  useEffect(() => {
    if (config.app.environment === 'development') {
      // Development auth tools will be added via console for now
       
      devConsole.info('🛠️ Development mode: Use browser console for auth testing');
    }
  }, [config.app.environment]);

  // Universal theme color support for all browsers
  useEffect(() => {
    // Set theme color in browsers that support it
    const setThemeColor = (color: string) => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color);
      }
    };

    // Detect color scheme preference and update theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDark = e.matches;
      setThemeColor(isDark ? '#7c3aed' : '#8b5cf6');

      // Update CSS custom property for cross-browser support
      document.documentElement.style.setProperty(
        '--theme-primary',
        isDark ? '#7c3aed' : '#8b5cf6'
      );
    };

    // Set initial theme
    updateTheme(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', updateTheme);

    return () => {
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  // Memoize handleOpenAstroApp to prevent unnecessary re-renders
  const handleOpenAstroApp = useCallback(() => {
    window.open('/astro', '_blank', 'noopener,noreferrer');
  }, []);

  useEffect(() => {
    if (isFeatureEnabled('crossAppIntegration')) {
      addNotification({
        message: 'Healwave app initialized with cross-app integration',
        type: 'info',
        timestamp: Date.now(),
      });
    }
  }, [addNotification]);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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
            <h1 id='app-title' className='mb-4 text-4xl font-bold font-inter'>
              Healwave Frequency Generator
            </h1>
            <p className='text-xl text-blue-200'>
              Therapeutic sound frequencies for healing and wellness
            </p>
            <div className='mt-4 space-x-4'>
              <a
                href='/sessions'
                className='inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg transition-all duration-200 hover:from-emerald-700 hover:to-green-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg hover:shadow-xl'
                aria-label='Access Therapeutic Audio Sessions'
              >
                🎵 Healing Sessions
              </a>
              <button
                onClick={handleOpenAstroApp}
                className='px-6 py-3 bg-gradient-to-r from-cosmic-gold to-yellow-500 text-cosmic-dark font-semibold rounded-lg transition-all duration-200 hover:from-cosmic-gold/90 hover:to-yellow-500/90 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cosmic-gold focus:ring-offset-2 focus:ring-offset-transparent shadow-lg hover:shadow-xl'
                aria-label='Open Astrology App in a new tab'
              >
                Open Astrology App
              </button>
              <a
                href='/test'
                className='inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent shadow-lg hover:shadow-xl'
              >
                Test Tailwind & Radix UI
              </a>
            </div>
          </section>

          <Suspense
            fallback={
              <div className='flex items-center justify-center p-8'>
                <div className='animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent'></div>
              </div>
            }
          >
            <Routes>
              <Route path='/' element={<FrequencyGenerator />} />
              <Route path='/sessions' element={<HealWaveSessions />} />
              <Route path='/presets' element={<Presets />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/profile-test' element={<ProfileTest />} />
              <Route path='/upgrade' element={<Upgrade />} />
              <Route path='/test' element={<TailwindRadixTest />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />

        {config.app.environment === 'development' && (
          <div
            className='fixed p-3 text-xs bg-purple-900/80 backdrop-blur-sm rounded-lg bottom-4 right-4 border border-purple-500/20'
            aria-live='polite'
            role='status'
          >
            <div className='text-purple-200'>
              App: <span className='text-cyan-400'>{config.app.name}</span>
            </div>
            <div className='text-purple-200'>
              Env:{' '}
              <span className='text-cyan-400'>{config.app.environment}</span>
            </div>
            <div className='text-purple-200'>
              Version:{' '}
              <span className='text-cyan-400'>{config.app.version}</span>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
};

const App: React.FC = () => (
  <Tooltip.Provider>
    <AuthProvider>
      <UnrestrictedSubscriptionProvider appType="healwave">
        <ErrorBoundary 
          level="page" 
          name="HealWaveApp"
        >
          <MainApp />
        </ErrorBoundary>
      </UnrestrictedSubscriptionProvider>
    </AuthProvider>
  </Tooltip.Provider>
);

export default App;
