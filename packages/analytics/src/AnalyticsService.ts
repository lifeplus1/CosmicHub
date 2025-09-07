/**
 * Core Analytics Service
 * Multi-provider analytics with privacy compliance
 * 
 * @fileoverview Privacy-first analytics service supporting multiple providers
 * with comprehensive error handling, caching, and consent management.
 * 
 * @version 1.0.0
 * @author CosmicHub Team
 * @since 2025-09-06
 */

import type {
  AnalyticsEvent,
  UserTraits,
  PageProperties,
  AnalyticsConfig,
  Platform,
} from './types/index';

// Constants for better maintainability
const DEFAULT_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_PII_KEYS = ['email', 'ip', 'ip_address', 'full_name'] as const;
const PERFORMANCE_TIMING_EVENT = 'perf_timing' as const;
const APP_ERROR_EVENT = 'app_error' as const;
const PAGE_VIEW_EVENT = 'Page View' as const;
const POSTHOG_PAGEVIEW_EVENT = '$pageview' as const;

// Minimal runtime interfaces for third-party analytics libraries we load dynamically.
// These purposely model only the subset of methods we actually invoke to keep typing tight.
interface MixpanelPeople {
  set?(props: Record<string, unknown>): void;
}
interface Mixpanel {
  init(
    token: string | undefined,
    options?: {
      track_pageview?: boolean;
      persistence?: string;
      secure_cookie?: boolean;
      ip?: boolean;
    }
  ): void;
  track?(event: string, properties?: Record<string, unknown>): void;
  identify?(id: string): void;
  people?: MixpanelPeople;
  reset?(): void;
}

interface PostHog {
  init(
    apiKey: string | undefined,
    options?: {
      api_host?: string;
      disable_session_recording?: boolean;
      autocapture?: boolean;
    }
  ): void;
  capture?(event: string, properties?: Record<string, unknown>): void;
  identify?(id: string, properties?: Record<string, unknown>): void;
  reset?(): void;
}
// Minimal Segment & RudderStack shims
interface SegmentAnalytics {
  load?(key: string): void;
  identify?(id: string, traits?: Record<string, unknown>): void;
  page?(name?: string, properties?: Record<string, unknown>): void;
  track?(event: string, properties?: Record<string, unknown>): void;
}

// Define global types for analytics providers
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    doNotTrack?: string;
    mixpanel?: Mixpanel;
    posthog?: PostHog;
    analytics?: SegmentAnalytics; // Segment global
    rudderanalytics?: SegmentAnalytics; // RudderStack global (similar surface)
  }

  interface Navigator {
    msDoNotTrack?: string;
    standalone?: boolean;
  }
}

/**
 * Comprehensive Analytics Service
 * 
 * Provides privacy-compliant analytics with multi-provider support,
 * comprehensive error handling, and robust consent management.
 * 
 * @example
 * ```typescript
 * const analytics = new AnalyticsService({
 *   googleAnalytics: { measurementId: 'GA-123', enabled: true },
 *   privacy: { respectDoNotTrack: true, anonymizeIP: true, cookieConsent: true }
 * });
 * 
 * analytics.track({ event: 'user_action', properties: { action: 'click' }});
 * ```
 */
export class AnalyticsService {
  private config: AnalyticsConfig;
  private isInitialized = false;
  private sessionId: string;
  private consentGranted = false;
  private lastEventTs: number | null = null;
  private flushTimer: number | null = null;
  private globalErrorHandler: ((e: ErrorEvent) => void) | null = null;
  private _cachedPlatform: Platform | null = null; // Cache platform detection

  // Queues for deferred operations until consent + init
  private pendingEvents: AnalyticsEvent[] = [];
  private pendingIdentifies: { userId: string; traits: UserTraits }[] = [];
  private pendingPageViews: { name: string; properties: PageProperties }[] = [];

  // Script load cache
  private static scriptPromises: Record<string, Promise<void>> = {};

