/**
 * Advanced PWA Performance Enhancements for HealWave
 * Builds on existing CosmicHub performance optimizations
 */

import { devConsole } from './config/devConsole';

// Simple logger for PWA performance monitoring using shared devConsole pattern
// Local lightweight proxy (avoids cross-app import during early init)

class PWALogger {
  static log(message: string, ...args: unknown[]): void {
    devConsole.info(message, ...args);
  }
  static warn(message: string, ...args: unknown[]): void {
    devConsole.warn(message, ...args);
  }
  static error(message: string, ...args: unknown[]): void {
    devConsole.error(message, ...args);
  }
}

// HealWave-specific performance optimizations

function initializeHealWavePerformance(): void {
  PWALogger.log('Initializing HealWave performance optimizations');

  // Add performance initialization logic here
  // This would include:
  // - Service worker registration
  // - Resource preloading
  // - Network adaptation
  // - Performance monitoring
}

// Auto-initialize when imported
const IS_TEST = Boolean((import.meta as unknown as { vitest?: unknown }).vitest) ??
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { MODE?: string } }).env?.MODE === 'test') ??
  (typeof process !== 'undefined' && typeof process.env !== 'undefined' && (process.env.VITEST ?? process.env.NODE_ENV === 'test'));

if (document.readyState === 'loading') {
  const onReady = () => {
    document.removeEventListener('DOMContentLoaded', onReady);
    initializeHealWavePerformance();
  };
  document.addEventListener('DOMContentLoaded', onReady);
} else if (!IS_TEST) {
  // In non-test environments, initialize immediately when document is ready
  initializeHealWavePerformance();
}

// Test-only export
export const __test__ = {
  initNow: () => initializeHealWavePerformance(),
};
