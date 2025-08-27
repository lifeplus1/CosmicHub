/// <reference types="../vite-env.d.ts" />

/**
 * HealWave Environment Configuration
 * Centralized environment handling for the HealWave app
 */

export type Environment = 'development' | 'production' | 'test';

/**
 * Get the current environment
 */
function getCurrentEnvironment(): Environment {
  // Check Vite environment variables first
  if (typeof import.meta !== 'undefined') {
    const mode = import.meta.env.MODE;
    if (mode === 'production') return 'production';
    if (mode === 'test') return 'test';
    return 'development';
  }

  // Fallback to Node.js environment
  if (typeof process !== 'undefined') {
    const nodeEnv = process.env?.['NODE_ENV'];
    if (nodeEnv === 'production') return 'production';
    if (nodeEnv === 'test') return 'test';
    return 'development';
  }

  // Default to development
  return 'development';
}

// Environment helper functions
export const isDevelopment = () =>
  getCurrentEnvironment() === 'development' || Boolean(import.meta?.env?.DEV);
export const isProduction = () =>
  getCurrentEnvironment() === 'production' || Boolean(import.meta?.env?.PROD);
export const isTest = () => getCurrentEnvironment() === 'test';

// Development/Production utilities
export function devOnly<T>(value: T): T | undefined {
  return isDevelopment() ? value : undefined;
}

export function prodOnly<T>(value: T): T | undefined {
  return isProduction() ? value : undefined;
}

// Import logger from config
import { logger } from '@cosmichub/config';

// Create environment-specific logger
export const devConsole = logger.child({ module: 'HealWaveEnvironment' });

// Feature flags
// Safely build feature flags without spreading potential any arrays
const baseDev = isDevelopment();
export const features = {
  mockAuth: baseDev,
  devLogging: baseDev,
  showDebugInfo: baseDev,
} as const;

export default {
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  isTest: isTest(),
  environment: getCurrentEnvironment(),
  features,
};
