/**
 * Environment// Environment va// Environment variable configuration interface
export interface EnvConfig {
  NODE_ENV: Environment;
  VITE_API_URL: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  VITE_APP_URL: string;
  XAI_API_KEY?: string;
}uration interface
export interface EnvConfig {
  NODE_E    try {
      new URL(appUrl);
    } catch {
      errors.push('VITE_APP_URL is not a valid URL');
    }
  }vironment;
  VITE_API_URL: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  VITE_APP_URL: string;
}n and validation
 */

// Define process for TypeScript
declare const process: {
  env?: Record<string, string | undefined>;
} | undefined;

// Define import.meta type for Vite
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMeta {
  env: Record<string, string | undefined>;
}

// Type for environment variables
type EnvRecord = Record<string, string | undefined>;

// Cross-runtime env accessor (works in Vite browser and Node)
const viteEnv: EnvRecord | undefined = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env as EnvRecord
  : undefined;

const getEnv = (key: string, fallback = ''): string => {
  // Type-safe access to environment variables
  const fromVite = viteEnv ? viteEnv[key] : undefined;
  const fromNode = typeof process !== 'undefined' && process?.env ? process.env[key] : undefined;
  return (fromVite ?? fromNode ?? fallback);
};

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Environment variable schema
export interface EnvConfig {
  NODE_ENV: Environment;
  VITE_API_URL: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_STRIPE_PUBLISHABLE_KEY?: string;
  VITE_APP_URL: string;
  XAI_API_KEY?: string;
  // Deployment-specific environment variables
  MONITORING_API_KEY?: string;
  MONITORING_API_KEY_PROD?: string;
  REDIS_PASSWORD?: string;
  REDIS_PASSWORD_PROD?: string;
  SENTRY_DSN?: string;
  SENTRY_DSN_PROD?: string;
  GA_TRACKING_ID?: string;
  GA_TRACKING_ID_PROD?: string;
  VAULT_ENDPOINT?: string;
  APP_VERSION?: string;
}

// Required environment variables by environment (supporting both VITE_ and NEXT_PUBLIC_ prefixes)
const requiredEnvVars: Record<Environment, string[]> = {
  development: [
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_API_KEY', 
    'VITE_FIREBASE_AUTH_DOMAIN'
  ],
  staging: [
    'VITE_API_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_STRIPE_PUBLISHABLE_KEY'
  ],
  production: [
    'VITE_API_URL',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'VITE_APP_URL'
  ]
};

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  const env = getEnv('NODE_ENV', 'development') as Environment;
  return ['development', 'staging', 'production'].includes(env) ? env : 'development';
};

// Validate environment variables
export const validateEnv = (): { isValid: boolean; missing: string[]; errors: string[] } => {
  const env = getCurrentEnvironment();
  const required = requiredEnvVars[env];
  const missing: string[] = [];
  const errors: string[] = [];

  // Check required variables
  required.forEach(varName => {
    const value = getEnv(varName);
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  });

  // Validate specific formats
  const firebaseApiKey = getEnv('VITE_FIREBASE_API_KEY');
  if (firebaseApiKey && firebaseApiKey.length < 10) { // Relaxed for demo values
    errors.push('VITE_FIREBASE_API_KEY appears to be invalid (too short)');
  }

  const apiUrl = getEnv('VITE_API_URL');
  if (apiUrl) {
    try {
      new URL(apiUrl);
    } catch {
      errors.push('VITE_API_URL is not a valid URL');
    }
  }

  const appUrl = getEnv('VITE_APP_URL');
  if (appUrl && env === 'production') {
    try {
      const url = new URL(appUrl);
      if (url.protocol !== 'https:') {
        errors.push('VITE_APP_URL must use HTTPS in production');
      }
    } catch {
      errors.push('VITE_APP_URL is not a valid URL');
    }
  }

  return {
    isValid: missing.length === 0 && errors.length === 0,
    missing,
    errors
  };
};

