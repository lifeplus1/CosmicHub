// Utility no-op implementation for SSR / analytics unavailable scenarios
export const createNoopAnalytics = () => ({
  logEvent: () => {},
  setCurrentScreen: () => {},
  setUserId: () => {},
  setUserProperties: () => {},
});
//# sourceMappingURL=analytics.js.map
