import type { Analytics, AnalyticsCallOptions } from '../firebase/analytics';
export interface UseAnalyticsReturn {
  analytics: Analytics | null;
  logEvent: (
    eventName: string,
    eventParams?: Record<string, any>,
    options?: AnalyticsCallOptions
  ) => void;
  setUserId: (userId: string) => void;
  setUserProperties: (properties: Record<string, any>) => void;
  setCurrentScreen: (screen: string) => void;
  isReady: boolean;
}
export declare function useAnalytics(): UseAnalyticsReturn;
//# sourceMappingURL=useAnalytics.d.ts.map
