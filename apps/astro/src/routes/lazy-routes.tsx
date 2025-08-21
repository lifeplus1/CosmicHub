/**
 * Lazy Route Definitions for Astro App
 * Implements route-based code splitting for optimal loading performance
 */

import React, { type ComponentType } from 'react';
import { lazyLoadRoute, LazyLoadErrorBoundary } from '@cosmichub/config';

// Main page routes with lazy loading
export const AstroRoutes: Record<string, ReturnType<typeof lazyLoadRoute>> = {
  // Dashboard route
  Dashboard: lazyLoadRoute(
    () => import('../pages/Dashboard'),
    'AstroDashboard'
  ),

  // Chart generation routes
  BirthChart: lazyLoadRoute(
    () => import('../pages/Chart'),
    'BirthChart'
  ),

  SynastryChart: lazyLoadRoute(
    () => import('../pages/Synastry'),
    'SynastryChart'
  ),

  TransitChart: lazyLoadRoute(
    () => import('../pages/Chart'),
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
    () => import('../pages/SubscriptionSuccess'),
    'SubscriptionSuccess'
  ),

  SubscriptionCancelled: lazyLoadRoute(
    () => import('../pages/SubscriptionCancel'),
    'SubscriptionCancelled'
  ),

  PerformanceMonitoring: lazyLoadRoute(
    () => import('../pages/PerformanceMonitoring'),
    'PerformanceMonitoring'
  )
};

// Lazy loaded components with error boundaries
// Wrap a lazily loaded component with an error boundary.
// Use a generic to preserve prop types instead of any.
export const withErrorBoundary = <P extends Record<string, unknown>>(
  Component: ComponentType<P>
): React.FC<P> => {
  const Wrapped: React.FC<P> = (props: P) => (
    <LazyLoadErrorBoundary>
      {React.createElement(Component, props)}
    </LazyLoadErrorBoundary>
  );
  const baseName = Component.displayName ?? Component.name ?? 'Component';
  Wrapped.displayName = `WithErrorBoundary(${baseName})`;
  return Wrapped;
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
