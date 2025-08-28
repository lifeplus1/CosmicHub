/**
 * Application constants - Performance optimized with lazy loading
 */

// Core app metadata

// Performance-optimized API config
const getApiUrl = (): string => {
  try {
    // Check Vite environment
    const viteUrl =
      typeof import.meta !== 'undefined'
        ? (import.meta as { env?: { VITE_API_URL?: string } }).env?.[
            'VITE_API_URL'
          ]
        : undefined;

    // Check Node environment safely
    const nodeUrl =
      typeof globalThis !== 'undefined' && 'process' in globalThis
        ? (globalThis as { process?: { env?: { VITE_API_URL?: string } } })
            .process?.env?.['VITE_API_URL']
        : undefined;

    return viteUrl ?? nodeUrl ?? 'http://localhost:8000';
  } catch {
    return 'http://localhost:8000';
  }
};

// Lazy-loaded astrological constants
const ASTRO_CONSTANTS = {
  // These would be lazily loaded in production
};

// Subscription tiers for performance billing
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    chartsLimit: 25,
    aiCredits: 50,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    chartsLimit: 100,
    aiCredits: 200,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99.99,
    chartsLimit: -1,
    aiCredits: 1000,
  },
} as const;

// UI performance constants
const UI_CONSTANTS = {
  // UI-related constants would go here
} as const;

// Feature flags for code splitting
const FEATURES = {
  // Feature flags would go here
} as const;

// Core app metadata
const APP_CONFIG = {
  name: 'CosmicHub',
  version: '1.0.0',
} as const;

// Performance-optimized API config
const API_CONFIG = {
  baseUrl: getApiUrl(),
} as const;

export default {
  APP_CONFIG,
  API_CONFIG,
  ASTRO_CONSTANTS,
  SUBSCRIPTION_PLANS,
  UI_CONSTANTS,
  FEATURES,
};
