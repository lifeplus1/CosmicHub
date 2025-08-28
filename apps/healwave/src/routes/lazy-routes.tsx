/**
 * Lazy Route Definitions for Healwave App
 * Implements route-based code splitting for frequency healing features
 */
import React, { lazy, Suspense } from 'react';

// Main page routes with lazy loading - only existing pages
const LazyPresets = lazy(() => import('../pages/Presets'));
const LazyProfile = lazy(() => import('../pages/Profile'));

// Simple loading fallback
const LoadingFallback = () => <div>Loading...</div>;

// Error boundary fallback
const ErrorFallback = ({ error }: { error: Error }) => (
  <div>Error loading component: {error.message}</div>
);

class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} />;
    }
    return this.props.children;
  }
}

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
