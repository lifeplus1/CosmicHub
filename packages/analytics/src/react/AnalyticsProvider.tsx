import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import type {
  AnalyticsConfig,
  AnalyticsEvent,
  UserTraits,
  PageProperties,
} from '../types/index';
import { initializeAnalytics, getAnalytics } from '../AnalyticsService';

interface AnalyticsContextValue {
  track: (
    event: Omit<AnalyticsEvent, 'session_id' | 'timestamp' | 'platform'>
  ) => void;
  identify: (userId: string, traits: UserTraits) => void;
  page: (name: string, props: PageProperties) => void;
  config: AnalyticsConfig;
  sessionId: string | null;
  setConsentGranted: (granted: boolean) => void;
  isTrackingEnabled: () => boolean;
  // Latest fully-sanitized dispatched event (or null if none yet)
  lastEvent: AnalyticsEvent | null;
  // Subscribe to dispatched events; returns unsubscribe function.
  subscribe: (listener: (event: AnalyticsEvent) => void) => () => void;
  shutdown: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(
  undefined
);

export interface AnalyticsProviderProps {
  config: AnalyticsConfig;
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  config,
  children,
}) => {
  const instanceRef = useRef(getAnalytics());
  const prevConfigSigRef = useRef<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(
    instanceRef.current?.getSessionId() ?? null
  );
  const [lastEvent, setLastEvent] = useState<AnalyticsEvent | null>(null);
  const listenersRef = useRef<Set<(e: AnalyticsEvent) => void>>(new Set());

  // External minimal privacy shape for type narrowing.
  interface MinimalPrivacy {
    consentRequired?: boolean;
    consent?: boolean;
    mode?: string;
    region?: string;
  }
  const isMinimalPrivacy = (val: unknown): val is MinimalPrivacy =>
    !!val && typeof val === 'object';

  // Keep a ref of the last seen onDispatch function to generate a stable small id
  type DispatchFn = (event: AnalyticsEvent) => void;
  const onDispatchIdRef = useRef<Map<DispatchFn, number>>(new Map());
  const onDispatchSeqRef = useRef(0);

  // Helper: escape separator characters in signature parts
  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s =
      typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
        ? String(v)
        : '';
    return s.replace(/\\|\|/g, m => (m === '|' ? '%7C' : '%5C'));
  };

  // Helper to derive a concise, order-stable signature of just the fields whose change requires re-init.
  const buildConfigSignature = useCallback((c: AnalyticsConfig): string => {
    const adv = c.advanced;
    const p = isMinimalPrivacy(c.privacy) ? c.privacy : undefined;
    const privacy = p
      ? JSON.stringify({
          consent: p.consentRequired ?? p.consent ?? null,
          mode: p.mode ?? null,
          region: p.region ?? null,
        })
      : '';

    // Stable small id for onDispatch reference (length or .toString differences between builds shouldn't churn)
    let onDispatchPart = '';
    if (adv?.onDispatch) {
      const map = onDispatchIdRef.current;
      if (!map.has(adv.onDispatch)) {
        onDispatchSeqRef.current += 1;
        map.set(adv.onDispatch, onDispatchSeqRef.current);
      }
      onDispatchPart = `fn:${map.get(adv.onDispatch)}`;
    }

    const parts: (string | number | boolean)[] = [
      c.googleAnalytics?.measurementId ?? '',
      c.mixpanel?.enabled ? (c.mixpanel.token ?? '') : '',
      c.posthog?.enabled ? (c.posthog.apiKey ?? '') : '',
      c.customAnalytics?.enabled ? (c.customAnalytics.endpoint ?? '') : '',
      privacy,
      adv?.sessionTimeoutMs ?? '',
      adv?.autoFlushIntervalMs ?? '',
      adv?.autoTrackErrors ? '1' : '0',
      onDispatchPart,
    ];
    return parts.map(esc).join('|');
  }, []);

  // Build stable signature (memoized on the config object reference)
  const configSignature = useMemo(
    () => buildConfigSignature(config),
    [config, buildConfigSignature]
  );

  // Memoized onDispatch function to ensure stable reference for signature calculation
  const memoizedOnDispatch = useCallback(
    (e: AnalyticsEvent) => {
      setLastEvent(e);
      // Notify subscribers
      listenersRef.current.forEach(fn => {
        try {
          fn(e);
        } catch {
          /* swallow listener errors */
        }
      });
      try {
        config.advanced?.onDispatch?.(e);
      } catch {
        /* swallow user errors */
      }
    },
    [config.advanced?.onDispatch]
  );

  // Initialize or reinitialize when config signature changes (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    const currentSig = configSignature;

    // Always set up onDispatch to support dynamic subscription
    const augmentedConfig: AnalyticsConfig = {
      ...config,
      advanced: {
        ...config.advanced,
        onDispatch: memoizedOnDispatch,
      },
    };

    if (!instanceRef.current) {
      instanceRef.current = initializeAnalytics(augmentedConfig);
      setSessionId(instanceRef.current.getSessionId());
      prevConfigSigRef.current = currentSig;
      return;
    }
    if (prevConfigSigRef.current && prevConfigSigRef.current !== currentSig) {
      // Reinitialize with new config
      instanceRef.current = initializeAnalytics(augmentedConfig);
      setSessionId(instanceRef.current.getSessionId());
    }
    prevConfigSigRef.current = currentSig;
  }, [config, configSignature]);

  // Stable wrappers (no re-renders unless instance or config changes)
  const track = useCallback(
    (e: Omit<AnalyticsEvent, 'session_id' | 'timestamp' | 'platform'>) => {
      instanceRef.current?.track(e);
    },
    []
  );
  const identify = useCallback((id: string, traits: UserTraits) => {
    instanceRef.current?.identify(id, traits);
  }, []);
  const page = useCallback((n: string, p: PageProperties) => {
    instanceRef.current?.page(n, p);
  }, []);
  const setConsentGranted = useCallback((granted: boolean) => {
    instanceRef.current?.setConsentGranted(granted);
  }, []);
  const isTrackingEnabled = useCallback(
    () => instanceRef.current?.isTrackingEnabled() ?? false,
    []
  );
  const shutdown = useCallback(() => {
    instanceRef.current?.shutdown?.();
  }, []);

  const subscribe = useCallback((listener: (e: AnalyticsEvent) => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  // Expose updated session id if it changes internally via resets (poll lightweight on mount)
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR guard
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test')
      return; // skip in tests to avoid hanging timers
    const intervalId = setInterval(() => {
      try {
        const sid = instanceRef.current?.getSessionId() ?? null;
        setSessionId(prev => (prev !== sid ? sid : prev));
      } catch (error) {
        console.warn('Analytics session polling error:', error);
      }
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      track,
      identify,
      page,
      config,
      sessionId,
      setConsentGranted,
      isTrackingEnabled,
      lastEvent,
      subscribe,
      shutdown,
    }),
    [
      track,
      identify,
      page,
      config,
      sessionId,
      setConsentGranted,
      isTrackingEnabled,
      lastEvent,
      subscribe,
      shutdown,
    ]
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextValue => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx)
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
};

