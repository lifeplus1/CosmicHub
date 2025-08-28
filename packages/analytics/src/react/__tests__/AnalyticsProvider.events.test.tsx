import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AnalyticsProvider, useAnalytics } from '../AnalyticsProvider';
import { initializeAnalytics } from '../../AnalyticsService';
import type { AnalyticsConfig, AnalyticsEvent } from '../../types';

vi.mock('../../AnalyticsService', async () => {
  const actual = await vi.importActual<any>('../../AnalyticsService');
  return {
    ...actual,
    getAnalytics: vi.fn(() => ({
      getSessionId: () => 'sess-INIT',
      track: vi.fn(),
      identify: vi.fn(),
      page: vi.fn(),
      setConsentGranted: vi.fn(),
      isTrackingEnabled: () => true,
    })),
    initializeAnalytics: vi.fn(() => ({
      getSessionId: () => 'sess-1',
      track: vi.fn(() => {
        /* noop */
      }),
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

const FireTrack: React.FC<{ ev: Partial<AnalyticsEvent> }> = ({ ev }) => {
  const { track, lastEvent, subscribe } = useAnalytics();
  useEffect(() => {
    const unsub = subscribe(() => {}); // ensure augmented config path
    track({ event: 'TEST_EVT', properties: { foo: 'bar' }, ...ev });
    return () => unsub();
  }, [track, ev, subscribe]);
  return lastEvent ? (
    <div data-testid='last-event' data-event={lastEvent.event}></div>
  ) : null;
};

describe('AnalyticsProvider events', () => {
  it('updates lastEvent and notifies subscribers via augmented onDispatch', async () => {
    const listener = vi.fn();
    const Wrapper: React.FC = () => {
      const { subscribe } = useAnalytics();
      useEffect(() => subscribe(listener), [subscribe]);
      return <FireTrack ev={{}} />;
    };
    const { findByTestId } = render(
      <AnalyticsProvider config={baseConfig}>
        <Wrapper />
      </AnalyticsProvider>
    );
    const node = await findByTestId('last-event');
    expect(node.getAttribute('data-event')).toBe('TEST_EVT');
    await waitFor(() => expect(listener).toHaveBeenCalledTimes(1));
  });

  it('re-initializes when onDispatch function identity changes', () => {
    const { rerender } = render(
      <AnalyticsProvider
        config={{
          ...baseConfig,
          advanced: { ...baseConfig.advanced, onDispatch: () => {} },
        }}
      >
        {null}
      </AnalyticsProvider>
    );
    expect(initializeAnalytics).toHaveBeenCalledTimes(1);
    rerender(
      <AnalyticsProvider
        config={{
          ...baseConfig,
          advanced: { ...baseConfig.advanced, onDispatch: () => {} },
        }}
      >
        {null}
      </AnalyticsProvider>
    );
    // Two distinct inline functions => second re-init
    expect(initializeAnalytics).toHaveBeenCalledTimes(2);
  });

  it('avoids re-init when onDispatch is stable (memoized reference)', () => {
    const stable = () => {};
    const firstConfig = {
      ...baseConfig,
      advanced: { ...baseConfig.advanced, onDispatch: stable },
    } as AnalyticsConfig;
    const secondConfig = {
      ...baseConfig,
      advanced: { ...baseConfig.advanced, onDispatch: stable },
    } as AnalyticsConfig;
    const { rerender } = render(
      <AnalyticsProvider config={firstConfig}>{null}</AnalyticsProvider>
    );
    expect(initializeAnalytics).toHaveBeenCalledTimes(1);
    rerender(
      <AnalyticsProvider config={secondConfig}>{null}</AnalyticsProvider>
    );
    expect(initializeAnalytics).toHaveBeenCalledTimes(1);
  });
});
