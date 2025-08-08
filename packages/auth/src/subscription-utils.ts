export interface UserSubscription {
  tier: 'free' | 'premium' | 'elite';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  customerId?: string;
  subscriptionId?: string;
}

export const getUserTier = (subscription: UserSubscription | null): string => {
  return subscription?.status === 'active' ? subscription.tier : 'free';
};

export const hasFeatureAccess = (userTier: string, requiredTier: string, tiers: Record<string, any>): boolean => {
  const tierOrder = Object.keys(tiers);
  const userIndex = tierOrder.indexOf(userTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

// Astro app tier configuration
export const ASTRO_TIERS = {
  free: {
    name: "Free Explorer",
    limits: {
      chartsPerMonth: 3,
      chartStorage: 5,
      synastryAnalyses: 0,
      aiQueries: 0
    }
  },
  premium: {
    name: "Cosmic Seeker", 
    limits: {
      chartsPerMonth: -1,
      chartStorage: -1,
      synastryAnalyses: 20,
      aiQueries: 0
    }
  },
  elite: {
    name: "Cosmic Master",
    limits: {
      chartsPerMonth: -1,
      chartStorage: -1,
      synastryAnalyses: -1,
      aiQueries: 100
    }
  }
};

// Healwave app tier configuration  
export const HEALWAVE_TIERS = {
  free: {
    name: "Free Sound Healing",
    limits: {
      sessionsPerMonth: 5,
      customPresets: 0,
      downloadAudio: false
    }
  },
  premium: {
    name: "Sound Healer",
    limits: {
      sessionsPerMonth: -1,
      customPresets: 10,
      downloadAudio: true
    }
  },
  elite: {
    name: "Master Healer",
    limits: {
      sessionsPerMonth: -1,
      customPresets: -1,
      downloadAudio: true
    }
  }
};
