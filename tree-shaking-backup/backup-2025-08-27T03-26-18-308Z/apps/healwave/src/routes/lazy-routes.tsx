/**
 * Lazy Route Definitions for Healwave App
 * Implements route-based code splitting for frequency healing features
 */
import React from 'react';
import { lazyLoadRoute, LazyLoadErrorBoundary } from '@cosmichub/config';

// Main page routes with lazy loading - only existing pages
export const HealwaveRoutes = {
  // Frequency healing features (existing pages)
  FrequencyGenerator: lazyLoadRoute(
    () => import('../pages/FrequencyGenerator'),
    'FrequencyGenerator'
  ),

  Presets: lazyLoadRoute(() => import('../pages/Presets'), 'Presets'),

  // User management (existing page)
  Profile: lazyLoadRoute(() => import('../pages/Profile'), 'Profile'),
};

// Lazy loaded components with error boundaries
export const withErrorBoundary = (
  Component: React.ComponentType<Record<string, unknown>>
) => {
  const Wrapped: React.FC<Record<string, unknown>> = props => (
    <LazyLoadErrorBoundary>
      <Component {...props} />
    </LazyLoadErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
};

// Route configuration with lazy loading - simplified to existing pages
export const healwaveRouteConfig = [
  {
    path: '/frequency-generator',
    component: withErrorBoundary(HealwaveRoutes.FrequencyGenerator),
    preload: false,
  },
  {
    path: '/presets',
    component: withErrorBoundary(HealwaveRoutes.Presets),
    preload: false,
  },
  {
    path: '/profile',
    component: withErrorBoundary(HealwaveRoutes.Profile),
    preload: true,
  },
];
