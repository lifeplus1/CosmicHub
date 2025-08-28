export interface SubscriptionPlan {
  name: string;
  price: number;
  features: string[];
  limits: {
    chartsPerMonth: number;
    healwaveMinutes: number;
  };
}

export interface UserPreferences {
  defaultChartStyle: 'western' | 'vedic';
  notifications: {
    email: boolean;
    push: boolean;
  };
}
