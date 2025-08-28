/**
 * @cosmichub/analytics
 * Comprehensive analytics and tracking for CosmicHub
 */

// Core Service
export {
  AnalyticsService,
  initializeAnalytics,
  getAnalytics,
} from './AnalyticsService.js';

// Types
export type {
  AnalyticsEvent,
  UserTraits,
  PageProperties,
  AnalyticsConfig,
  Platform,
  ChartCalculationEvent,
  AIInteractionEvent,
  MobileEvent,
  BusinessEvent,
  ConsentEvent,
  AstrologyAnalytics,
  DashboardMetrics,
  UserSegment,
} from './types/index.js';

// Chart Events
export {
  trackChartCalculation,
  trackChartView,
  trackChartShare,
  trackChartError,
  trackChartCustomization,
} from './events/ChartEvents.js';

// AI Events
export {
  trackAIInteraction,
  trackAIQuestion,
  trackAIPredictiveTransit,
  trackAIGrowthCoaching,
  trackAIPatternRecognition,
  trackAIMultiSystemSynthesis,
} from './events/AIEvents.js';

// Mobile Events
export {
  trackMobileEvent,
  trackPWAInstallPrompt,
  trackPWAInstallSuccess,
  trackOfflineUsage,
  trackPushNotification,
  trackMobilePerformance,
} from './events/MobileEvents.js';

// Business Events
export {
  trackBusinessEvent,
  trackSignUp,
  trackSubscriptionStart,
  trackSubscriptionCancel,
  trackFeatureUsage,
  trackConversion,
  trackTrialStart,
  trackPaywall,
} from './events/BusinessEvents.js';

// Default Analytics Configuration
export const createDefaultAnalyticsConfig = (
  overrides: Partial<import('./types/index.js').AnalyticsConfig> = {}
): import('./types/index.js').AnalyticsConfig => ({
  googleAnalytics: {
    measurementId: '',
    enabled: false,
  },
  mixpanel: {
    token: '',
    enabled: false,
    trackPageViews: true,
  },
  posthog: {
    apiKey: '',
    host: 'https://app.posthog.com',
    enabled: false,
    sessionRecording: false,
    heatmaps: false,
  },
  customAnalytics: {
    endpoint: '',
    enabled: false,
  },
  privacy: {
    respectDoNotTrack: true,
    anonymizeIP: true,
    cookieConsent: true,
    dataRetentionDays: 365,
  },
  ...overrides,
});