  /**
   * Initialize the Analytics Service
   * 
   * @param config - Analytics configuration object
   * @throws {Error} When configuration is invalid
   */
  constructor(config: AnalyticsConfig) {
    this.validateConfig(config);
    this.config = config;
    this.sessionId = this.generateSessionId();
    if (!config.privacy.cookieConsent) {
      // Policy: no explicit cookie consent required, enable immediately
      this.consentGranted = true;
      this.initialize();
    }
    this.maybeInstallGlobalErrorHandler();
    this.maybeStartAutoFlush();
  }

  /**
   * Validate analytics configuration
   * 
   * @private
   * @param config - Configuration to validate
   * @throws {Error} When configuration is invalid
   */
  private validateConfig(config: AnalyticsConfig): void {
    if (!config) {
      throw new Error('Analytics configuration is required');
    }
    
    if (!config.privacy) {
      throw new Error('Privacy configuration is required');
    }
    
    // Validate provider configurations
    if (config.googleAnalytics?.enabled && !config.googleAnalytics.measurementId) {
      throw new Error('Google Analytics measurement ID is required when enabled');
    }
    
    if (config.mixpanel?.enabled && !config.mixpanel.token) {
      throw new Error('Mixpanel token is required when enabled');
    }
    
    if (config.posthog?.enabled && !config.posthog.apiKey) {
      throw new Error('PostHog API key is required when enabled');
    }
    
    if (config.segment?.enabled && !config.segment.writeKey) {
      throw new Error('Segment write key is required when enabled');
    }
    
    if (config.rudderstack?.enabled && (!config.rudderstack.writeKey || !config.rudderstack.dataPlaneUrl)) {
      throw new Error('RudderStack write key and data plane URL are required when enabled');
    }
  }

  /**
   * Initialize all analytics providers
   * 
   * @private
   */
  private initialize(): void {
    if (this.isInitialized) return;
    // Avoid touching window/document in SSR environments
    if (!this.canUseDOM()) {
      return; // Will initialize on client instantiation
    }

    if (this.config.privacy.respectDoNotTrack && this.isDNTEnabled()) {
      console.info('Analytics disabled due to Do Not Track');
      return;
    }

    try {
      this.initializeGoogleAnalytics();
      void this.initializeMixpanel().catch(err => 
        console.warn('Failed to initialize Mixpanel:', err)
      );
      void this.initializePostHog().catch(err => 
        console.warn('Failed to initialize PostHog:', err)
      );
      void this.initializeSegment().catch(err => 
        console.warn('Failed to initialize Segment:', err)
      );
      void this.initializeRudderStack().catch(err => 
        console.warn('Failed to initialize RudderStack:', err)
      );
      this.isInitialized = true;
      this.flushQueuesIfReady();
    } catch (err) {
      console.error('Failed to initialize analytics service:', err);
      // Set initialized to prevent retry loops
      this.isInitialized = true;
    }
  }

  private canUseDOM(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  private isDNTEnabled(): boolean {
    return (
      navigator.doNotTrack === '1' ||
      window.doNotTrack === '1' ||
      navigator.msDoNotTrack === '1'
    );
  }

  private maybeStartAutoFlush(): void {
    const interval = this.config.advanced?.autoFlushIntervalMs;
    // Disable background interval in non-browser or test environments to avoid hanging processes
    const isTest =
      typeof process !== 'undefined' &&
      process.env &&
      process.env.NODE_ENV === 'test';
    if (!interval || typeof window === 'undefined' || isTest) return;
    if (this.flushTimer && this.canUseDOM())
      window.clearInterval(this.flushTimer);
    const handle = (globalThis.setInterval ?? window.setInterval)(
      () => this.flushQueuesIfReady(),
      interval
    ) as unknown as { unref?: () => void };
    // Allow Node to exit naturally if supported (no-op in browsers)
    try {
      handle.unref?.();
    } catch {
      /* ignore */
    }
    // Store numeric id fallback if DOM typing; we just need to clear via clearInterval later
    this.flushTimer = handle as unknown as number;
  }

  private maybeInstallGlobalErrorHandler(): void {
    if (!this.config.advanced?.autoTrackErrors || typeof window === 'undefined')
      return;
    // Remove existing handler if reinitializing
    if (this.globalErrorHandler) {
      try {
        window.removeEventListener('error', this.globalErrorHandler);
      } catch {
        /* ignore */
      }
    }
    this.globalErrorHandler = (event: ErrorEvent) => {
      this.trackError('uncaught_error', event.error ?? event.message);
    };
    window.addEventListener('error', this.globalErrorHandler);
  }

  private initializeGoogleAnalytics(): void {
    if (!this.config.googleAnalytics?.enabled) return;
    if (typeof document === 'undefined') return; // SSR / test guard

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    }

    gtag('js', new Date());
    gtag('config', this.config.googleAnalytics.measurementId, {
      anonymize_ip: this.config.privacy.anonymizeIP,
      cookie_flags: 'secure;samesite=strict',
    });
    window.gtag = gtag;
  }