// Get environment configuration with defaults
export const getEnvConfig = (): Partial<EnvConfig> => {
  const env = getCurrentEnvironment();
  // Use VITE_ prefix for environment variables
  const baseConfig = {
    NODE_ENV: env,
    VITE_API_URL: getEnv('VITE_API_URL') || (
      env === 'production' 
        ? 'https://api.cosmichub.app'
        : env === 'staging'
        ? 'https://staging-api.cosmichub.app'
        : 'http://localhost:8000'
    ),
    VITE_APP_URL: getEnv('VITE_APP_URL') || (
      env === 'production'
        ? 'https://cosmichub.app'
        : env === 'staging'
        ? 'https://staging.cosmichub.app'
        : 'http://localhost:3000'
    ),
    ...(getEnv('VITE_FIREBASE_PROJECT_ID') && { VITE_FIREBASE_PROJECT_ID: getEnv('VITE_FIREBASE_PROJECT_ID') }),
    ...(getEnv('VITE_FIREBASE_API_KEY') && { VITE_FIREBASE_API_KEY: getEnv('VITE_FIREBASE_API_KEY') }),
    ...(getEnv('VITE_FIREBASE_AUTH_DOMAIN') && { VITE_FIREBASE_AUTH_DOMAIN: getEnv('VITE_FIREBASE_AUTH_DOMAIN') }),
    ...(getEnv('VITE_FIREBASE_STORAGE_BUCKET') && { VITE_FIREBASE_STORAGE_BUCKET: getEnv('VITE_FIREBASE_STORAGE_BUCKET') }),
    ...(getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') && { VITE_FIREBASE_MESSAGING_SENDER_ID: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') }),
    ...(getEnv('VITE_FIREBASE_APP_ID') && { VITE_FIREBASE_APP_ID: getEnv('VITE_FIREBASE_APP_ID') }),
    ...(getEnv('VITE_STRIPE_PUBLISHABLE_KEY') && { VITE_STRIPE_PUBLISHABLE_KEY: getEnv('VITE_STRIPE_PUBLISHABLE_KEY') }),
    ...(getEnv('XAI_API_KEY') && { XAI_API_KEY: getEnv('XAI_API_KEY') }),
    // Deployment-specific environment variables
    ...(getEnv('MONITORING_API_KEY') && { MONITORING_API_KEY: getEnv('MONITORING_API_KEY') }),
    ...(getEnv('MONITORING_API_KEY_PROD') && { MONITORING_API_KEY_PROD: getEnv('MONITORING_API_KEY_PROD') }),
    ...(getEnv('REDIS_PASSWORD') && { REDIS_PASSWORD: getEnv('REDIS_PASSWORD') }),
    ...(getEnv('REDIS_PASSWORD_PROD') && { REDIS_PASSWORD_PROD: getEnv('REDIS_PASSWORD_PROD') }),
    ...(getEnv('SENTRY_DSN') && { SENTRY_DSN: getEnv('SENTRY_DSN') }),
    ...(getEnv('SENTRY_DSN_PROD') && { SENTRY_DSN_PROD: getEnv('SENTRY_DSN_PROD') }),
    ...(getEnv('GA_TRACKING_ID') && { GA_TRACKING_ID: getEnv('GA_TRACKING_ID') }),
    ...(getEnv('GA_TRACKING_ID_PROD') && { GA_TRACKING_ID_PROD: getEnv('GA_TRACKING_ID_PROD') }),
    ...(getEnv('VAULT_ENDPOINT') && { VAULT_ENDPOINT: getEnv('VAULT_ENDPOINT') }),
    ...(getEnv('APP_VERSION') && { APP_VERSION: getEnv('APP_VERSION') })
  };

  return baseConfig;
};

// Environment-specific feature flags
export const getFeatureFlags = () => {
  const env = getCurrentEnvironment();
  
  return {
    enableDebugMode: env === 'development',
    enableBetaFeatures: env !== 'production',
    enableAnalytics: env === 'production',
    enableHotReload: env === 'development',
    enableServiceWorker: env === 'production',
    enableErrorReporting: env !== 'development',
    enablePerformanceMonitoring: env === 'production',
    enableMockData: env === 'development',
    enableTestingMode: env !== 'production'
  };
};

// Utility functions
export const isDevelopment = () => getCurrentEnvironment() === 'development';
export const isStaging = () => getCurrentEnvironment() === 'staging';
export const isProduction = () => getCurrentEnvironment() === 'production';

// Safe environment getter with fallbacks
export const getEnvVar = (key: keyof EnvConfig, fallback?: string): string => {
  const value = getEnv(key);
  if (!value || value.trim() === '') {
    if (fallback !== undefined) {
      return fallback;
    }
    console.warn(`Environment variable ${key} is not set`);
    return '';
  }
  return value;
};

// Initialize and validate environment on import
let validationResult: ReturnType<typeof validateEnv> | null = null;

export const initializeEnv = () => {
  validationResult = validateEnv();
  
  if (!validationResult.isValid) {
    console.group('🚨 Environment Configuration Issues');
    
    if (validationResult.missing.length > 0) {
      console.error('Missing required environment variables:', validationResult.missing);
    }
    
    if (validationResult.errors.length > 0) {
      console.error('Environment validation errors:', validationResult.errors);
    }
    
    console.groupEnd();
    
    // Only throw in production to prevent development issues
    if (isProduction()) {
      throw new Error('Environment validation failed. Check console for details.');
    }
  } else {
    console.log(`✅ Environment (${getCurrentEnvironment()}) configured successfully`);
  }
  
  return validationResult;
};

// Export current environment config
export const env = getEnvConfig();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  initializeEnv();
}

export default {
  getCurrentEnvironment,
  validateEnv,
  getEnvConfig,
  getFeatureFlags,
  isDevelopment,
  isStaging,
  isProduction,
  getEnvVar,
  initializeEnv,
  env
};
