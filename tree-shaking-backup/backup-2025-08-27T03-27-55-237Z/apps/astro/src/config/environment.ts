/// <reference types="../env.d.ts" />
import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1, 'Firebase API key is required'),
  VITE_FIREBASE_AUTH_DOMAIN: z
    .string()
    .min(1, 'Firebase auth domain is required'),
  VITE_FIREBASE_PROJECT_ID: z
    .string()
    .min(1, 'Firebase project ID is required'),
  VITE_FIREBASE_STORAGE_BUCKET: z
    .string()
    .min(1, 'Firebase storage bucket is required'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z
    .string()
    .min(1, 'Firebase messaging sender ID is required'),
  VITE_FIREBASE_APP_ID: z.string().min(1, 'Firebase app ID is required'),
  VITE_API_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  VITE_ENABLE_ERROR_REPORTING: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

// Validate environment variables
function validateEnvironment() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    // Use raw console.error here intentionally (bootstrapping prior to devConsole creation)

    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment

// Environment helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';

// Feature flags

// API configuration
export const apiConfig = {
  baseUrl: env.VITE_API_URL ?? 'http://localhost:8001',
  timeout: 10000,
  retries: 3,
};

// Firebase configuration

// Security configuration

// Logging configuration
export const loggingConfig = {
  level: isDevelopment() ? 'debug' : 'warn',
  enableConsole: isDevelopment(),
  enableRemote: isProduction(),
};

// Performance monitoring configuration
  logging: {
    enabled: isDevelopment(),
    verbose: false,
    logSlowOperations: true,
  },
};

// Development utilities
// Dev logging abstraction (silences in production except errors)
// Wrapped in factory to support tree-shaking and easier future extension (e.g., remote logging)

interface DevConsole {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const noop = (): void => {};
const makeDevConsole = (): DevConsole => ({
  log: isDevelopment() ? console.log.bind(console) : noop,
  warn: isDevelopment() ? console.warn.bind(console) : noop,
  info: isDevelopment() ? (console.info?.bind(console) ?? noop) : noop,
  debug: isDevelopment() ? console.debug.bind(console) : noop,
  error: console.error.bind(console), // Always surface errors
});

export const devConsole = makeDevConsole();

export default env;
