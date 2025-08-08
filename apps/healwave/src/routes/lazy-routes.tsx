/**
 * Lazy Route Definitions for Healwave App
 * Implements route-based code splitting for frequency healing features
 */

import { lazyLoadRoute, LazyLoadErrorBoundary } from '@cosmichub/config/lazy-loading';

// Main page routes with lazy loading
export const HealwaveRoutes = {
  // Dashboard route
  Dashboard: lazyLoadRoute(
    () => import('../pages/DashboardPage'),
    'HealwaveDashboard'
  ),

  // Frequency healing features
  FrequencyGenerator: lazyLoadRoute(
    () => import('../pages/FrequencyGeneratorPage'),
    'FrequencyGenerator'
  ),

  FrequencyLibrary: lazyLoadRoute(
    () => import('../pages/FrequencyLibraryPage'),
    'FrequencyLibrary'
  ),

  BiofeedbackAnalysis: lazyLoadRoute(
    () => import('../pages/BiofeedbackAnalysisPage'),
    'BiofeedbackAnalysis'
  ),

  // Session management
  HealingSessions: lazyLoadRoute(
    () => import('../pages/HealingSessionsPage'),
    'HealingSessions'
  ),

  SessionHistory: lazyLoadRoute(
    () => import('../pages/SessionHistoryPage'),
    'SessionHistory'
  ),

  SessionPlayer: lazyLoadRoute(
    () => import('../pages/SessionPlayerPage'),
    'SessionPlayer'
  ),

  // Advanced features
  CustomFrequencies: lazyLoadRoute(
    () => import('../pages/CustomFrequenciesPage'),
    'CustomFrequencies'
  ),

  FrequencyAnalyzer: lazyLoadRoute(
    () => import('../pages/FrequencyAnalyzerPage'),
    'FrequencyAnalyzer'
  ),

  BiofeedbackCalibration: lazyLoadRoute(
    () => import('../pages/BiofeedbackCalibrationPage'),
    'BiofeedbackCalibration'
  ),

  // Integration features
  AstroFrequencySync: lazyLoadRoute(
    () => import('../pages/AstroFrequencySyncPage'),
    'AstroFrequencySync'
  ),

  PlanetaryFrequencies: lazyLoadRoute(
    () => import('../pages/PlanetaryFrequenciesPage'),
    'PlanetaryFrequencies'
  ),

  // User management
  Profile: lazyLoadRoute(
    () => import('../pages/ProfilePage'),
    'Profile'
  ),

  Settings: lazyLoadRoute(
    () => import('../pages/SettingsPage'),
    'Settings'
  ),

  // Authentication
  Login: lazyLoadRoute(
    () => import('../pages/LoginPage'),
    'Login'
  ),

  Register: lazyLoadRoute(
    () => import('../pages/RegisterPage'),
    'Register'
  ),

  // Help and documentation
  Help: lazyLoadRoute(
    () => import('../pages/HelpPage'),
    'Help'
  ),

  FrequencyGuide: lazyLoadRoute(
    () => import('../pages/FrequencyGuidePage'),
    'FrequencyGuide'
  ),

  About: lazyLoadRoute(
    () => import('../pages/AboutPage'),
    'About'
  )
};

// Lazy loaded components with error boundaries
export const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <LazyLoadErrorBoundary>
      <Component {...props} />
    </LazyLoadErrorBoundary>
  );
};

// Route configuration with lazy loading
export const healwaveRouteConfig = [
  {
    path: '/',
    component: withErrorBoundary(HealwaveRoutes.Dashboard),
    preload: true
  },
  {
    path: '/frequency-generator',
    component: withErrorBoundary(HealwaveRoutes.FrequencyGenerator),
    preload: false
  },
  {
    path: '/frequency-library',
    component: withErrorBoundary(HealwaveRoutes.FrequencyLibrary),
    preload: false
  },
  {
    path: '/biofeedback-analysis',
    component: withErrorBoundary(HealwaveRoutes.BiofeedbackAnalysis),
    preload: false
  },
  {
    path: '/healing-sessions',
    component: withErrorBoundary(HealwaveRoutes.HealingSessions),
    preload: false
  },
  {
    path: '/session-history',
    component: withErrorBoundary(HealwaveRoutes.SessionHistory),
    preload: false
  },
  {
    path: '/session-player/:id',
    component: withErrorBoundary(HealwaveRoutes.SessionPlayer),
    preload: false
  },
  {
    path: '/custom-frequencies',
    component: withErrorBoundary(HealwaveRoutes.CustomFrequencies),
    preload: false
  },
  {
    path: '/frequency-analyzer',
    component: withErrorBoundary(HealwaveRoutes.FrequencyAnalyzer),
    preload: false
  },
  {
    path: '/biofeedback-calibration',
    component: withErrorBoundary(HealwaveRoutes.BiofeedbackCalibration),
    preload: false
  },
  {
    path: '/astro-frequency-sync',
    component: withErrorBoundary(HealwaveRoutes.AstroFrequencySync),
    preload: false
  },
  {
    path: '/planetary-frequencies',
    component: withErrorBoundary(HealwaveRoutes.PlanetaryFrequencies),
    preload: false
  },
  {
    path: '/profile',
    component: withErrorBoundary(HealwaveRoutes.Profile),
    preload: true
  },
  {
    path: '/settings',
    component: withErrorBoundary(HealwaveRoutes.Settings),
    preload: false
  },
  {
    path: '/login',
    component: withErrorBoundary(HealwaveRoutes.Login),
    preload: true
  },
  {
    path: '/register',
    component: withErrorBoundary(HealwaveRoutes.Register),
    preload: false
  },
  {
    path: '/help',
    component: withErrorBoundary(HealwaveRoutes.Help),
    preload: false
  },
  {
    path: '/frequency-guide',
    component: withErrorBoundary(HealwaveRoutes.FrequencyGuide),
    preload: false
  },
  {
    path: '/about',
    component: withErrorBoundary(HealwaveRoutes.About),
    preload: false
  }
];
