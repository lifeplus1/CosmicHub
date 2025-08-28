// Firebase Analytics typed facade
import type { Analytics, AnalyticsCallOptions } from 'firebase/analytics';

export type { Analytics, AnalyticsCallOptions };

/**
 * Strongly typed facade describing the subset of Firebase Analytics we rely on.
 * This keeps consumers decoupled from direct firebase/analytics imports so we can
 * evolve implementation (or swap providers) without breaking APIs.
 */
export interface AnalyticsFacade {
  setCurrentScreen: (
    screenName: string,
    options?: AnalyticsCallOptions
  ) => void;
  setUserId: (userId: string, options?: AnalyticsCallOptions) => void;
  setUserProperties: (
    properties: Record<string, unknown>,
    options?: AnalyticsCallOptions
  ) => void;
}

// Factory signature for lazily retrieving an Analytics instance (supports dynamic import usage)
export type AnalyticsFactory = () => Analytics | null;

// Utility no-op implementation for SSR / analytics unavailable scenarios
export const createNoOpAnalytics = (): AnalyticsFacade => ({
  setCurrentScreen: () => {},
  setUserId: () => {},
  setUserProperties: () => {},
});
