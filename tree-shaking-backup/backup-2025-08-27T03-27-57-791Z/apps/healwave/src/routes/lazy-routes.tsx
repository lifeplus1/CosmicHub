/**
 * Lazy Route Definitions for Healwave App
 * Implements route-based code splitting for frequency healing features
 */
import React from 'react';
import { lazyLoadRoute, LazyLoadErrorBoundary } from '@cosmichub/config';

// Main page routes with lazy loading - only existing pages

// Lazy loaded components with error boundaries
    </LazyLoadErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${Component.displayName ?? Component.name ?? 'Component'})`;
  return Wrapped;
};

// Route configuration with lazy loading - simplified to existing pages
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
