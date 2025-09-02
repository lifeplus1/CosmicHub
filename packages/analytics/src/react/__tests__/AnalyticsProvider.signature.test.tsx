import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AnalyticsProvider } from '../AnalyticsProvider';
import { initializeAnalytics } from '../../AnalyticsService';
import type { AnalyticsConfig } from '../../types';

vi.mock('../../AnalyticsService', async () => {
  const actual = await vi.importActual<any>('../../AnalyticsService');
  return {
    ...actual,
    getAnalytics: vi.fn(() => null), // Initially return null so initializeAnalytics gets called
    initializeAnalytics: vi.fn(() => ({
      getSessionId: () => 'sess-NEW',
      track: vi.fn(),
      identify: vi.fn(),
      page: vi.fn(),
      setConsentGranted: vi.fn(),
      isTrackingEnabled: () => true,
    })),
  };
});

const baseConfig: AnalyticsConfig = {
  googleAnalytics: { measurementId: 'GA-1', enabled: true },
  mixpanel: { token: 'MIX-1', enabled: true, trackPageViews: true },
  posthog: {
    apiKey: 'PH-1',
    enabled: true,
    sessionRecording: false,
    heatmaps: false,
  },
  customAnalytics: {
    endpoint: 'https://api.example.test/ingest',
    enabled: true,
  },
  privacy: {
    respectDoNotTrack: true,
    anonymizeIP: true,
    cookieConsent: true,
    dataRetentionDays: 30,
  },
  advanced: {
    sessionTimeoutMs: 1800000,
    autoFlushIntervalMs: 10000,
    autoTrackErrors: true,
  },
};

describe('AnalyticsProvider config signature', () => {
  it('does not re-init when irrelevant fields change', () => {
    const { rerender } = render(
      <AnalyticsProvider config={baseConfig}>{null}</AnalyticsProvider>
    );
    // Initially it calls initializeAnalytics once
    expect(initializeAnalytics).toHaveBeenCalledTimes(1);

    // Change a field not included in signature: add piiKeys
    const updated: AnalyticsConfig = {
      ...baseConfig,
      advanced: { ...baseConfig.advanced, piiKeys: ['email'] },
    };
    rerender(<AnalyticsProvider config={updated}>{null}</AnalyticsProvider>);

    // Should still be 1 - no re-init
    expect(initializeAnalytics).toHaveBeenCalledTimes(1);
  });

  it('re-inits when a signature field changes', () => {
    const { rerender } = render(
      <AnalyticsProvider config={baseConfig}>{null}</AnalyticsProvider>
    );
    // Store the initial call count
    const initialCalls = (initializeAnalytics as any).mock.calls.length;
    
    // Change measurementId (part of signature)
    const withNewGA: AnalyticsConfig = {
      ...baseConfig,
      googleAnalytics: {
        ...baseConfig.googleAnalytics!,
        measurementId: 'GA-2',
        enabled: true,
      },
    };
    rerender(<AnalyticsProvider config={withNewGA}>{null}</AnalyticsProvider>);
    
    // Should have been called more times after the config change
    const finalCalls = (initializeAnalytics as any).mock.calls.length;
    expect(finalCalls).toBeGreaterThan(initialCalls);
  });

  it('re-inits when advanced sessionTimeoutMs changes', () => {
    const { rerender } = render(
      <AnalyticsProvider config={baseConfig}>{null}</AnalyticsProvider>
    );
    // Store the initial call count
    const initialCalls = (initializeAnalytics as any).mock.calls.length;
    
    const changed: AnalyticsConfig = {
      ...baseConfig,
      advanced: { ...baseConfig.advanced, sessionTimeoutMs: 42 },
    };
    rerender(<AnalyticsProvider config={changed}>{null}</AnalyticsProvider>);
    
    // Should have been called more times after the config change
    const finalCalls = (initializeAnalytics as any).mock.calls.length;
    expect(finalCalls).toBeGreaterThan(initialCalls);
  });
});
