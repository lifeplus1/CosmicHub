/**
 * Application constants - Performance optimized with lazy loading
 */

// Core app metadata
export const APP_CONFIG = {
  name: 'CosmicHub',
  version: '1.0.0',
  description: 'Professional Astrology & Spiritual Analysis Platform',
} as const;

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

export const API_CONFIG = {
  baseUrl: getApiUrl(),
  timeout: 30000,
  retryAttempts: 3,
  batchSize: 50, // For efficient data fetching
  cacheTimeout: 5 * 60 * 1000, // 5 min cache
} as const;

// Lazy-loaded astrological constants
export const ASTRO_CONSTANTS = {
  planets: [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ],
  signs: [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ],
  aspects: ['conjunction', 'opposition', 'trine', 'square', 'sextile'],
  elements: ['fire', 'earth', 'air', 'water'],
  modalities: ['cardinal', 'fixed', 'mutable'],
} as const;

// Subscription tiers for performance billing
export const SUBSCRIPTION_PLANS = {
  free: { id: 'free', name: 'Free', price: 0, chartsLimit: 3, aiCredits: 0 },
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
export const UI_CONSTANTS = {
  debounceDelay: 300,
  throttleDelay: 100,
  animationDuration: 200,
  breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' },
} as const;

// Feature flags for code splitting
export const FEATURES = {
  aiInterpretation: true,
  humanDesign: true,
  geneKeys: true,
  numerology: true,
  transits: true,
  multiSystem: true,
  healwaveIntegration: true,
} as const;

export default {
  APP_CONFIG,
  API_CONFIG,
  ASTRO_CONSTANTS,
  SUBSCRIPTION_PLANS,
  UI_CONSTANTS,
  FEATURES,
};
