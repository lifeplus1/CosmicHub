import { useCallback, useEffect, useState } from 'react';
export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [{ getAnalytics }, { getApp }] = await Promise.all([
          import('firebase/analytics'),
          import('firebase/app'),
        ]);
        const app = getApp();
        const instance = getAnalytics(app);
        if (isMounted) setAnalytics(instance);
      } catch (err) {
        console.error('Failed to init analytics', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);
  const logEventCb = useCallback(
    (eventName, eventParams, options) => {
      if (!analytics) return;
      import('firebase/analytics')
        .then(({ logEvent }) =>
          logEvent(analytics, eventName, eventParams, options)
        )
        .catch(() => {});
    },
    [analytics]
  );
  const setUserIdCb = useCallback(
    userId => {
      if (!analytics) return;
      import('firebase/analytics')
        .then(({ setUserId }) => setUserId(analytics, userId))
        .catch(() => {});
    },
    [analytics]
  );
  const setUserPropertiesCb = useCallback(
    props => {
      if (!analytics) return;
      import('firebase/analytics')
        .then(({ setUserProperties }) => setUserProperties(analytics, props))
        .catch(() => {});
    },
    [analytics]
  );
  const setCurrentScreenCb = useCallback(
    screen => {
      if (!analytics) return;
      import('firebase/analytics')
        .then(({ setCurrentScreen }) => setCurrentScreen(analytics, screen))
        .catch(() => {});
    },
    [analytics]
  );
  return {
    analytics,
    logEvent: logEventCb,
    setUserId: setUserIdCb,
    setUserProperties: setUserPropertiesCb,
    setCurrentScreen: setCurrentScreenCb,
    isReady: !!analytics,
  };
}
//# sourceMappingURL=useAnalytics.js.map