  private async initializeMixpanel(): Promise<void> {
    if (!this.config.mixpanel?.enabled) return;
    try {
      await this.loadScriptOnce(
        'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min'
      );
      const mixpanel = window.mixpanel;
      mixpanel?.init?.(this.config.mixpanel?.token, {
        track_pageview: this.config.mixpanel?.trackPageViews,
        persistence: 'localStorage',
        secure_cookie: true,
        ip: !this.config.privacy.anonymizeIP,
      });
      this.flushQueuesIfReady();
    } catch (e) {
      console.warn('Failed to load Mixpanel:', e);
    }
  }

  private async initializePostHog(): Promise<void> {
    if (!this.config.posthog?.enabled) return;
    try {
      await this.loadScriptOnce('https://app.posthog.com/static/array.js');
      const posthog = window.posthog;
      posthog?.init?.(this.config.posthog?.apiKey, {
        api_host: this.config.posthog?.host ?? 'https://app.posthog.com',
        disable_session_recording: !this.config.posthog?.sessionRecording,
        autocapture: false,
      });
      this.flushQueuesIfReady();
    } catch (e) {
      console.warn('Failed to load PostHog:', e);
    }
  }

  private async initializeSegment(): Promise<void> {
    if (!this.config.segment?.enabled) return;
    try {
      await this.loadScriptOnce(
        'https://cdn.segment.com/analytics.js/v1/' +
          this.config.segment.writeKey +
          '/analytics.min'
      );
      // Segment auto initializes via snippet; no explicit load call needed if CDN includes key path
      this.flushQueuesIfReady();
    } catch (e) {
      console.warn('Failed to load Segment:', e);
    }
  }

  private async initializeRudderStack(): Promise<void> {
    if (!this.config.rudderstack?.enabled) return;
    try {
      await this.loadScriptOnce(
        this.config.rudderstack.dataPlaneUrl.replace(/\/$/, '') +
          '/rudder-analytics.min'
      );
      // RudderStack usually requires load(writeKey, dataPlaneUrl)
      // RudderStack typical snippet: rudderanalytics.load(WRITE_KEY, DATA_PLANE_URL)
      const ra: SegmentAnalytics | undefined = window.rudderanalytics;
      if (ra && typeof ra.load === 'function') {
        try {
          // Prefer two-arg form if function length suggests support
          if (ra.load.length >= 2) {
            (ra.load as unknown as (w: string, u: string) => void)(
              this.config.rudderstack.writeKey,
              this.config.rudderstack.dataPlaneUrl
            );
          } else {
            // If single-arg variant, pass just writeKey (common alt snippet) and rely on dataPlaneUrl from script include
            (ra.load as unknown as (w: string) => void)(
              this.config.rudderstack.writeKey
            );
          }
        } catch {
          /* noop */
        }
      }
      this.flushQueuesIfReady();
    } catch (e) {
      console.warn('Failed to load RudderStack:', e);
    }
  }

