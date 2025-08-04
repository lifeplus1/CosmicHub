// Subscription types and pricing configuration
export interface SubscriptionTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    sessionsPerDay?: number;
    sessionMaxDuration?: number;
    chartsPerMonth?: number;
    chartStorage?: number;
  };
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
}

export interface UserSubscription {
  tier: 'free' | 'premium' | 'elite' | 'clinical';
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  customerId: string;
  subscriptionId: string;
}

// HealWave subscription tiers
export const HEALWAVE_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: [
      '3 core binaural frequencies',
      '20-minute session limit', 
      '2 sessions per day',
      'Basic progress tracking',
      'Standard audio quality'
    ],
    limits: {
      sessionsPerDay: 2,
      sessionMaxDuration: 20 * 60 // 20 minutes in seconds
    },
    stripePriceIds: { monthly: '', yearly: '' }
  },
  premium: {
    id: 'premium',
    name: 'HealWave Pro',
    price: { monthly: 9.99, yearly: 79.99 },
    features: [
      'All therapeutic frequencies (15+)',
      'Unlimited sessions',
      '50+ premium presets',
      'Custom frequency builder',
      'High-fidelity audio (320kbps)',
      'Advanced progress tracking',
      'Offline mode',
      'Background sounds mixing',
      'Sleep & wake programs',
      'Export custom sessions'
    ],
    limits: {},
    stripePriceIds: {
      monthly: 'price_healwave_pro_monthly',
      yearly: 'price_healwave_pro_yearly'
    }
  },
  clinical: {
    id: 'clinical',
    name: 'HealWave Clinical',
    price: { monthly: 49.99, yearly: 499.99 },
    features: [
      'All Pro features',
      'FDA-compliant protocols',
      'Practitioner dashboard',
      'Client management',
      'White-label options',
      'HIPAA compliance',
      'Research database access',
      'Priority clinical support'
    ],
    limits: {},
    stripePriceIds: {
      monthly: 'price_healwave_clinical_monthly',
      yearly: 'price_healwave_clinical_yearly'
    }
  }
};

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
  limitType: keyof SubscriptionTier['limits'],
  tiers: Record<string, SubscriptionTier>
): number | undefined => {
  return tiers[userTier]?.limits[limitType];
};

export const getTierFeatures = (
  tierSlug: string,
  tiers: Record<string, SubscriptionTier>
): string[] => {
  return tiers[tierSlug]?.features || [];
};

export const calculateYearlySavings = (monthly: number, yearly: number): number => {
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
};
