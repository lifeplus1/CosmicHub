// Subscription types and pricing configuration for CosmicHub
export interface SubscriptionTier {
  name: string;
  description: string;
  icon: string;
  color: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  limits: {
    chartsPerMonth: number;
    chartStorage: number;
    synastryAnalyses: number;
    aiQueries: number;
  };
  educationalInfo: {
    bestFor: string[];
    keyBenefits: string[];
    examples: string[];
    upgradeReasons: string[];
  };
}

export interface UserSubscription {
  tier: 'free' | 'premium' | 'elite';
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  customerId: string;
  subscriptionId: string;
}

export interface FeatureAccess {
  basicCharts: boolean;
  multiSystemAnalysis: boolean;
  synastryAnalysis: boolean;
  transitAnalysis: boolean;
  aiInterpretation: boolean;
  pdfExport: boolean;
  prioritySupport: boolean;
  betaFeatures: boolean;
}

export interface UsageLimit {
  current: number;
  limit: number;
  allowed: boolean;
  resetDate?: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: 'free' | 'premium' | 'elite';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// CosmicHub subscription tiers
export const COSMICHUB_TIERS: Record<string, SubscriptionTier> = {
  free: {
    name: 'Free Explorer',
    description: 'Perfect for beginners exploring astrology',
    icon: '👤',
    color: 'gray',
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      'Basic birth chart calculation',
      'Western tropical astrology',
      'Planet positions and aspects',
      'House placements',
      'Basic chart interpretation',
      'Community support'
    ],
    limits: {
      chartsPerMonth: 3,
      chartStorage: 5,
      synastryAnalyses: 0,
      aiQueries: 0,
    },
    educationalInfo: {
      bestFor: [
        'Astrology beginners',
        'Casual chart exploration',
        'Learning basic concepts',
        'Testing the platform'
      ],
      keyBenefits: [
        'No cost to start',
        'Essential chart features',
        'Learn astrology basics',
        'Explore your natal chart'
      ],
      examples: [
        'Calculate your first birth chart',
        'Understand your Sun, Moon, Rising',
        'Explore house meanings',
        'Learn about planetary aspects'
      ],
      upgradeReasons: [
        'Need more than 3 charts per month',
        'Want to save more than 5 charts',
        'Interested in advanced analysis',
        'Seeking relationship compatibility'
      ]
    }
  },
  premium: {
    name: 'Cosmic Seeker',
    description: 'Advanced tools for serious astrology enthusiasts',
    icon: '🌟',
    color: 'purple',
    price: {
      monthly: 14.99,
      yearly: 149.99,
    },
    features: [
      'Everything in Free',
      'Unlimited chart calculations',
      'Unlimited chart storage',
      'Multi-system analysis (Western, Vedic, Chinese, Mayan)',
      'Synastry compatibility analysis',
      'Advanced house systems',
      'PDF export and sharing',
      'Email support',
      'Chart history and organization'
    ],
    limits: {
      chartsPerMonth: -1, // Unlimited
      chartStorage: -1, // Unlimited
      synastryAnalyses: 20,
      aiQueries: 0,
    },
    educationalInfo: {
      bestFor: [
        'Serious astrology students',
        'Professional astrologers',
        'Relationship analysis enthusiasts',
        'Multi-cultural astrology explorers'
      ],
      keyBenefits: [
        'Unlimited chart calculations',
        'Compare multiple astrological systems',
        'Relationship compatibility analysis',
        'Professional-grade features'
      ],
      examples: [
        'Calculate charts for entire family',
        'Compare Western vs Vedic interpretations',
        'Analyze romantic compatibility',
        'Study Chinese Four Pillars astrology'
      ],
      upgradeReasons: [
        'Want AI-powered interpretations',
        'Need transit analysis and timing',
        'Require advanced predictive tools',
        'Seek cutting-edge features'
      ]
    }
  },
  elite: {
    name: 'Cosmic Master',
    description: 'Complete astrological mastery suite with AI',
    icon: '👑',
    color: 'gold',
    price: {
      monthly: 29.99,
      yearly: 299.99,
    },
    features: [
      'Everything in Premium',
      'AI-powered chart interpretations',
      'Advanced transit analysis',
      'Predictive timing techniques',
      'Uranian astrology and midpoints',
      'Custom AI question answering',
      'Priority support and consultation',
      'Beta feature early access',
      'Professional chart reports',
      'Advanced compatibility analysis'
    ],
    limits: {
      chartsPerMonth: -1, // Unlimited
      chartStorage: -1, // Unlimited
      synastryAnalyses: -1, // Unlimited
      aiQueries: 100,
    },
    educationalInfo: {
      bestFor: [
        'Professional astrologers',
        'Advanced practitioners',
        'AI-assisted analysis seekers',
        'Predictive astrology enthusiasts'
      ],
      keyBenefits: [
        'AI-powered deep analysis',
        'Predictive timing capabilities',
        'Cutting-edge astrological techniques',
        'Unlimited access to all features'
      ],
      examples: [
        'Get AI analysis of complex aspects',
        'Predict optimal timing for decisions',
        'Explore Uranian midpoint techniques',
        'Access latest astrological innovations'
      ],
      upgradeReasons: [
        'This is the ultimate plan',
        'Includes every feature available',
        'Perfect for professional use',
        'Future-proof with new features'
      ]
    }
  }
};

