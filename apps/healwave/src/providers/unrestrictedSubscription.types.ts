export interface UnrestrictedSubscriptionContextType {
  userTier: string;
  hasFeature: (feature: string, app?: 'astro' | 'healwave') => boolean;
  upgradeRequired: (feature: string) => void;
  checkUsageLimit: (limitType: string) => { allowed: boolean; current: number; limit: number };
  subscription: {
    tier: string;
    status: string;
    features: string[];
    currentPeriodEnd?: string | number | Date | null;
  };
  usageData: {
    chartsGenerated: number;
    apiCallsUsed: number;
    storageUsed: number;
  };
}
