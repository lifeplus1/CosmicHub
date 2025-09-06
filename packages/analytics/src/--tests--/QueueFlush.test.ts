import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../AnalyticsService.js';
import type { AnalyticsConfig } from '../types/index.js';

// Minimal DOM stubs for initialization safety
// @ts-expect-error test shim
global.document = {
  head: { appendChild: () => {} },
  createElement: () => ({
    set async(v: any) {},
    src: '',
    onload: () => {},
    onerror: () => {},
  }),
  getElementsByTagName: () => [],
};
// @ts-expect-error test shim
global.window = {
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {},
};
// @ts-expect-error test shim
global.navigator = { userAgent: 'test', standalone: false };

const consentConfig: AnalyticsConfig = {
  privacy: {
    respectDoNotTrack: false,
    anonymizeIP: true,
    cookieConsent: true,
    dataRetentionDays: 30,
  },
  customAnalytics: { enabled: false, endpoint: '' },
  mixpanel: { enabled: false, token: '', trackPageViews: false },
  posthog: {
    enabled: false,
    apiKey: '',
    sessionRecording: false,
    heatmaps: false,
  },
  googleAnalytics: { enabled: false, measurementId: 'G-TEST' },
  advanced: { autoTrackErrors: false },
};

describe('Queue & consent behavior', () => {
  it('queues events and page views until consent then flushes', () => {
    const dispatched: string[] = [];
    const svc = new AnalyticsService({
      ...consentConfig,
      advanced: {
        ...consentConfig.advanced,
        onDispatch: e => dispatched.push(e.event),
      },
    });
    // consent not yet granted
    svc.track({ event: 'queued_event', properties: {} });
    svc.page('Home', { path: '/', title: 'Home' });
    expect(dispatched.length).toBe(0);
    // grant
    svc.setConsentGranted(true);
    expect(dispatched).toContain('queued_event');
  });
});
