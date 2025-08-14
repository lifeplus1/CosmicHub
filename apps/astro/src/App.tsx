import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AuthProvider, SubscriptionProvider } from '@cosmichub/auth';
import { useCrossAppStore } from '@cosmichub/integrations';
import { getAppConfig, isFeatureEnabled } from '@cosmichub/config';
import { BirthDataProvider } from './contexts/BirthDataContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CosmicLoading } from './components/CosmicLoading';
import { UpgradeModalProvider } from './contexts/UpgradeModalContext';
import { UpgradeModalManager } from './components/UpgradeModalManager';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const Dashboard = lazy(() => import('./pages/Dashboard')); // Lazy load for performance
const ChartResults = lazy(() => import('./pages/ChartResults'));
const Chart = lazy(() => import('./pages/Chart')); // New dedicated chart page
const MultiSystemChart = lazy(() => import('./pages/MultiSystemChart')); // Multi-system chart page
const Profile = lazy(() => import('./pages/Profile'));
const UpgradeModalDemo = lazy(() => import('./components/UpgradeModalDemo'));
const PerformanceMonitoring = lazy(() => import('./pages/PerformanceMonitoring'));

// Placeholder components for missing pages
const Calculator = lazy(() => import('./pages/Calculator'));
const Numerology = lazy(() => import('./pages/Numerology'));
const HumanDesign = lazy(() => import('./pages/HumanDesign'));
const GeneKeys = lazy(() => import('./pages/GeneKeys'));
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

  console.log('🎨 MainApp component mounting...');
  console.log('🔧 App config:', config);

  React.useEffect(() => {
    console.log('⚡ MainApp useEffect running...');
    
    // Initialize cross-app integration if enabled
    if (isFeatureEnabled('crossAppIntegration')) {
      console.log('🔗 Cross-app integration enabled');
      addNotification({
        id: 'astro-init',
        message: 'Astrology app initialized with Healwave integration',
        type: 'info',
        timestamp: Date.now(),
      });
    } else {
      console.log('🔗 Cross-app integration disabled');
    }

    console.log('✅ MainApp initialized successfully');
  }, [addNotification]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-cosmic-dark text-cosmic-silver">
        <Navbar />
        <main className="container px-4 py-8 mx-auto">
          <Suspense fallback={<CosmicLoading size="lg" message="Loading cosmic insights..." />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chart" element={<Chart />} />
              <Route path="/multi-system" element={<MultiSystemChart />} />
              <Route path="/chart-results" element={<ChartResults />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/numerology" element={<Numerology />} />
              <Route path="/human-design" element={<HumanDesign />} />
              <Route path="/gene-keys" element={<GeneKeys />} />
              <Route path="/synastry" element={<Synastry />} />
              <Route path="/ai-interpretation" element={<AIInterpretation chartId="" />} />
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
        {config.app.environment === 'development' && (
          <div className="fixed p-2 text-xs rounded bottom-4 right-4 bg-cosmic-purple" aria-hidden="true">
            App: {config.app.name} | Env: {config.app.environment} | Version: {config.app.version}
          </div>
        )}
      </div>
    </Router>
  );
});

const App: React.FC = () => {
  console.log('🌟 App component mounting...');
  console.log('📦 Providers initializing: Tooltip, Auth, Subscription, BirthData, UpgradeModal, QueryClient');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider>
        <AuthProvider appName="astro">
          <SubscriptionProvider appType="astro">
            <BirthDataProvider>
              <UpgradeModalProvider>
                <ErrorBoundary>
                  <MainApp />
                  <UpgradeModalManager />
                </ErrorBoundary>
              </UpgradeModalProvider>
            </BirthDataProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </Tooltip.Provider>
    </QueryClientProvider>
  );
};

export default App;

// Suggested Vitest test: 
// test('renders with auth', () => { ... });