import { useCallback, useEffect, useState } from 'react';
import type { Analytics, AnalyticsCallOptions } from '../firebase/analytics';

export interface UseAnalyticsReturn {
  analytics: Analytics | null;
  logEvent: (eventName: string, eventParams?: Record<string, any>, options?: AnalyticsCallOptions) => void;
  setUserId: (userId: string) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  setCurrentScreen: (screen: string) => void;
  isReady: boolean;
}

export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const [{ getAnalytics }, { getApp }] = await Promise.all([
          import('firebase/analytics'),
          import('firebase/app')
        ]);
        const app = getApp();
        const instance = getAnalytics(app);
        if (isMounted) setAnalytics(instance);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to init analytics', err);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const logEventCb = useCallback<UseAnalyticsReturn['logEvent']>((eventName, eventParams, options) => {
    if (!analytics) return;
  void import('firebase/analytics')
      .then(({ logEvent }) => logEvent(analytics, eventName, eventParams, options))
      .catch(() => {});
  }, [analytics]);

  const setUserIdCb = useCallback<UseAnalyticsReturn['setUserId']>((userId) => {
    if (!analytics) return;
  void import('firebase/analytics')
      .then(({ setUserId }) => setUserId(analytics, userId))
      .catch(() => {});
  }, [analytics]);

  const setUserPropertiesCb = useCallback<UseAnalyticsReturn['setUserProperties']>((props) => {
    if (!analytics) return;
  void import('firebase/analytics')
      .then(({ setUserProperties }) => setUserProperties(analytics, props))
      .catch(() => {});
  }, [analytics]);

  const setCurrentScreenCb = useCallback<UseAnalyticsReturn['setCurrentScreen']>((screen) => {
    if (!analytics) return;
  void import('firebase/analytics')
      .then(({ setCurrentScreen }) => setCurrentScreen(analytics, screen))
      .catch(() => {});
  }, [analytics]);

  return {
    analytics,
    logEvent: logEventCb,
    setUserId: setUserIdCb,
    setUserProperties: setUserPropertiesCb,
    setCurrentScreen: setCurrentScreenCb,
    isReady: !!analytics
  };
}
