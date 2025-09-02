export interface UserSubscription {
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  tier: string;
  currentPeriodEnd: Date;
  customerId?: string;
  subscriptionId?: string;
}

export const getUserTier = (subscription: UserSubscription | null): string => {
  return subscription?.status === 'active' ? subscription.tier : 'free';
};

export const hasFeatureAccess = (
  userTier: string,
  requiredTier: string,
  tiers: Record<string, unknown>
): boolean => {
  const tierOrder = Object.keys(tiers);
  const userIndex = tierOrder.indexOf(userTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

// Tier configuration
export const ASTRO_TIERS = {
  free: { 
    level: 0, 
    name: 'Free',
    description: 'Basic astrology features',
    price: { monthly: 0, yearly: 0 },
    features: ['Basic chart generation', 'Daily horoscope', 'Planet positions']
  },
  premium: { 
    level: 1, 
    name: 'Premium',
    description: 'Enhanced astrology experience',
    price: { monthly: 9.99, yearly: 99.99 },
    features: ['Advanced charts', 'Synastry analysis', 'Transit predictions', 'Export reports']
  },
  elite: { 
    level: 2, 
    name: 'Elite',
    description: 'Professional astrology toolkit',
    price: { monthly: 19.99, yearly: 199.99 },
    features: ['All Premium features', 'AI interpretations', 'Custom chart styles', 'Priority support']
  },
} as const;

export const HEALWAVE_TIERS = {
  free: { 
    level: 0, 
    name: 'Free',
    description: 'Basic healing frequencies',
    price: { monthly: 0, yearly: 0 },
    features: ['Basic frequencies', '5 presets', 'Simple timer']
  },
  premium: { 
    level: 1, 
    name: 'Premium',
    description: 'Enhanced healing experience',
    price: { monthly: 7.99, yearly: 79.99 },
    features: ['50+ frequencies', 'Binaural beats', 'Custom sessions', 'Progress tracking']
  },
  elite: { 
    level: 2, 
    name: 'Elite',
    description: 'Professional healing toolkit',
    price: { monthly: 14.99, yearly: 149.99 },
    features: ['All Premium features', 'Chakra frequencies', 'Guided meditations', 'Export sessions']
  },
} as const;
