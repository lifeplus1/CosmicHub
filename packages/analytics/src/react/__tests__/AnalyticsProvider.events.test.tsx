import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsProvider, useAnalytics } from '../AnalyticsProvider';
import { initializeAnalytics } from '../../AnalyticsService';
import type { AnalyticsConfig, AnalyticsEvent } from '../../types';

// Mock DOM environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Store callback for testing
let storedOnDispatch: any = null;

// Create a mock instance that implements the required interface
const createMockAnalyticsInstance = () => ({
  track: vi.fn((eventData: any) => {
    // Call the stored callback when track is called
    if (storedOnDispatch) {
      storedOnDispatch({
        event: eventData.event || eventData.name,
        properties: eventData.properties || {},
        timestamp: Date.now(),
        sessionId: 'test-session',
      });
    }
  }),
  identify: vi.fn(),
  page: vi.fn(),
  setConsentGranted: vi.fn(),
  isTrackingEnabled: vi.fn(() => true),
  getSessionId: vi.fn(() => 'test-session'),
  shutdown: vi.fn(),
  reset: vi.fn(),
  flush: vi.fn(),
  disable: vi.fn(),
  enable: vi.fn(),
  withTiming: vi.fn(),
  trackError: vi.fn(),
});

let mockInstance: any = null;

vi.mock('../../AnalyticsService', () => ({
  AnalyticsService: vi.fn().mockImplementation((config: any) => {
    // Store the onDispatch callback for later use
    storedOnDispatch = config.onDispatch;
    mockInstance = createMockAnalyticsInstance();
    return mockInstance;
  }),
  initializeAnalytics: vi.fn((config: any) => {
    // Store the onDispatch callback for later use
    storedOnDispatch = config.onDispatch;
    mockInstance = createMockAnalyticsInstance();
    return mockInstance;
  }),
  getAnalytics: vi.fn(() => ({
    sessionId: 'test-session',
    config: {},
    getSessionId: () => 'test-session',
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  storedOnDispatch = null;
  mockInstance = null;
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
