export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    chartsPerMonth: number;
    healwaveMinutes: number;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  defaultChartStyle: 'western' | 'vedic';
  notifications: {
    email: boolean;
    push: boolean;
  };
}
