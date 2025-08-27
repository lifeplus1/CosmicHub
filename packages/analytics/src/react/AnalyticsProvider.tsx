import React, { createContext, useContext, useMemo, useRef } from 'react';
import type { AnalyticsConfig, AnalyticsEvent, UserTraits, PageProperties } from '../types/index.js';
import { initializeAnalytics, getAnalytics } from '../AnalyticsService.js';

interface AnalyticsContextValue {
  track: (event: Omit<AnalyticsEvent, 'session_id' | 'timestamp' | 'platform'>) => void;
  identify: (userId: string, traits: UserTraits) => void;
  page: (name: string, props: PageProperties) => void;
  config: AnalyticsConfig;
  sessionId: string | null;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

export interface AnalyticsProviderProps { config: AnalyticsConfig; children: React.ReactNode }

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ config, children }) => {
  // Initialize once and maintain singleton reference
  const instanceRef = useRef<ReturnType<typeof getAnalytics>>(null);
  
  // Only initialize if we don't have an instance yet
  instanceRef.current ??= getAnalytics() ?? initializeAnalytics(config);

  const value = useMemo<AnalyticsContextValue>(() => ({
    track: (e) => instanceRef.current!.track(e),
    identify: (id, traits) => instanceRef.current!.identify(id, traits),
    page: (n, p) => instanceRef.current!.page(n, p),
    config,
    sessionId: instanceRef.current?.getSessionId() ?? null
  }), [config]);
  
  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};

export const useAnalytics = (): AnalyticsContextValue => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
};

export default AnalyticsProvider;