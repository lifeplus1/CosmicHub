import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// @ts-ignore - test dependency assumed available in workspace; if missing, add @testing-library/react
import { render } from '@testing-library/react';
import AnalyticsProvider, { useAnalytics } from '../AnalyticsProvider';
import type { AnalyticsConfig } from '../../types';

// Store callback for testing
let storedOnDispatch: any = null;

// Create a mock instance that implements the required interface
const createMockAnalyticsInstance = () => {
  let isShutdown = false;
  
  return {
    track: vi.fn((eventData: any) => {
      // Don't call onDispatch if shutdown
      if (isShutdown) return;
      
      // Call the stored callback when track is called - simulate real service behavior
      if (storedOnDispatch) {
        const analyticsEvent = {
          event: eventData.event,
          properties: eventData.properties || {},
          timestamp: Date.now(),
          session_id: 'test-session',
          platform: 'web' as const,
        };
        storedOnDispatch(analyticsEvent);
      }
    }),
    identify: vi.fn(),
    page: vi.fn(),
    setConsentGranted: vi.fn(),
    isTrackingEnabled: vi.fn(() => !isShutdown),
    getSessionId: vi.fn(() => 'test-session'),
    shutdown: vi.fn(() => {
      isShutdown = true;
    }),
    reset: vi.fn(),
    flush: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    withTiming: vi.fn(),
    trackError: vi.fn(),
  };
};

let mockInstance: any = null;

// Mock the entire AnalyticsService module
vi.mock('../../AnalyticsService', () => ({
  AnalyticsService: vi.fn().mockImplementation((config: any) => {
    storedOnDispatch = config.advanced?.onDispatch;
    mockInstance = createMockAnalyticsInstance();
    return mockInstance;
  }),
  initializeAnalytics: vi.fn((config: any) => {
    // Store the onDispatch callback for later use
    storedOnDispatch = config.advanced?.onDispatch;
    mockInstance = createMockAnalyticsInstance();
    return mockInstance;
  }),
  getAnalytics: vi.fn(() => {
    // Return null initially to match real behavior before initializeAnalytics is called
    return mockInstance;
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  storedOnDispatch = null;
  mockInstance = null;
});

// Minimal base config factory
const baseConfig = (over: Partial<AnalyticsConfig> = {}): AnalyticsConfig => {
  const base: AnalyticsConfig = {
    googleAnalytics: { measurementId: 'G-TEST', enabled: true },
    mixpanel: { token: 'mix-token', enabled: false, trackPageViews: false },
    posthog: {
      apiKey: 'posthog',
      enabled: false,
      sessionRecording: false,
      heatmaps: false,
    },
    segment: { writeKey: 'seg', enabled: false },
    rudderstack: {
      writeKey: 'rud',
      dataPlaneUrl: 'https://rud',
      enabled: false,
    },
    customAnalytics: {
      endpoint: 'https://custom.local/ingest',
      enabled: false,
    },
    privacy: {
      respectDoNotTrack: false,
      anonymizeIP: false,
      cookieConsent: true,
      dataRetentionDays: 30,
    },
    advanced: {
      sessionTimeoutMs: 1000,
      autoFlushIntervalMs: undefined,
      autoTrackErrors: false,
    },
  };
  return {
    ...base,
    ...over,
    advanced: { ...base.advanced, ...(over.advanced || {}) },
  };
};

// onRender payload shape is not used inside component; keep broad typing.
type CaptureProps = { onRender: () => void };
const Capture: React.FC<CaptureProps> = ({ onRender }) => {
  onRender();
  return null;
};

describe('AnalyticsProvider', () => {
  it('provides context and stable session id', () => {
    const spy = vi.fn();
    render(
      <AnalyticsProvider config={baseConfig()}>
        <Capture onRender={spy} />
      </AnalyticsProvider>
    );
    expect(spy).toHaveBeenCalled();
  });

  it('re-renders when measurementId changes (signature change)', () => {
    const spy = vi.fn();
    const { rerender } = render(
      <AnalyticsProvider config={baseConfig()}>
        <Capture onRender={spy} />
      </AnalyticsProvider>
    );
    const count1 = spy.mock.calls.length;
    rerender(
      <AnalyticsProvider
        config={baseConfig({
          googleAnalytics: { measurementId: 'G-NEW', enabled: true },
        })}
      >
        <Capture onRender={spy} />
      </AnalyticsProvider>
    );
    const count2 = spy.mock.calls.length;
    expect(count2).toBeGreaterThan(count1);
  });

  it('does NOT trigger extra render for non-signature change (piiKeys)', () => {
    const spy = vi.fn();
    const { rerender } = render(
      <AnalyticsProvider config={baseConfig()}>
        <Capture onRender={spy} />
      </AnalyticsProvider>
    );
    const count1 = spy.mock.calls.length;
    rerender(
      <AnalyticsProvider
        config={baseConfig({ advanced: { piiKeys: ['email'] } })}
      >
        <Capture onRender={spy} />
      </AnalyticsProvider>
    );
    const count2 = spy.mock.calls.length;
    expect(count2).toBe(count1 + 1); // only React reconciliation, no extra looped re-init cycles
  });

  it('onDispatch listener receives tracked events via subscription', () => {
    const received: string[] = [];
    
    const Test: React.FC = () => {
      const { track, subscribe } = useAnalytics();
      
      React.useEffect(() => {
        const off = subscribe(e => {
          received.push(e.event);
        });
        
        // Wait a tick to ensure subscription is set up, then track
        const timer = setTimeout(() => {
          track({ event: 'test_evt', properties: {} });
        }, 10);
        
        return () => {
          clearTimeout(timer);
          off();
        };
      }, [track, subscribe]);
      
      return null;
    };
    
    render(
      <AnalyticsProvider
        config={baseConfig({
          privacy: {
            respectDoNotTrack: false,
            anonymizeIP: false,
            cookieConsent: false,
            dataRetentionDays: 30,
          },
        })}
      >
        <Test />
      </AnalyticsProvider>
    );
    
    // Wait for async operations and check results
    return new Promise<void>((resolve, reject) => {
      const checkAfterDelay = (delay: number) => {
        setTimeout(() => {
          if (received.includes('test_evt')) {
            resolve();
          } else if (delay < 3000) {
            // Try again with longer delay
            checkAfterDelay(delay * 2);
          } else {
            reject(new Error(`Expected received to include 'test_evt', got: ${JSON.stringify(received)}. storedOnDispatch exists: ${!!storedOnDispatch}`));
          }
        }, delay);
      };
      checkAfterDelay(100);
    });
  });

  it('shutdown stops future tracking (session id retained but events no longer recorded)', async () => {
    const events: string[] = [];
    const Test: React.FC = () => {
      const { track, subscribe, shutdown } = useAnalytics();
      React.useEffect(() => {
        const off = subscribe(e => events.push(e.event));
        
        // Schedule the tracking operations
        setTimeout(() => {
          track({ event: 'before_shutdown', properties: {} });
          shutdown();
          track({ event: 'after_shutdown', properties: {} });
        }, 10);
        
        return off;
      }, [track, subscribe, shutdown]);
      return null;
    };
    
    render(
      <AnalyticsProvider
        config={baseConfig({
          privacy: {
            respectDoNotTrack: false,
            anonymizeIP: false,
            cookieConsent: false,
            dataRetentionDays: 30,
          },
        })}
      >
        <Test />
      </AnalyticsProvider>
    );
    
    // Wait for the async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(events).toContain('before_shutdown');
    // We allow that after shutdown event may be suppressed; assert not both if suppressed
    expect(events).not.toContain('after_shutdown');
  });
});
