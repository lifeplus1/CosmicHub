/**
 * Configuration utilities for the astrology and healwave apps
 * Provides type-safe access to app configuration and feature flags
 */

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

const DEFAULT_API_URL = 'http://localhost:8000';
const DEFAULT_ENVIRONMENT = 'development';
const DEFAULT_VERSION = '1.0.0';

// Validate environment variables
const getValidatedApiUrl = (): string => {
  const apiUrl = process.env.VITE_API_URL;
  if (!apiUrl) {
    console.warn(`VITE_API_URL not set, falling back to ${DEFAULT_API_URL}`);
    return DEFAULT_API_URL;
  }
  try {
    new URL(apiUrl); // Validate URL format
    return apiUrl;
  } catch (error) {
    console.error('Invalid VITE_API_URL format:', error);
    return DEFAULT_API_URL;
  }
};

// Memoized configuration to prevent re-computation
const config: AppConfig = {
  apiUrl: getValidatedApiUrl(),
  isDevelopment: process.env.NODE_ENV === 'development',
  features: {
    healwave: true,
    astrology: true,
    numerology: true,
    humanDesign: true,
    crossAppIntegration: true,
  },
} as const;

// Feature flags with strict typing
type Feature = keyof AppConfig['features'];

export const getAppConfig = (appName: string): AppInstanceConfig => {
  if (!appName || typeof appName !== 'string') {
    console.error('Invalid appName provided to getAppConfig');
    throw new Error('App name must be a non-empty string');
  }

  return {
    app: appName,
    environment: (process.env.NODE_ENV as AppInstanceConfig['environment']) || DEFAULT_ENVIRONMENT,
    version: DEFAULT_VERSION,
  };
};

export const isFeatureEnabled = (feature: Feature): boolean => {
  return config.features[feature] ?? false;
};

export { config };

export * from './types';
export * from './performance';
export { 
  usePerformance, 
  useOperationTracking, 
  usePagePerformance, 
  useRealTimePerformance,
  withPerformanceTracking 
} from './hooks';
export * from './react-performance';
export * from './lazy-loading';
export * from './component-architecture';
export * from './enhanced-testing';
export * from './accessibility-testing';

// Phase 4: Advanced optimization exports
export * from './bundle-optimization';
export * from './caching-service-worker';
export * from './performance-monitoring';
export * from './production-deployment';