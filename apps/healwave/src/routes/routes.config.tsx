import React, { Suspense } from 'react';
import { LazyLoadErrorBoundary } from '@cosmichub/config';
import { LazyPresets, LazyProfile } from './lazy-routes';
import LoadingFallback from '../components/LoadingFallback';

// Lazy loaded components with error boundaries
const withErrorBoundary = (Component: React.ComponentType): React.FC => {
  const Wrapped = () => (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </LazyLoadErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
};

// Route configuration with lazy loading - simplified to existing pages
export const healwaveRoutes = [
  {
    path: '/presets',
    component: withErrorBoundary(LazyPresets),
    preload: false,
  },
  {
    path: '/profile',
    component: withErrorBoundary(LazyProfile),
    preload: true,
  },
];
