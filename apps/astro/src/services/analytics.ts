/** Analytics Integration (using @cosmichub/analytics package) */
import {
  initializeAnalytics,
  createDefaultAnalyticsConfig,
  trackChartCalculation,
  trackChartView,
  trackAIInteraction,
  trackPWAInstallPrompt,
  trackPWAInstallSuccess,
  type AnalyticsConfig,
} from '@cosmichub/analytics';
import {
  featureFlags,
  analyticsProviders,
  hasAnyAnalyticsProvider,
  isDevelopment,
} from '../config/environment';

// Analytics Configuration
const analyticsConfig: AnalyticsConfig = createDefaultAnalyticsConfig({
  googleAnalytics: {
    measurementId: import.meta.env.PUBLIC_GA_MEASUREMENT_ID || '',
    enabled: !!import.meta.env.PUBLIC_GA_MEASUREMENT_ID,
  },
  mixpanel: {
    token: import.meta.env.PUBLIC_MIXPANEL_TOKEN || '',
    enabled: !!import.meta.env.PUBLIC_MIXPANEL_TOKEN,
    trackPageViews: true,
  },
  posthog: {
    apiKey: import.meta.env.PUBLIC_POSTHOG_API_KEY || '',
    host: import.meta.env.PUBLIC_POSTHOG_HOST,
    enabled: !!import.meta.env.PUBLIC_POSTHOG_API_KEY,
    sessionRecording: true,
    heatmaps: true,
  },
  customAnalytics: {
    endpoint: '/api/analytics/track',
    enabled: true,
  },
  privacy: {
    respectDoNotTrack: true,
    anonymizeIP: true,
    cookieConsent: true,
    dataRetentionDays: 365,
  },
});

// Initialize Analytics
let analytics: ReturnType<typeof initializeAnalytics> | null = null;

export const initCosmicHubAnalytics = () => {
  if (analytics) return analytics;

  if (typeof window === 'undefined') return null; // SSR guard

  if (!featureFlags.analytics) {
    if (isDevelopment()) {
      console.info('[analytics] Disabled by feature flag');
    }
    return null;
  }

  if (!hasAnyAnalyticsProvider) {
    if (isDevelopment()) {
      console.info('[analytics] No providers configured; skipping init');
    }
    return null;
  }

  analytics = initializeAnalytics(analyticsConfig);
  setupConsentManagement();
  setupPWATracking();
  if (isDevelopment()) {
    console.log('[analytics] Initialized with providers:', analyticsProviders);
  }
  return analytics;
};

// Consent Management
const setupConsentManagement = () => {
  // Check for existing consent
  const consent = localStorage.getItem('analytics-consent');
  if (consent) {
    const consentData = JSON.parse(consent);
    analytics?.setConsentGranted(consentData.granted);
  } else {
    // Show consent banner if required
    showConsentBanner();
  }
};

const showConsentBanner = () => {
  // Create and show consent banner
  const banner = document.createElement('div');
  banner.className = 'analytics-consent-banner';
  banner.innerHTML = `
    <div class="consent-content">
      <p>We use analytics to improve your experience. We respect your privacy and anonymize all data.</p>
      <div class="consent-buttons">
        <button id="accept-analytics">Accept</button>
        <button id="decline-analytics">Decline</button>
      </div>
    </div>
  `;
  
  // Style the banner
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: #1a1a1a;
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  
  document.body.appendChild(banner);
  
  // Handle consent choices
  banner.querySelector('#accept-analytics')?.addEventListener('click', () => {
    setAnalyticsConsent(true);
    banner.remove();
  });
  
  banner.querySelector('#decline-analytics')?.addEventListener('click', () => {
    setAnalyticsConsent(false);
    banner.remove();
  });
};

const setAnalyticsConsent = (granted: boolean) => {
  const consentData = {
    granted,
    timestamp: Date.now(),
    version: '1.0',
  };
  
  localStorage.setItem('analytics-consent', JSON.stringify(consentData));
  analytics?.setConsentGranted(granted);
  
  // Track consent decision
  analytics?.track({
    event: 'consent_updated',
    properties: {
      consent_type: 'analytics',
      granted,
      consent_version: '1.0',
    },
  });
};

// PWA Install Tracking
const setupPWATracking = () => {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    trackPWAInstallPrompt({
      prompt_trigger: 'automatic',
      user_action: 'ignored', // Will be updated if user interacts
      time_on_site_ms: Date.now() - ((window as unknown as { startTime?: number }).startTime ?? 0),
      page_path: window.location.pathname,
    });
  });
  
  window.addEventListener('appinstalled', () => {
    analytics?.track({
      event: 'pwa_installed',
      properties: {
        source: 'browser_prompt',
        platform: navigator.platform,
        user_agent: navigator.userAgent,
      },
    });
  });
};

// Chart Analytics Helpers
export const trackCosmicHubChartCalculation = (data: {
  chart_type: 'natal' | 'transit' | 'synastry' | 'composite' | 'solar_return';
  calculation_time_ms: number;
  success: boolean;
  error_type?: string;
  astrology_system: 'western' | 'vedic' | 'chinese';
  house_system?: string;
}) => {
  trackChartCalculation(data);
};

export const trackCosmicHubChartView = (data: {
  chart_type: string;
  user_id?: string;
  chart_id?: string;
  duration_ms?: number;
}) => {
  trackChartView(data);
};

type CoreAIInteractionFeature =
  | 'predictive_transits'
  | 'ai_questions'
  | 'multi_system_synthesis'
  | 'growth_coaching'
  | 'pattern_recognition';

// Local extended feature (we still accept ai_direct_interpretation and map it)
type ExtendedAIInteractionFeature = CoreAIInteractionFeature | 'ai_direct_interpretation';

export const trackCosmicHubAIInteraction = (data: {
  feature: ExtendedAIInteractionFeature;
  input_type: 'text' | 'voice' | 'selection';
  response_time_ms: number;
  user_satisfaction?: 1 | 2 | 3 | 4 | 5;
  tokens_used?: number;
  model_version?: string;
}) => {
  const { feature, ...rest } = data;
  const mappedFeature: CoreAIInteractionFeature =
    feature === 'ai_direct_interpretation' ? 'multi_system_synthesis' : feature;
  trackAIInteraction({ feature: mappedFeature, ...rest });
};

// Page tracking helper
export const trackPageView = (pageName: string, properties: Record<string, string | number | boolean> = {}) => {
  analytics?.page(pageName, {
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    user_type: 'authenticated', // Could be dynamic based on auth state
    ...properties,
  });
};

// User identification helper
export const identifyUser = (userId: string, traits: Record<string, string | number | boolean> = {}) => {
  analytics?.identify(userId, {
    user_id: userId,
    ...traits,
  });
};

// Export analytics instance getter
export const getCosmicHubAnalytics = () => analytics;

// Interface for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
