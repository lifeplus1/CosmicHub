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
export const isDevelopment = () => getCurrentEnvironment() === 'development' || (typeof import.meta !== 'undefined' && import.meta.env.DEV);
export const isProduction = () => getCurrentEnvironment() === 'production' || (typeof import.meta !== 'undefined' && import.meta.env.PROD);
export const isTest = () => getCurrentEnvironment() === 'test';

// Development/Production utilities
export function devOnly<T>(value: T): T | undefined {
  return isDevelopment() ? value : undefined;
}

export function prodOnly<T>(value: T): T | undefined {
  return isProduction() ? value : undefined;
}

// Console wrapper that respects environment
/* eslint-disable no-console */
export const devConsole = {
  log: (...args: any[]) => isDevelopment() && console.log(...args),
  warn: (...args: any[]) => isDevelopment() && console.warn(...args),
  error: (...args: any[]) => console.error(...args), // Always show errors
  info: (...args: any[]) => isDevelopment() && console.info(...args),
};
/* eslint-enable no-console */

// Feature flags
export const features = {
  mockAuth: isDevelopment(),
  devLogging: isDevelopment(),
  showDebugInfo: isDevelopment(),
};

export default {
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  isTest: isTest(),
  environment: getCurrentEnvironment(),
  features,
};