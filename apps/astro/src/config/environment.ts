/// <reference types="../env.d.ts" />
import { z } from 'zod';

// Internal helper to coerce common boolean env patterns
const booleanFromEnv = (val: unknown): boolean => {
  if (val === true) return true;
  if (val === false) return false;
  if (typeof val !== 'string') return false;
  return ['1', 'true', 'yes', 'on', 'enable', 'enabled'].includes(
    val.toLowerCase().trim()
  );
};

// Environment validation schema
const envSchema = z
  .object({
    // Firebase config - optional in development with mock auth
    VITE_FIREBASE_API_KEY: z.string().optional(),
    VITE_FIREBASE_AUTH_DOMAIN: z.string().optional(),
    VITE_FIREBASE_PROJECT_ID: z.string().optional(),
    VITE_FIREBASE_STORAGE_BUCKET: z.string().optional(),
    VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
    VITE_FIREBASE_APP_ID: z.string().optional(),
    VITE_API_URL: z.string().url().optional(),
    ALLOW_MOCK_AUTH: z
      .any()
      .optional()
      .transform(v => booleanFromEnv(v) || false),
    // Frontend analytics providers (all optional)
    PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    PUBLIC_MIXPANEL_TOKEN: z.string().optional(),
    PUBLIC_POSTHOG_API_KEY: z.string().optional(),
    PUBLIC_POSTHOG_HOST: z.string().url().optional(),
    // Error monitoring
    SENTRY_DSN: z.string().url().optional(),
    SENTRY_DSN_PROD: z.string().url().optional(),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    VITE_ENABLE_ANALYTICS: z
      .any()
      .optional()
      .transform(v => booleanFromEnv(v) || false),
    VITE_ENABLE_ERROR_REPORTING: z
      .any()
      .optional()
      .transform(v => booleanFromEnv(v) || false),
  })
  .refine(
    (data) => {
      // In production, Firebase is required unless mock auth is explicitly allowed
      if (data.NODE_ENV === 'production' && !data.ALLOW_MOCK_AUTH) {
        return (
          data.VITE_FIREBASE_API_KEY &&
          data.VITE_FIREBASE_AUTH_DOMAIN &&
          data.VITE_FIREBASE_PROJECT_ID &&
          data.VITE_FIREBASE_STORAGE_BUCKET &&
          data.VITE_FIREBASE_MESSAGING_SENDER_ID &&
          data.VITE_FIREBASE_APP_ID
        );
      }
      return true;
    },
    {
      message: 'Firebase configuration is required in production unless ALLOW_MOCK_AUTH=true',
    }
  )
  .transform(data => ({
    ...data,
    // Derived fields (add more as needed)
    VITE_PUBLIC_MODE: data.NODE_ENV === 'production' ? 'prod' : 'non-prod',
    // Check if Firebase is properly configured
    HAS_FIREBASE_CONFIG: !!(
      data.VITE_FIREBASE_API_KEY &&
      data.VITE_FIREBASE_AUTH_DOMAIN &&
      data.VITE_FIREBASE_PROJECT_ID &&
      data.VITE_FIREBASE_STORAGE_BUCKET &&
      data.VITE_FIREBASE_MESSAGING_SENDER_ID &&
      data.VITE_FIREBASE_APP_ID
    ),
  }));

type _RawEnv = z.input<typeof envSchema>;
export type AppEnv = z.output<typeof envSchema>;

// Validate environment variables
function validateEnvironment(): AppEnv {
  try {
    // IMPORTANT: Spread to avoid prototype pollution & only include keys expected by schema
    // @ts-ignore - Vite provides import.meta.env at runtime
    const raw: Record<string, unknown> = { ...import.meta.env };
    return envSchema.parse(raw);
  } catch (error) {
    // Use raw console.error here intentionally (bootstrapping prior to devConsole creation)

    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Export validated environment
let cachedEnv: AppEnv | null = null;
export const env: AppEnv = ((): AppEnv => {
  cachedEnv = validateEnvironment();
  return cachedEnv;
})();

// Optional: allow test environment to force re-parse (not recommended for runtime code)
export const _reloadEnvForTests = (): AppEnv => {
  if (env.NODE_ENV !== 'test') {
    console.warn('Reloading env outside test mode is discouraged.');
  }
  cachedEnv = validateEnvironment();
  return cachedEnv;
};

// Environment helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Feature flag accessors
export const isAnalyticsEnabled = () => env.VITE_ENABLE_ANALYTICS;
export const isErrorReportingEnabled = () => env.VITE_ENABLE_ERROR_REPORTING;

// Structured feature flags object (extend with computed flags as system grows)
export const featureFlags = Object.freeze({
  analytics: isAnalyticsEnabled(),
  errorReporting: isErrorReportingEnabled(),
});

// Analytics capability helpers
export const analyticsProviders = Object.freeze({
  ga: !!env.PUBLIC_GA_MEASUREMENT_ID,
  mixpanel: !!env.PUBLIC_MIXPANEL_TOKEN,
  posthog: !!env.PUBLIC_POSTHOG_API_KEY,
});

export const hasAnyAnalyticsProvider =
  analyticsProviders.ga ||
  analyticsProviders.mixpanel ||
  analyticsProviders.posthog;

export const sentryConfig = Object.freeze({
  dsn: env.SENTRY_DSN ?? env.SENTRY_DSN_PROD ?? undefined,
  prodDsn: env.SENTRY_DSN_PROD,
});

// Safe strongly-typed accessor
type EnvKey = keyof AppEnv;
export function getEnv<K extends EnvKey>(key: K): AppEnv[K] {
  return env[key];
}

// Assert presence / truthy for required at runtime (throws if missing/false)
export function requireEnv<K extends EnvKey>(key: K): AppEnv[K] {
  const value = env[key];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

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
  analyticsEnabled: featureFlags.analytics,
};

// Performance monitoring configuration
export const performanceConfig = {
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
