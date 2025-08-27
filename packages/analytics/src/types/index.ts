/**
 * Core Analytics Types and Interfaces
 * Privacy-compliant analytics system for CosmicHub
 */

export type Platform = 'web' | 'mobile' | 'pwa';

export interface AnalyticsEvent {
  event: string;
  user_id?: string;
  session_id: string;
  timestamp: number;
  properties: Record<string, string | number | boolean | null>;
  platform: Platform;
}

export interface UserTraits {
  user_id?: string;
  email?: string; // Only with explicit consent
  created_at?: number;
  subscription_tier?: 'free' | 'premium' | 'pro';
  preferred_chart_type?: string;
  astrology_system?: 'western' | 'vedic' | 'chinese';
  privacy_level?: 'minimal' | 'standard' | 'full';
}

export interface PageProperties {
  path: string;
  title: string;
  referrer?: string;
  search_query?: string;
  user_type?: 'anonymous' | 'authenticated';
}

// Chart-specific analytics
export interface ChartCalculationEvent {
  chart_type: 'natal' | 'transit' | 'synastry' | 'composite' | 'solar_return';
  calculation_time_ms: number;
  success: boolean;
  error_type?: string;
  astrology_system: 'western' | 'vedic' | 'chinese';
  house_system?: string;
  orb_settings?: Record<string, number>;
}

// AI interaction analytics
export interface AIInteractionEvent {
  feature: 'predictive_transits' | 'ai_questions' | 'multi_system_synthesis' | 'growth_coaching' | 'pattern_recognition';
  input_type: 'text' | 'voice' | 'selection';
  response_time_ms: number;
  user_satisfaction?: 1 | 2 | 3 | 4 | 5;
  tokens_used?: number;
  model_version?: string;
}

// Mobile/PWA specific events
export interface MobileEvent {
  event_type: 'app_install' | 'install_prompt_shown' | 'install_dismissed' | 'push_notification_received' | 'offline_usage';
  install_source?: 'chrome' | 'safari' | 'edge' | 'firefox' | 'store';
  notification_type?: 'daily_insight' | 'transit_alert' | 'feature_update';
  offline_duration_ms?: number;
}

// Business events
export interface BusinessEvent {
  event_type: 'sign_up' | 'subscription_started' | 'subscription_cancelled' | 'feature_usage' | 'conversion';
  subscription_tier?: 'premium' | 'pro';
  feature_name?: string;
  conversion_value?: number;
  trial_duration?: number;
}

// Privacy consent tracking
export interface ConsentEvent {
  consent_type: 'analytics' | 'marketing' | 'personalization';
  granted: boolean;
  consent_version: string;
  updated_at: number;
}

// Provider-specific configurations
export interface AnalyticsConfig {
  googleAnalytics?: {
    measurementId: string;
    enabled: boolean;
  };
  mixpanel?: {
    token: string;
    enabled: boolean;
    trackPageViews: boolean;
  };
  posthog?: {
    apiKey: string;
    host?: string;
    enabled: boolean;
    sessionRecording: boolean;
    heatmaps: boolean;
  };
  segment?: {
    writeKey: string;
    enabled: boolean;
  };
  rudderstack?: {
    writeKey: string;
    dataPlaneUrl: string;
    enabled: boolean;
  };
  customAnalytics?: {
    endpoint: string;
    enabled: boolean;
  };
  privacy: {
    respectDoNotTrack: boolean;
    anonymizeIP: boolean;
    cookieConsent: boolean;
    dataRetentionDays: number;
  };
  /** Advanced client-side controls */
  advanced?: {
    /** Inactivity threshold after which a new session id is generated (ms, default 30m) */
    sessionTimeoutMs?: number;
    /** Auto flush queued events/identifies/page views after this interval (ms) */
    autoFlushIntervalMs?: number;
    /** Additional property keys considered PII and stripped before dispatch */
    piiKeys?: string[];
    /** Automatically derive referrer + URL props if missing */
    enrichPageContext?: boolean;
    /** Automatically capture an uncaught error event */
    autoTrackErrors?: boolean;
  /** Callback invoked after every successful dispatch (mainly for testing/instrumentation) */
  onDispatch?: (event: AnalyticsEvent) => void;
  };
}

// Astrological-specific analytics
export interface AstrologyAnalytics {
  chartCalculations: {
    natal: number;
    transit: number;
    synastry: number;
    composite: number;
    solar_return: number;
  };

  aiFeatureUsage: {
    predictiveTransits: number;
    aiQuestions: number;
    multiSystemSynthesis: number;
    growthCoaching: number;
    patternRecognition: number;
  };

  userPreferences: {
    favoriteChartTypes: string[];
    preferredAstrologySystem: 'western' | 'vedic' | 'chinese';
    aiInteractionFrequency: number;
    averageSessionDuration: number;
  };
}

// Dashboard metrics
export interface DashboardMetrics {
  realTimeUsers: number;
  chartCalculationsPerMinute: number;
  aiInteractionsPerHour: number;
  mobileAppSessions: number;
  subscriptionConversions: number;
  errorRate: number;
  averageResponseTime: number;
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: Record<string, string | number | boolean>;
  users: number;
  conversionRate: number;
  averageLifetimeValue: number;
}