export const FEATURE_TOOLTIPS: Record<string, {
  title: string;
  description: string;
  examples: string[];
  tier: 'free' | 'premium' | 'elite';
}> = {
  basicCharts: {
    title: 'Basic Birth Charts',
    description: 'Calculate accurate natal charts using Western tropical astrology with essential planetary positions and aspects.',
    examples: [
      'Sun, Moon, Rising sign calculations',
      'All planetary positions in signs and houses',
      'Major aspects between planets',
      'House cusps and angles'
    ],
    tier: 'free'
  },
  multiSystemAnalysis: {
    title: 'Multi-System Analysis',
    description: 'Compare insights from multiple astrological traditions including Western, Vedic, Chinese, and Mayan systems.',
    examples: [
      'Western tropical vs Vedic sidereal differences',
      'Chinese Four Pillars analysis',
      'Mayan sacred calendar insights',
      'Integrated cross-cultural perspectives'
    ],
    tier: 'premium'
  },
  synastryAnalysis: {
    title: 'Synastry Compatibility',
    description: 'Analyze relationship dynamics by comparing two birth charts to understand compatibility and potential challenges.',
    examples: [
      'Romantic partner compatibility',
      'Friendship dynamics analysis',
      'Family relationship insights',
      'Business partnership potential'
    ],
    tier: 'premium'
  },
  transitAnalysis: {
    title: 'Transit Analysis',
    description: 'Track current planetary movements and their effects on your natal chart for timing and predictive insights.',
    examples: [
      'Current life phase understanding',
      'Optimal timing for important decisions',
      'Challenge and opportunity periods',
      'Personal growth cycles'
    ],
    tier: 'elite'
  },
  aiInterpretation: {
    title: 'AI Chart Interpretation',
    description: 'Advanced artificial intelligence analyzes complex chart patterns to provide personalized, nuanced interpretations.',
    examples: [
      'Deep personality analysis synthesis',
      'Life purpose and career guidance',
      'Custom question answering',
      'Complex aspect pattern interpretation'
    ],
    tier: 'elite'
  },
  pdfExport: {
    title: 'PDF Export',
    description: 'Generate professional-quality chart reports and interpretations that you can save, print, or share.',
    examples: [
      'Complete natal chart reports',
      'Synastry analysis documents',
      'Professional presentation format',
      'Shareable with astrologers or friends'
    ],
    tier: 'premium'
  }
};

export type SubscriptionTierType = 'free' | 'premium' | 'elite';
export type FeatureName = keyof FeatureAccess;
export type UsageLimitType = 'chartsPerMonth' | 'chartStorage' | 'synastryAnalyses' | 'aiQueries';

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

export const getTierLimits = (
  userTier: string,
  limitType: keyof SubscriptionTier['limits']
): number | undefined => {
  return COSMICHUB_TIERS[userTier]?.limits[limitType];
};

export const calculateYearlySavings = (monthly: number, yearly: number): number => {
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
};