  /**
   * Set user consent for analytics tracking
   * 
   * @param granted - Whether consent has been granted
   * @example
   * ```typescript
   * analytics.setConsentGranted(true); // Enable tracking
   * analytics.setConsentGranted(false); // Disable tracking
   * ```
   */
  public setConsentGranted(granted: boolean): void {
    this.consentGranted = granted;
    if (granted && !this.isInitialized) this.initialize();
    if (granted) this.flushQueuesIfReady();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Detect the current platform with caching for performance
   * 
   * @private
   * @returns Platform type (web, mobile, pwa)
   */
  private getPlatform(): Platform {
    if (this._cachedPlatform) {
      return this._cachedPlatform;
    }

    if (typeof window === 'undefined') {
      this._cachedPlatform = 'web';
      return this._cachedPlatform;
    }

    // Check if it's a PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone
    ) {
      this._cachedPlatform = 'pwa';
      return this._cachedPlatform;
    }

    // Check if it's mobile
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this._cachedPlatform = 'mobile';
      return this._cachedPlatform;
    }

    this._cachedPlatform = 'web';
    return this._cachedPlatform;
  }

  /**
   * Track a custom analytics event
   * 
   * @param event - Event data (excluding session_id, timestamp, platform which are auto-added)
   * @example
   * ```typescript
   * analytics.track({
   *   event: 'chart_calculated',
   *   properties: {
   *     chart_type: 'natal',
   *     calculation_time_ms: 145,
   *     success: true
   *   }
   * });
   * ```
   */
  public track(
    event: Omit<AnalyticsEvent, 'session_id' | 'timestamp' | 'platform'>
  ): void {
    if (!this.canUseDOM()) return; // Skip on server
    
    // Input validation
    if (!event || typeof event !== 'object') {
      console.warn('Analytics: Invalid event object provided');
      return;
    }
    
    if (!event.event || typeof event.event !== 'string') {
      console.warn('Analytics: Event name is required and must be a string');
      return;
    }
    
    this.ensureSessionFresh();
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      session_id: this.sessionId,
      timestamp: Date.now(),
      platform: this.getPlatform(),
    };

    if (!this.isTrackingEnabled()) {
      this.pendingEvents.push(analyticsEvent);
      return;
    }
    this.lastEventTs = analyticsEvent.timestamp;
    this.dispatchEvent(this.sanitizeEvent(analyticsEvent));
  }

  private dispatchEvent(analyticsEvent: AnalyticsEvent): void {
    if (!this.canUseDOM()) return;
    // Defensive: ignore empty event names
    if (!analyticsEvent.event) return;
    // Google Analytics
    if (
      this.config.googleAnalytics?.enabled &&
      this.isInitialized &&
      window.gtag
    ) {
      window.gtag('event', analyticsEvent.event, {
        event_category: 'engagement',
        event_label: JSON.stringify(analyticsEvent.properties),
        ...analyticsEvent.properties,
      });
    }

    // Mixpanel
    if (this.config.mixpanel?.enabled && this.isInitialized) {
      window.mixpanel?.track?.(analyticsEvent.event, {
        ...analyticsEvent.properties,
        session_id: analyticsEvent.session_id,
        platform: analyticsEvent.platform,
      });
    }

    // PostHog
    if (this.config.posthog?.enabled && this.isInitialized) {
      window.posthog?.capture?.(analyticsEvent.event, {
        ...analyticsEvent.properties,
        session_id: analyticsEvent.session_id,
        platform: analyticsEvent.platform,
      });
    }

    // Segment
    if (this.config.segment?.enabled && this.isInitialized) {
      window.analytics?.track?.(analyticsEvent.event, {
        ...analyticsEvent.properties,
        session_id: analyticsEvent.session_id,
        platform: analyticsEvent.platform,
      });
    }

    // RudderStack
    if (this.config.rudderstack?.enabled && this.isInitialized) {
      const ra: SegmentAnalytics | undefined = window.rudderanalytics;
      ra?.track?.(analyticsEvent.event, {
        ...analyticsEvent.properties,
        session_id: analyticsEvent.session_id,
        platform: analyticsEvent.platform,
      });
    }

    if (this.config.customAnalytics?.enabled)
      void this.sendToCustomAnalytics(analyticsEvent);
    // Invoke instrumentation callback last (non-blocking semantics expected)
    try {
      this.config.advanced?.onDispatch?.(analyticsEvent);
    } catch {
      /* swallow */
    }
  }

  /**
   * Gracefully stop background timers and global handlers
   * Call this method when destroying the analytics instance to prevent memory leaks
   * 
   * @example
   * ```typescript
   * // During app teardown or component unmount
   * analytics.shutdown();
   * ```
   */
  public shutdown(): void {
    // Clear any pending timers
    if (this.flushTimer && this.canUseDOM()) {
      try {
        window.clearInterval(this.flushTimer);
      } catch {
        /* ignore */
      }
      this.flushTimer = null;
    }
    
    // Remove global error handler
    if (this.globalErrorHandler && this.canUseDOM()) {
      try {
        window.removeEventListener('error', this.globalErrorHandler);
      } catch {
        /* ignore */
      }
      this.globalErrorHandler = null;
    }
    
    // Clear pending queues to free memory
    this.pendingEvents.length = 0;
    this.pendingIdentifies.length = 0;
    this.pendingPageViews.length = 0;
    
    // Reset cached platform
    this._cachedPlatform = null;
    
    this.isInitialized = false;
    this.consentGranted = false;
  }

  private sanitizeEvent(e: AnalyticsEvent): AnalyticsEvent {
    // Clone shallow to avoid mutating caller object
    const props = { ...e.properties } as Record<
      string,
      string | number | boolean | null
    >;
    const extra = this.config.advanced?.piiKeys ?? [];
    for (const key of [...DEFAULT_PII_KEYS, ...extra]) {
      if (key in props) {
        if (key === 'email' && typeof props[key] === 'string') {
          const val = props[key];
          if (typeof val === 'string' && val.includes('@'))
            props['email_domain'] = val.split('@')[1] ?? '';
        }
        delete props[key];
      }
    }
    if (this.config.privacy.anonymizeIP && 'ip_hash' in props)
      delete props['ip_hash'];
    return { ...e, properties: props };
  }

  private ensureSessionFresh(): void {
    const timeout = this.config.advanced?.sessionTimeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS;
    if (this.lastEventTs && Date.now() - this.lastEventTs > timeout) {
      this.sessionId = this.generateSessionId();
    }
  }

  /**
   * Measure performance of a function or promise and emit timing event
   * 
   * @param name - Name/label for the timing metric
   * @param fn - Function or promise to measure
   * @param extra - Additional properties to include in the timing event
   * @returns Promise with the result of the measured function
   * 
   * @example
   * ```typescript
   * const chartData = await analytics.withTiming(
   *   'chart_calculation', 
   *   () => calculateNatalChart(birthData),
   *   { chart_type: 'natal', user_id: '123' }
   * );
   * ```
   */
  public async withTiming<T>(
    name: string,
    fn: () => Promise<T> | T,
    extra?: Record<string, unknown>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.track({
        event: PERFORMANCE_TIMING_EVENT,
        properties: {
          label: name,
          duration_ms: Math.round(duration),
          success: true,
          ...(extra ?? {}),
        },
      });
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      this.track({
        event: PERFORMANCE_TIMING_EVENT,
        properties: {
          label: name,
          duration_ms: Math.round(duration),
          success: false,
          error_type: (err as Error).name,
        },
      });
      throw err;
    }
  }

  /**
   * Track application errors for monitoring and debugging
   * 
   * @param name - Error name/category 
   * @param error - Error object or message
   * @param extra - Additional context properties
   * 
   * @example
   * ```typescript
   * try {
   *   await calculateChart(data);
   * } catch (error) {
   *   analytics.trackError('chart_calculation_failed', error, {
   *     chart_type: 'natal',
   *     user_id: '123'
   *   });
   * }
   * ```
   */
  public trackError(
    name: string,
    error: unknown,
    extra?: Record<string, unknown>
  ): void {
    const err = error instanceof Error ? error : new Error(String(error));
    this.track({
      event: APP_ERROR_EVENT,
      properties: {
        name,
        message: err.message.slice(0, 500),
        error_type: err.name,
        stack_present: !!err.stack,
        ...(extra ?? {}),
      },
    });
  }

  /**
   * Identify a user with traits for personalization and segmentation
   * 
   * @param userId - Unique user identifier
   * @param traits - User characteristics and preferences
   * 
   * @example
   * ```typescript
   * analytics.identify('user_123', {
   *   subscription_tier: 'premium',
   *   astrology_system: 'western',
   *   created_at: Date.now()
   * });
   * ```
   */
  public identify(userId: string, traits: UserTraits): void {
    if (!this.canUseDOM()) return;
    
    // Input validation
    if (!userId || typeof userId !== 'string') {
      console.warn('Analytics: User ID is required and must be a string');
      return;
    }
    
    if (!traits || typeof traits !== 'object') {
      console.warn('Analytics: User traits must be an object');
      return;
    }
    
    if (!this.isTrackingEnabled()) {
      this.pendingIdentifies.push({ userId, traits });
      return;
    }

    // Identify with Mixpanel
    if (this.config.mixpanel?.enabled && this.isInitialized) {
      const mixpanel = window.mixpanel;
      if (mixpanel?.identify) {
        mixpanel.identify(userId);
      }
      mixpanel?.people?.set?.(traits as Record<string, unknown>);
    }

    // Identify with PostHog
    if (this.config.posthog?.enabled && this.isInitialized) {
      const posthog = window.posthog;
      posthog?.identify?.(userId, traits as Record<string, unknown>);
    }

    if (this.config.segment?.enabled && this.isInitialized) {
      const seg = window.analytics;
      if (seg && typeof seg.identify === 'function') {
        try {
          (
            seg.identify as unknown as (
              id: string,
              t: Record<string, unknown>
            ) => void
          )(userId, traits as Record<string, unknown>);
        } catch {
          /* noop */
        }
      }
    }

    if (this.config.rudderstack?.enabled && this.isInitialized) {
      const ra: SegmentAnalytics | undefined = window.rudderanalytics;
      ra?.identify?.(userId, traits as Record<string, unknown>);
    }

    // Set user ID for Google Analytics
    if (
      this.config.googleAnalytics?.enabled &&
      this.isInitialized &&
      window.gtag
    ) {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        user_id: userId,
      });
    }
  }

  /**
   * Track page views for navigation analytics
   * 
   * @param name - Page name or route
   * @param properties - Page-specific properties (path, title, etc.)
   * 
   * @example
   * ```typescript
   * analytics.page('Natal Chart', {
   *   path: '/charts/natal',
   *   title: 'Natal Chart - CosmicHub',
   *   user_type: 'authenticated'
   * });
   * ```
   */
  public page(name: string, properties: PageProperties): void {
    if (!this.canUseDOM()) return;
    if (!this.isTrackingEnabled()) {
      this.pendingPageViews.push({ name, properties });
      return;
    }
    if (this.config.advanced?.enrichPageContext) {
      properties = {
        ...properties,
        path: properties.path ?? window.location.pathname,
        title: properties.title ?? document.title,
        referrer: properties.referrer ?? (document.referrer || undefined),
      } as PageProperties;
    }

    // Track page view with Google Analytics
    if (
      this.config.googleAnalytics?.enabled &&
      this.isInitialized &&
      window.gtag
    ) {
      window.gtag('config', this.config.googleAnalytics.measurementId, {
        page_title: properties.title,
        page_location: properties.path,
      });
    }

    // Track page view with Mixpanel
    if (
      this.config.mixpanel?.enabled &&
      this.isInitialized &&
      this.config.mixpanel.trackPageViews
    ) {
      const mixpanel = window.mixpanel;
      mixpanel?.track?.(PAGE_VIEW_EVENT, {
        page_name: name,
        ...properties,
      });
    }

    // Track page view with PostHog
    if (this.config.posthog?.enabled && this.isInitialized) {
      const posthog = window.posthog;
      posthog?.capture?.(POSTHOG_PAGEVIEW_EVENT, {
        $current_url: properties.path,
        page_name: name,
        ...properties,
      });
    }

    if (this.config.segment?.enabled && this.isInitialized) {
      const seg = window.analytics;
      if (seg && typeof seg.page === 'function') {
        try {
          (
            seg.page as unknown as (
              n?: string,
              p?: Record<string, unknown>
            ) => void
          )(name, { ...properties });
        } catch {
          /* noop */
        }
      }
    }

    if (this.config.rudderstack?.enabled && this.isInitialized) {
      const ra: SegmentAnalytics | undefined = window.rudderanalytics;
      ra?.page?.(name, { ...properties });
    }
  }

  private async sendToCustomAnalytics(event: AnalyticsEvent): Promise<void> {
    if (!this.config.customAnalytics?.endpoint) return;

    try {
      await fetch(this.config.customAnalytics.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send custom analytics:', error);
    }
  }

  public reset(): void {
    this.sessionId = this.generateSessionId();
    this.lastEventTs = null;
    if (this.flushTimer && this.canUseDOM()) {
      window.clearInterval(this.flushTimer);
      this.flushTimer = null;
      this.maybeStartAutoFlush();
    }

    if (this.config.mixpanel?.enabled) {
      const mixpanel = window.mixpanel;
      mixpanel?.reset?.();
    }

    if (this.config.posthog?.enabled) {
      const posthog = window.posthog;
      posthog?.reset?.();
    }
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public isTrackingEnabled(): boolean {
    return this.consentGranted || !this.config.privacy.cookieConsent;
  }

  /** Manually flush queued operations regardless of consent (if tracking becomes enabled afterward). */
  public flush(): void {
    this.flushQueuesIfReady();
  }

  /** Temporarily disable tracking (opt-out runtime). */
  public disable(): void {
    this.consentGranted = false;
  }

  /** Re-enable tracking (only applies if consent not required or already granted). */
  public enable(): void {
    if (!this.config.privacy.cookieConsent || this.consentGranted)
      this.initialize();
  }

  // ==== Internal queue helpers ====
  private async loadScriptOnce(src: string): Promise<void> {
    if (AnalyticsService.scriptPromises[src]) {
      return await AnalyticsService.scriptPromises[src];
    }
    AnalyticsService.scriptPromises[src] = new Promise<void>(
      (resolve, reject) => {
        try {
          if (typeof document === 'undefined') {
            resolve();
            return;
          }
          const existing = Array.from(
            document.getElementsByTagName('script')
          ).find(s => s.src === src);
          if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () =>
              reject(new Error(`Script failed: ${src}`))
            );
            return;
          }
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Script failed: ${src}`));
          document.head.appendChild(script);
        } catch (e) {
          reject(e as Error);
        }
      }
    );
    return AnalyticsService.scriptPromises[src];
  }

  private flushQueuesIfReady(): void {
    if (!this.isTrackingEnabled()) return;
    if (this.pendingEvents.length) {
      const events = [...this.pendingEvents];
      this.pendingEvents.length = 0;
      events.forEach(e => this.dispatchEvent(this.sanitizeEvent(e)));
    }
    if (this.pendingIdentifies.length) {
      const arr = [...this.pendingIdentifies];
      this.pendingIdentifies.length = 0;
      arr.forEach(i => this.identify(i.userId, i.traits));
    }
    if (this.pendingPageViews.length) {
      const pages = [...this.pendingPageViews];
      this.pendingPageViews.length = 0;
      pages.forEach(p => this.page(p.name, p.properties));
    }
  }
}

// Singleton instance
let analyticsInstance: AnalyticsService | null = null;

export const initializeAnalytics = (
  config: AnalyticsConfig
): AnalyticsService => {
  analyticsInstance = new AnalyticsService(config);
  return analyticsInstance;
};

export const getAnalytics = (): AnalyticsService | null => {
  return analyticsInstance;
};

export * from './types/index';
