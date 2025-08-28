// Utility no-op implementation for SSR / analytics unavailable scenarios
export const createNoOpAnalytics = () => ({
  setCurrentScreen: () => {},
  setUserId: () => {},
  setUserProperties: () => {},
});
//# sourceMappingURL=analytics.js.map
