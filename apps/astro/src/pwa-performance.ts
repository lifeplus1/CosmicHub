/**
 * Advanced PWA Performance Enhancements
 * Builds on existing CosmicHub performance optimizations
 */

// Type definition for devConsole to fix unsafe access issues
interface DevConsole {
  log?: (message?: unknown, ...optionalParams: unknown[]) => void;
  warn?: (message?: unknown, ...optionalParams: unknown[]) => void;
  error?: (message?: unknown, ...optionalParams: unknown[]) => void;
}

// Safe logging helper to avoid require() and unsafe assignments
function safeLog(message: string): void {
  try {
    // Use dynamic import instead of require for ES modules
    void import('./config/environment')
      .then(({ devConsole }: { devConsole: DevConsole }) => {
        devConsole.log?.(message);
      })
      .catch(() => {
        // Fallback - no logging in production
      });
  } catch {
    // Silent fallback for production
  }
}

function safeWarn(message: string, ...args: unknown[]): void {
  try {
    void import('./config/environment')
      .then(({ devConsole }: { devConsole: DevConsole }) => {
        devConsole.warn?.(message, ...args);
      })
      .catch(() => {
        // Fallback - no logging in production
      });
  } catch {
    // Silent fallback for production
  }
}

function safeError(message: string, ...args: unknown[]): void {
  try {
    void import('./config/environment')
      .then(({ devConsole }: { devConsole: DevConsole }) => {
        devConsole.error?.(message, ...args);
      })
      .catch(() => {
        // Silent fallback - errors logged through devConsole only
      });
  } catch {
    // Silent fallback - errors logged through devConsole only
  }
}

// Critical Resource Prioritization

// Connection-aware loading (builds on existing lazy loading)
// Local fallback type for NetworkInformation (not in standard lib in some TS configs)
// Minimal subset used by this file
interface NetworkInformationFallback {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}

// Performance monitoring for PWA

// Stub implementation for PWA performance initialization
function initializePWAPerformance(): void {
  safeLog('PWA Performance initialization called');
  // TODO: Implement PWA performance optimizations
}

// Initialize PWA performance when DOM is ready
export function initPWAPerformance(): void {
  const doc = typeof document !== 'undefined' ? document : null;
  if (doc === null) return;

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => {
      initializePWAPerformance();
    });
  } else {
    initializePWAPerformance();
  }
}
