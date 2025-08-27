import { describe, it, expect, vi, beforeAll } from 'vitest';
import { AnalyticsService } from '../AnalyticsService.js';
import type { AnalyticsConfig } from '../types/index.js';

const baseConfig: AnalyticsConfig = {
  privacy: { respectDoNotTrack: false, anonymizeIP: true, cookieConsent: false, dataRetentionDays: 30 },
  customAnalytics: { enabled: false, endpoint: '' },
  mixpanel: { enabled: false, token: '', trackPageViews: false },
  posthog: { enabled: false, apiKey: '', sessionRecording: false, heatmaps: false },
  googleAnalytics: { enabled: false, measurementId: 'UA-TEST' },
  advanced: { sessionTimeoutMs: 10, autoTrackErrors: false }
};

// Minimal DOM / browser shims so service can run in node test env
beforeAll(() => {
  if (!(globalThis as any).window) {
    (globalThis as any).window = globalThis as any;
  }
  const win: any = (globalThis as any).window;
  win.addEventListener = win.addEventListener || (() => {});
  win.removeEventListener = win.removeEventListener || (() => {});
  win.setInterval = win.setInterval || setInterval;
  win.clearInterval = win.clearInterval || clearInterval;
  if (!(globalThis as any).document) {
    (globalThis as any).document = {
      title: 'TestDoc',
      referrer: '',
      head: { appendChild: () => {} },
      createElement: (tag: string) => ({
        tagName: tag.toUpperCase(),
        async: false,
        src: '',
        onload: null as any,
        onerror: null as any,
        addEventListener: function (_ev: string, cb: any) { if (_ev === 'load' && typeof cb === 'function') { /* no-op */ } },
      }),
      getElementsByTagName: () => [],
    } as any;
  }
  if (!(globalThis as any).navigator) {
    (globalThis as any).navigator = { userAgent: 'test', standalone: false } as any;
  }
  if (!(globalThis as any).location) {
    (globalThis as any).location = { pathname: '/', href: 'http://localhost/' } as any;
  }
  if (!(globalThis as any).performance) {
    (globalThis as any).performance = { now: () => Date.now() } as any;
  }
  if (!(globalThis as any).window.matchMedia) {
    (globalThis as any).window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
  }
});

describe('AnalyticsService (core)', () => {
  it('sanitizes PII and extracts email domain', () => {
    const events: any[] = [];
    const svc = new AnalyticsService({
      ...baseConfig,
      advanced: { ...baseConfig.advanced, onDispatch: (e) => events.push(e) }
    });
    svc.track({ event: 'test', properties: { email: 'user@example.com', ip_address: '1.1.1.1', safe: 'ok' } });
    expect(events.length).toBe(1);
    const props = events[0].properties;
    expect(props.email).toBeUndefined();
    expect(props.ip_address).toBeUndefined();
    expect(props.email_domain).toBe('example.com');
    expect(props.safe).toBe('ok');
  });

  it('renews session after inactivity threshold', () => {
    const events: any[] = [];
    const svc: any = new AnalyticsService({
      ...baseConfig,
      advanced: { ...baseConfig.advanced, sessionTimeoutMs: 5, onDispatch: (e) => events.push(e) }
    });
    const first = svc.getSessionId();
    svc.track({ event: 'evt1', properties: {} });
    // Simulate inactivity by manipulating lastEventTs
    svc.lastEventTs = Date.now() - 10;
    svc.track({ event: 'evt2', properties: {} });
    const second = svc.getSessionId();
    expect(second).not.toEqual(first);
    expect(events.length).toBe(2);
  });

  it('withTiming emits perf_timing event on success and failure', async () => {
    const names: string[] = [];
    const svc = new AnalyticsService({
      ...baseConfig,
      advanced: { ...baseConfig.advanced, onDispatch: (e) => names.push(e.event) }
    });
    await svc.withTiming('okOp', async () => 42);
    expect(names).toContain('perf_timing');
    await expect(svc.withTiming('failOp', async () => { throw new Error('boom'); })).rejects.toThrow('boom');
    const perfEvents = names.filter(n => n === 'perf_timing');
    expect(perfEvents.length).toBeGreaterThanOrEqual(2);
  });

  it('trackError emits app_error event', () => {
    const events: string[] = [];
    const svc = new AnalyticsService({
      ...baseConfig,
      advanced: { ...baseConfig.advanced, onDispatch: (e) => events.push(e.event) }
    });
    svc.trackError('x', new Error('fail'));
    expect(events).toContain('app_error');
  });
});

