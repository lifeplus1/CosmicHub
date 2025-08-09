import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CosmicLoading } from './components/CosmicLoading';
import { UpgradeModalProvider } from './contexts/UpgradeModalContext';
import { UpgradeModalManager } from './components/UpgradeModalManager';

const Dashboard = lazy(() => import('./pages/Dashboard')); // Lazy load for performance
const ChartCalculation = lazy(() => import('./pages/ChartCalculation'));
const Profile = lazy(() => import('./pages/Profile'));
const UpgradeModalDemo = lazy(() => import('./components/UpgradeModalDemo'));
const PerformanceMonitoring = lazy(() => import('./pages/PerformanceMonitoring'));

// Placeholder components for missing pages
const Calculator = lazy(() => import('./pages/Calculator'));
const Numerology = lazy(() => import('./pages/Numerology'));
const HumanDesign = lazy(() => import('./pages/HumanDesign'));
const Synastry = lazy(() => import('./pages/Synastry'));
const AIInterpretation = lazy(() => import('./pages/AIInterpretation'));
const SavedCharts = lazy(() => import('./pages/SavedCharts'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));

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
    if (isFeatureEnabled('crossAppIntegration')) {
      addNotification({
        id: 'astro-init',
        message: 'Astrology app initialized with Healwave integration',
        type: 'info',
        timestamp: Date.now(),
      });
    }
  }, [addNotification]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-cosmic-dark text-cosmic-silver">
        <Navbar />
        <main className="container px-4 py-8 mx-auto">
          <Suspense fallback={<CosmicLoading size="lg" message="Loading cosmic insights..." />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chart" element={<ChartCalculation />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/numerology" element={<Numerology />} />
              <Route path="/human-design" element={<HumanDesign />} />
              <Route path="/synastry" element={<Synastry />} />
              <Route path="/ai-interpretation" element={<AIInterpretation />} />
              <Route path="/saved-charts" element={<SavedCharts />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upgrade-demo" element={<UpgradeModalDemo />} />
              <Route path="/performance" element={<PerformanceMonitoring />} />
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
  <Tooltip.Provider>
    <AuthProvider appName="astro">
      <SubscriptionProvider appType="astro">
        <UpgradeModalProvider>
          <ErrorBoundary>
            <MainApp />
            <UpgradeModalManager />
          </ErrorBoundary>
        </UpgradeModalProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </Tooltip.Provider>
);

export default App;

// Suggested Vitest test: 
// test('renders with auth', () => { ... });