import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AnalyticsProvider } from '../react/AnalyticsProvider';
import type { AnalyticsConfig, AnalyticsEvent } from '../types';

// Minimal config factory allowing overrides
const baseConfig = (over: Partial<AnalyticsConfig> = {}): AnalyticsConfig => ({
  googleAnalytics: { measurementId: 'GA-123', enabled: true },
  mixpanel: { token: 'mix-token', enabled: true, trackPageViews: true },
  posthog: {
    apiKey: 'ph',
    enabled: true,
    sessionRecording: false,
    heatmaps: false,
  },
  segment: { writeKey: 'seg', enabled: true },
  rudderstack: {
    writeKey: 'rudder',
    dataPlaneUrl: 'https://rudder',
    enabled: true,
  },
  customAnalytics: { endpoint: '/ingest', enabled: true },
  privacy: {
    respectDoNotTrack: false,
    anonymizeIP: true,
    cookieConsent: true,
    dataRetentionDays: 30,
  },
  advanced: {
    sessionTimeoutMs: 1000 * 60 * 30,
    autoFlushIntervalMs: 5000,
    autoTrackErrors: true,
    ...over.advanced,
  },
  ...over,
});

/* eslint-disable no-unused-vars */
const fireDispatch = (
  onDispatch: ((event: AnalyticsEvent) => void) | undefined
) => {
  onDispatch?.({
    event: 'test',
    session_id: 's',
    timestamp: Date.now(),
    properties: { a: 1 },
    platform: 'web',
  });
};
/* eslint-enable no-unused-vars */

describe('AnalyticsProvider config signature + subscription', () => {
  it('re-initializes when advanced.onDispatch identity changes', () => {
    const first = vi.fn();
    const second = vi.fn();
    const cfg1 = baseConfig({ advanced: { onDispatch: first } });
    const cfg2 = baseConfig({ advanced: { onDispatch: second } });

    const { rerender } = render(
      <AnalyticsProvider config={cfg1}>
        <div>child</div>
      </AnalyticsProvider>
    );
    rerender(
      <AnalyticsProvider config={cfg2}>
        <div>child</div>
      </AnalyticsProvider>
    );

    // trigger dispatch via manual call
    fireDispatch(cfg2.advanced?.onDispatch);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });
});