export default AnalyticsProvider;

// Pure helper export for isolated signature tests (keeps provider logic lean in tests)
export const __private__buildConfigSignature = (config: AnalyticsConfig) => {
  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return '';
    const s =
      typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
        ? String(v)
        : '';
    return s.replace(/\\|\|/g, m => (m === '|' ? '%7C' : '%5C'));
  };
  interface MinimalPrivacy {
    consentRequired?: boolean;
    consent?: boolean;
    mode?: string;
    region?: string;
  }
  const isMinimalPrivacy = (val: unknown): val is MinimalPrivacy =>
    !!val && typeof val === 'object';
  const adv = config.advanced;
  const p = isMinimalPrivacy(config.privacy) ? config.privacy : undefined;
  const privacy = p
    ? JSON.stringify({
        consent: p.consentRequired ?? p.consent ?? null,
        mode: p.mode ?? null,
        region: p.region ?? null,
      })
    : '';
  const parts: (string | number | boolean)[] = [
    config.googleAnalytics?.measurementId ?? '',
    config.mixpanel?.enabled ? (config.mixpanel.token ?? '') : '',
    config.posthog?.enabled ? (config.posthog.apiKey ?? '') : '',
    config.customAnalytics?.enabled
      ? (config.customAnalytics.endpoint ?? '')
      : '',
    privacy,
    adv?.sessionTimeoutMs ?? '',
    adv?.autoFlushIntervalMs ?? '',
    adv?.autoTrackErrors ? '1' : '0',
  ];
  return parts.map(esc).join('|');
};
