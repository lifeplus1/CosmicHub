// Subscription types and pricing configuration for CosmicHub
export interface SubscriptionTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    chartsPerMonth?: number;
    chartStorage?: number;
  };
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
}

export interface UserSubscription {
  tier: 'free' | 'premium' | 'elite';
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  customerId: string;
  subscriptionId: string;
}

// CosmicHub subscription tiers
export const COSMICHUB_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free', 
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Basic Western birth chart',
      'Core planet positions',
      'Daily horoscope',
      'Life path numerology',
      'Save up to 3 charts'
    ],
    limits: {
      chartsPerMonth: 5,
      chartStorage: 3
    },
    stripePriceIds: { monthly: '', yearly: '' }
  },
  premium: {
    id: 'premium',
    name: 'CosmicHub Pro', 
    price: { monthly: 14.99, yearly: 129.99 },
    features: [
      'Multi-system analysis (5 systems)',
      'Complete birth chart analysis',
      'Advanced numerology (all systems)',
      'Unlimited calculations',
      'Chart comparisons & synastry',
      'Transit predictions',
      'AI-powered interpretations',
      'Chart sharing & PDF exports',
      'Historical tracking',
      'Priority calculations'
    ],
    limits: {},
    stripePriceIds: {
      monthly: 'price_cosmichub_pro_monthly',
      yearly: 'price_cosmichub_pro_yearly'
    }
  },
  elite: {
    id: 'elite',
    name: 'CosmicHub Elite',
    price: { monthly: 29.99, yearly: 249.99 },
    features: [
      'All Pro features',
      'Monthly astrologer consultations',
      'Custom timing reports',
      'Advanced progressions',
      'Research database access',
      'Early beta features',
      'Personalized recommendations',
      'Family chart analysis (10 members)',
      'VIP support'
    ],
    limits: {},
    stripePriceIds: {
      monthly: 'price_cosmichub_elite_monthly', 
      yearly: 'price_cosmichub_elite_yearly'
    }
  }
};

// Utility functions
export const getUserTier = (subscription: UserSubscription | null): string => {
  if (!subscription || subscription.status !== 'active') {
    return 'free';
  }
  return subscription.tier;
};

export const hasFeatureAccess = (
  userTier: string,
  requiredTier: string,
  tiers: Record<string, SubscriptionTier>
): boolean => {
  const tierOrder = Object.keys(tiers);
  const userIndex = tierOrder.indexOf(userTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

export const getUsageLimit = (
  userTier: string,
  limitType: keyof SubscriptionTier['limits']
): number | undefined => {
  return COSMICHUB_TIERS[userTier]?.limits[limitType];
};

export const calculateYearlySavings = (monthly: number, yearly: number): number => {
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
};