describe('AnalyticsService (providers & queues)', () => {
  it('flushes queued events/identify/page on consent grant', () => {
    const events: any[] = [];
    const svc: any = new AnalyticsService({
      ...baseConfig,
      privacy: { ...baseConfig.privacy, cookieConsent: true },
      advanced: { ...baseConfig.advanced, onDispatch: (e) => events.push(e) }
    });
    svc.track({ event: 'queued_evt', properties: { a: 1 } });
    svc.identify('user123', { subscription_tier: 'premium' });
    svc.page('Home', { path: '/', title: 'Home' });
    // Should be queued (not dispatched yet)
    expect(events.length).toBe(0);
    svc.setConsentGranted(true);
    expect(events.map(e => e.event)).toContain('queued_evt');
  });

  it('dispatches Segment track with enriched properties', () => {
    window.analytics = { track: vi.fn(), identify: vi.fn(), page: vi.fn() } as any;
    const svc = new AnalyticsService({
      ...baseConfig,
      segment: { enabled: true, writeKey: 'SEG_KEY' },
      advanced: { ...baseConfig.advanced, onDispatch: vi.fn() }
    });
    svc.track({ event: 'seg_evt', properties: { foo: 'bar' } });
    expect(window.analytics.track).toHaveBeenCalledTimes(1);
    const [evtName, props] = (window.analytics.track as any).mock.calls[0];
    expect(evtName).toBe('seg_evt');
    expect(props.foo).toBe('bar');
    expect(props.session_id).toBeDefined();
    expect(props.platform).toBeDefined();
  });

  it('dispatches RudderStack track', () => {
    const trackFn = vi.fn();
    const loadFn = vi.fn();
    // length 2 load signature to take two args if invoked
    Object.defineProperty(loadFn, 'length', { value: 2 });
  window.rudderanalytics = { track: trackFn, identify: vi.fn(), page: vi.fn(), load: loadFn } as any;
    const svc = new AnalyticsService({
      ...baseConfig,
      rudderstack: { enabled: true, writeKey: 'RS_KEY', dataPlaneUrl: 'https://rs.dataplane' },
      advanced: { ...baseConfig.advanced }
    });
    svc.track({ event: 'rs_evt', properties: { foo: 'bar' } });
    expect(trackFn).toHaveBeenCalledTimes(1);
    const [evtName, props] = trackFn.mock.calls[0];
    expect(evtName).toBe('rs_evt');
    expect(props.foo).toBe('bar');
    expect(props.session_id).toBeDefined();
  });

  it('enriches page context when enabled', () => {
    window.analytics = { track: vi.fn(), identify: vi.fn(), page: vi.fn() } as any;
    document.title = 'DocTitle';
    const svc: any = new AnalyticsService({
      ...baseConfig,
      segment: { enabled: true, writeKey: 'SEG_KEY' },
      advanced: { ...baseConfig.advanced, enrichPageContext: true }
    });
    svc.page('Home', {} as any); // supply empty and let enrichment fill
    expect(window.analytics.page).toHaveBeenCalledTimes(1);
    const [name, props] = (window.analytics.page as any).mock.calls[0];
    expect(name).toBe('Home');
    expect(props.path).toBe(window.location.pathname);
    expect(props.title).toBe('DocTitle');
  });

  it('identify dispatches to Mixpanel (identify + people.set)', () => {
    window.mixpanel = { identify: vi.fn(), people: { set: vi.fn() } } as any;
    const svc = new AnalyticsService({
      ...baseConfig,
      mixpanel: { enabled: true, token: 'MIX', trackPageViews: false }
    });
    svc.identify('mx-user', { subscription_tier: 'premium' });
  expect((window as any).mixpanel.identify).toHaveBeenCalledWith('mx-user');
  expect((window as any).mixpanel.people.set).toHaveBeenCalled();
  });

  it('identify dispatches to PostHog', () => {
    window.posthog = { identify: vi.fn(), capture: vi.fn() } as any;
    const svc = new AnalyticsService({
      ...baseConfig,
      posthog: { enabled: true, apiKey: 'PH', sessionRecording: false, heatmaps: false }
    });
    svc.identify('ph-user', { subscription_tier: 'pro' });
  expect((window as any).posthog.identify).toHaveBeenCalledWith('ph-user', expect.any(Object));
  });

  it('identify dispatches to Segment', () => {
    window.analytics = { identify: vi.fn(), track: vi.fn(), page: vi.fn() } as any;
    const svc = new AnalyticsService({
      ...baseConfig,
      segment: { enabled: true, writeKey: 'SEG' }
    });
    svc.identify('seg-user', { subscription_tier: 'free' });
    expect(window.analytics.identify).toHaveBeenCalledWith('seg-user', expect.any(Object));
  });

  it('identify dispatches to RudderStack', () => {
    window.rudderanalytics = { identify: vi.fn(), track: vi.fn(), page: vi.fn(), load: vi.fn() } as any;
    const svc = new AnalyticsService({
      ...baseConfig,
      rudderstack: { enabled: true, writeKey: 'RS', dataPlaneUrl: 'https://rs.dataplane' }
    });
    svc.identify('rs-user', { subscription_tier: 'premium' });
  expect((window as any).rudderanalytics.identify).toHaveBeenCalledWith('rs-user', expect.any(Object));
  });

  it('auto error listener captures uncaught errors when enabled', () => {
    const events: any[] = [];
    const originalAdd = window.addEventListener;
    let errorHandler: any;
    window.addEventListener = ((type: string, handler: any) => {
      if (type === 'error') errorHandler = handler;
    }) as any;
    const svc = new AnalyticsService({
      ...baseConfig,
      advanced: { ...baseConfig.advanced, autoTrackErrors: true, onDispatch: (e) => events.push(e) }
    });
    const err = new Error('UnhandledBoom');
    errorHandler({ error: err, message: err.message });
    expect(events.some(e => e.event === 'app_error' && e.properties.name === 'uncaught_error')).toBe(true);
    window.addEventListener = originalAdd; // restore
    void svc; // silence unused
  });
});