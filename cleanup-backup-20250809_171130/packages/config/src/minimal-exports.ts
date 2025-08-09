/**
 * Minimal config exports for Docker build compatibility
 * These provide basic functionality without complex dependencies
 */

import React from 'react';

// Basic app config types
export interface AppConfig {
  apiUrl: string;
  isDevelopment: boolean;
  features: {
    healwave: boolean;
    astrology: boolean;
    numerology: boolean;
    humanDesign: boolean;
    crossAppIntegration: boolean;
  };
}

export interface AppInstanceConfig {
  app: string;
  environment: 'development' | 'production' | 'test';
  version: string;
}

// Basic configuration
const envAny: any = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env
  : (process?.env || {});

const config: AppConfig = {
  apiUrl: envAny.VITE_API_URL || 'http://localhost:8000',
  isDevelopment: !!(envAny.DEV || envAny.NODE_ENV === 'development'),
  features: {
    healwave: true,
    astrology: true,
    numerology: true,
    humanDesign: true,
    crossAppIntegration: true,
  },
};

export const getAppConfig = (appName: string): AppInstanceConfig => ({
  app: appName,
  environment: (envAny.NODE_ENV as AppInstanceConfig['environment']) || 'development',
  version: '1.0.0',
});

export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature] ?? false;
};

// Performance stubs
export const usePerformance = () => ({
  startOperation: () => {},
  endOperation: () => {},
  metrics: {},
});

export const usePagePerformance = () => ({
  markPageStart: () => {},
  markPageEnd: () => {},
  getPageMetrics: () => ({}),
});

export const useOperationTracking = () => ({
  trackOperation: () => {},
  getOperationMetrics: () => ({}),
});

export const reportPerformance = () => {};

// Lazy loading stubs
export const lazyLoadRoute = (importFn: () => Promise<any>, routeName?: string) => {
  return React.lazy(importFn);
};

export const LazyLoadErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement('div', null, children);
};

// Re-export enhanced testing utilities
export * from './enhanced-testing';

// Re-export accessibility testing utilities
export * from './accessibility-testing';

// Re-export component architecture utilities
export * from './component-library';

export { config };
