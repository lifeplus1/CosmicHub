/**
 * Environment configuration and validation
 */

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Environment variable schema
export interface EnvConfig {
  NODE_ENV: Environment;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID?: string;
  NEXT_PUBLIC_FIREBASE_API_KEY?: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  NEXT_PUBLIC_FIREBASE_APP_ID?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_APP_URL: string;
}

// Required environment variables by environment
const requiredEnvVars: Record<Environment, (keyof EnvConfig)[]> = {
  development: [
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
  ],
  staging: [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ],
  production: [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]
};

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  const env = process.env.NODE_ENV as Environment;
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
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  });

  // Validate specific formats
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length < 30) {
    errors.push('NEXT_PUBLIC_FIREBASE_API_KEY appears to be invalid (too short)');
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_API_URL);
    } catch {
      errors.push('NEXT_PUBLIC_API_URL is not a valid URL');
    }
  }

  if (process.env.NEXT_PUBLIC_APP_URL && env === 'production') {
    try {
      const url = new URL(process.env.NEXT_PUBLIC_APP_URL);
      if (url.protocol !== 'https:') {
        errors.push('NEXT_PUBLIC_APP_URL must use HTTPS in production');
      }
    } catch {
      errors.push('NEXT_PUBLIC_APP_URL is not a valid URL');
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
  
  const baseConfig = {
    NODE_ENV: env,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || (
      env === 'production' 
        ? 'https://api.cosmichub.app'
        : env === 'staging'
        ? 'https://staging-api.cosmichub.app'
        : 'http://localhost:8000'
    ),
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (
      env === 'production'
        ? 'https://cosmichub.app'
        : env === 'staging'
        ? 'https://staging.cosmichub.app'
        : 'http://localhost:3000'
    ),
    ...(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && { NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }),
    ...(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && { NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY }),
    ...(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && { NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }),
    ...(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET && { NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }),
    ...(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID && { NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }),
    ...(process.env.NEXT_PUBLIC_FIREBASE_APP_ID && { NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID }),
    ...(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY })
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
  const value = process.env[key];
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
