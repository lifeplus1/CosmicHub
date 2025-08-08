/**
 * Lazy Route Definitions for Astro App
 * Implements route-based code splitting for optimal loading performance
 */

import { lazyLoadRoute, LazyLoadErrorBoundary } from '@cosmichub/config/lazy-loading';

// Main page routes with lazy loading
export const AstroRoutes = {
  // Dashboard route
  Dashboard: lazyLoadRoute(
    () => import('../pages/DashboardPage'),
    'AstroDashboard'
  ),

  // Chart generation routes
  BirthChart: lazyLoadRoute(
    () => import('../pages/BirthChartPage'),
    'BirthChart'
  ),

  SynastryChart: lazyLoadRoute(
    () => import('../pages/SynastryChartPage'),
    'SynastryChart'
  ),

  TransitChart: lazyLoadRoute(
    () => import('../pages/TransitChartPage'),
    'TransitChart'
  ),

  // Advanced features
  GeneKeys: lazyLoadRoute(
    () => import('../pages/GeneKeysPage'),
    'GeneKeys'
  ),

  PearlSequence: lazyLoadRoute(
    () => import('../pages/PearlSequencePage'),
    'PearlSequence'
  ),

  // Analysis features
  AspectAnalysis: lazyLoadRoute(
    () => import('../pages/AspectAnalysisPage'),
    'AspectAnalysis'
  ),

  TransitAnalysis: lazyLoadRoute(
    () => import('../pages/TransitAnalysisPage'),
    'TransitAnalysis'
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
export const astroRouteConfig = [
  {
    path: '/',
    component: withErrorBoundary(AstroRoutes.Dashboard),
    preload: true
  },
  {
    path: '/birth-chart',
    component: withErrorBoundary(AstroRoutes.BirthChart),
    preload: false
  },
  {
    path: '/synastry',
    component: withErrorBoundary(AstroRoutes.SynastryChart),
    preload: false
  },
  {
    path: '/transits',
    component: withErrorBoundary(AstroRoutes.TransitChart),
    preload: false
  },
  {
    path: '/gene-keys',
    component: withErrorBoundary(AstroRoutes.GeneKeys),
    preload: false
  },
  {
    path: '/pearl-sequence',
    component: withErrorBoundary(AstroRoutes.PearlSequence),
    preload: false
  },
  {
    path: '/aspects',
    component: withErrorBoundary(AstroRoutes.AspectAnalysis),
    preload: false
  },
  {
    path: '/transit-analysis',
    component: withErrorBoundary(AstroRoutes.TransitAnalysis),
    preload: false
  },
  {
    path: '/profile',
    component: withErrorBoundary(AstroRoutes.Profile),
    preload: true
  },
  {
    path: '/settings',
    component: withErrorBoundary(AstroRoutes.Settings),
    preload: false
  },
  {
    path: '/login',
    component: withErrorBoundary(AstroRoutes.Login),
    preload: true
  },
  {
    path: '/register',
    component: withErrorBoundary(AstroRoutes.Register),
    preload: false
  },
  {
    path: '/help',
    component: withErrorBoundary(AstroRoutes.Help),
    preload: false
  },
  {
    path: '/about',
    component: withErrorBoundary(AstroRoutes.About),
    preload: false
  }
];
