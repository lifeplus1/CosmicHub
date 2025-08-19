import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1, 'Firebase auth domain is required'),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase project ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1, 'Firebase storage bucket is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1, 'Firebase messaging sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  VITE_API_URL: z.string().url().optional(),
  VITE_XAI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').optional(),
  VITE_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').optional(),
});

// Validate environment variables
function validateEnvironment() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    // Use raw console.error here intentionally (bootstrapping prior to devConsole creation)
    // eslint-disable-next-line no-console
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment
export const env = validateEnvironment();

// Environment helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Feature flags
export const features = {
  analytics: env.VITE_ENABLE_ANALYTICS ?? false,
  errorReporting: env.VITE_ENABLE_ERROR_REPORTING ?? isProduction(),
  healwave: true,
  numerology: true,
  humanDesign: true,
  crossAppIntegration: true,
};

// API configuration
export const apiConfig = {
  baseUrl: env.VITE_API_URL ?? 'http://localhost:8001',
  timeout: 10000,
  retries: 3,
};

// Firebase configuration
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

// Security configuration
export const securityConfig = {
  enableCSP: isProduction(),
  enableHSTS: isProduction(),
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

// XAI API configuration
export const xaiConfig = {
  apiKey: env.VITE_XAI_API_KEY,
  baseUrl: 'https://api.x.ai/v1',
  model: 'grok-beta',
  timeout: 30000,
  enabled: !!env.VITE_XAI_API_KEY,
};

// Logging configuration
export const loggingConfig = {
  level: isDevelopment() ? 'debug' : 'warn',
  enableConsole: isDevelopment(),
  enableRemote: isProduction(),
};

// Performance monitoring configuration
export const performanceConfig = {
  enabled: isDevelopment() || env.VITE_ENABLE_ANALYTICS,
  trackingInterval: 5000, // 5 seconds
  maxOperations: 1000, // Keep last 1000 operations
  enableMemoryTracking: 'memory' in performance,
  enablePagePerformance: true,
  enableComponentTracking: isDevelopment(),
  thresholds: {
    slowOperation: 1000, // 1 second
    memoryWarning: 80, // 80% of heap limit
    renderWarning: 100, // 100ms render time
  },
  logging: {
    enabled: isDevelopment(),
    verbose: false,
    logSlowOperations: true,
  },
};

// Development utilities
// Dev logging abstraction (silences in production except errors)
// Wrapped in factory to support tree-shaking and easier future extension (e.g., remote logging)
/* eslint-disable no-console */
const makeDevConsole = () => ({
  log: isDevelopment() ? console.log.bind(console) : undefined,
  warn: isDevelopment() ? console.warn.bind(console) : undefined,
  info: isDevelopment() ? console.info?.bind(console) : undefined,
  debug: isDevelopment() ? console.debug?.bind(console) : undefined,
  error: console.error.bind(console), // Always surface errors
});
/* eslint-enable no-console */

export const devConsole = makeDevConsole();

export default env;
