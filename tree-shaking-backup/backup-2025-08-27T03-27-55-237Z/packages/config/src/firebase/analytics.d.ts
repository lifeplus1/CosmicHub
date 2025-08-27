import type { Analytics, AnalyticsCallOptions } from 'firebase/analytics';
export type { Analytics, AnalyticsCallOptions };
/**
 * Strongly typed facade describing the subset of Firebase Analytics we rely on.
 * This keeps consumers decoupled from direct firebase/analytics imports so we can
 * evolve implementation (or swap providers) without breaking APIs.
 */
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
export declare const createNoopAnalytics: () => AnalyticsService;
//# sourceMappingURL=analytics.d.ts.map
