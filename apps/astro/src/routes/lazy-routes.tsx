/**
 * Lazy Route Definitions for Astro App
 * Implements route-based code splitting for optimal loading performance
 */

import { lazyLoadRoute, LazyLoadErrorBoundary } from '@cosmichub/config';

// Main page routes with lazy loading
export const AstroRoutes = {
  // Dashboard route
  Dashboard: lazyLoadRoute(
    () => import('../pages/Dashboard'),
    'AstroDashboard'
  ),

  // Chart generation routes
  BirthChart: lazyLoadRoute(
    () => import('../pages/ChartCalculation'),
    'BirthChart'
  ),

  SynastryChart: lazyLoadRoute(
    () => import('../pages/Synastry'),
    'SynastryChart'
  ),

  TransitChart: lazyLoadRoute(
    () => import('../pages/ChartCalculation'),
    'TransitChart'
  ),

  // Advanced features
  GeneKeys: lazyLoadRoute(
    () => import('../pages/GeneKeys'),
    'GeneKeys'
  ),

  HumanDesign: lazyLoadRoute(
    () => import('../pages/HumanDesign'),
    'HumanDesign'
  ),

  PearlSequence: lazyLoadRoute(
    () => import('../pages/GeneKeys'),
    'PearlSequence'
  ),

  // Analysis features
  AspectAnalysis: lazyLoadRoute(
    () => import('../pages/AIInterpretation'),
    'AspectAnalysis'
  ),

  TransitAnalysis: lazyLoadRoute(
    () => import('../pages/AIInterpretation'),
    'TransitAnalysis'
  ),

  // User management
  Profile: lazyLoadRoute(
    () => import('../pages/Profile'),
    'Profile'
  ),

  Settings: lazyLoadRoute(
    () => import('../pages/Profile'),
    'Settings'
  ),

  // Authentication
  Login: lazyLoadRoute(
    () => import('../pages/Login'),
    'Login'
  ),

  Register: lazyLoadRoute(
    () => import('../pages/SignUp'),
    'Register'
  ),

  // Additional pages
  Calculator: lazyLoadRoute(
    () => import('../pages/Calculator'),
    'Calculator'
  ),

  Numerology: lazyLoadRoute(
    () => import('../pages/Numerology'),
    'Numerology'
  ),

  SavedCharts: lazyLoadRoute(
    () => import('../pages/SavedCharts'),
    'SavedCharts'
  ),

  SubscriptionSuccess: lazyLoadRoute(
    () => import('../pages/SubscriptionSuccessPage'),
    'SubscriptionSuccess'
  ),

  SubscriptionCancelled: lazyLoadRoute(
    () => import('../pages/SubscriptionCancelledPage'),
    'SubscriptionCancelled'
  ),

  PerformanceMonitoring: lazyLoadRoute(
    () => import('../pages/PerformanceMonitoring'),
    'PerformanceMonitoring'
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
    path: '/human-design',
    component: withErrorBoundary(AstroRoutes.HumanDesign),
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
    path: '/calculator',
    component: withErrorBoundary(AstroRoutes.Calculator),
    preload: false
  },
  {
    path: '/numerology',
    component: withErrorBoundary(AstroRoutes.Numerology),
    preload: false
  },
  {
    path: '/saved-charts',
    component: withErrorBoundary(AstroRoutes.SavedCharts),
    preload: false
  },
  {
    path: '/subscription-success',
    component: withErrorBoundary(AstroRoutes.SubscriptionSuccess),
    preload: false
  },
  {
    path: '/subscription-cancelled',
    component: withErrorBoundary(AstroRoutes.SubscriptionCancelled),
    preload: false
  },
  {
    path: '/performance',
    component: withErrorBoundary(AstroRoutes.PerformanceMonitoring),
    preload: false
  }
];
