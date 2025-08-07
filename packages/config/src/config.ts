/**
 * Application configuration management
 */

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  firebase: {
    projectId: string;
    apiKey: string;
    authDomain: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  features: {
    aiInterpretation: boolean;
    humanDesign: boolean;
    geneKeys: boolean;
    numerology: boolean;
    transits: boolean;
    multiSystem: boolean;
    healwaveIntegration: boolean;
  };
  subscription: {
    plans: Record<string, SubscriptionPlan>;
    trialDays: number;
    stripePublishableKey: string;
  };
  astro: {
    defaultLocation: {
      lat: number;
      lng: number;
      city: string;
      country: string;
    };
    ephemerisPath: string;
    calculationEngine: 'swiss' | 'nasa';
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  chartsLimit: number;
  aiCredits: number;
  priority: number;
}

// Default configuration
export const defaultConfig: AppConfig = {
  app: {
    name: 'CosmicHub',
    version: '1.0.0',
    environment: 'development',
    baseUrl: 'http://localhost:3000'
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 30000,
    retries: 3
  },
  firebase: {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
  },
  features: {
    aiInterpretation: true,
    humanDesign: true,
    geneKeys: true,
    numerology: true,
    transits: true,
    multiSystem: true,
    healwaveIntegration: true
  },
  subscription: {
    plans: {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: ['Basic Chart', 'Planet Positions', 'House Placements'],
        chartsLimit: 3,
        aiCredits: 0,
        priority: 1
      },
      basic: {
        id: 'basic',
        name: 'Basic',
        price: 9.99,
        interval: 'month',
        features: ['All Free Features', 'AI Interpretations', 'Saved Charts', 'Basic Transits'],
        chartsLimit: 25,
        aiCredits: 50,
        priority: 2
      },
      pro: {
        id: 'pro',
        name: 'Pro',
        price: 29.99,
        interval: 'month',
        features: ['All Basic Features', 'Human Design', 'Gene Keys', 'Advanced Transits', 'Multi-System Analysis'],
        chartsLimit: 100,
        aiCredits: 200,
        priority: 3
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        price: 99.99,
        interval: 'month',
        features: ['All Pro Features', 'Unlimited Charts', 'Priority Support', 'Advanced AI Analysis', 'Custom Reports'],
        chartsLimit: -1, // Unlimited
        aiCredits: 1000,
        priority: 4
      }
    },
    trialDays: 14,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
  },
  astro: {
    defaultLocation: {
      lat: 40.7128,
      lng: -74.0060,
      city: 'New York',
      country: 'USA'
    },
    ephemerisPath: '/backend/ephe/',
    calculationEngine: 'swiss'
  }
};

// Environment-specific configurations
const developmentConfig: Partial<AppConfig> = {
  app: {
    ...defaultConfig.app,
    environment: 'development',
    baseUrl: 'http://localhost:3000'
  },
  api: {
    ...defaultConfig.api,
    baseUrl: 'http://localhost:8000'
  }
};

const productionConfig: Partial<AppConfig> = {
  app: {
    ...defaultConfig.app,
    environment: 'production',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://cosmichub.app'
  },
  api: {
    ...defaultConfig.api,
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.cosmichub.app'
  }
};

const stagingConfig: Partial<AppConfig> = {
  app: {
    ...defaultConfig.app,
    environment: 'staging',
    baseUrl: 'https://staging.cosmichub.app'
  },
  api: {
    ...defaultConfig.api,
    baseUrl: 'https://staging-api.cosmichub.app'
  }
};

// Get configuration based on environment
export const getConfig = (): AppConfig => {
  const env = process.env.NODE_ENV || 'development';
  
  let envConfig: Partial<AppConfig> = {};
  
  switch (env) {
    case 'production':
      envConfig = productionConfig;
      break;
    case 'staging':
      envConfig = stagingConfig;
      break;
    default:
      envConfig = developmentConfig;
  }
  
  return {
    ...defaultConfig,
    ...envConfig
  };
};

// Export the current configuration
export const config = getConfig();

// Configuration validation
export const validateConfig = (config: AppConfig): boolean => {
  const requiredFields = [
    'app.name',
    'app.version',
    'api.baseUrl',
    'firebase.projectId'
  ];
  
  for (const field of requiredFields) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config as any);
    if (!value) {
      console.error(`Missing required config field: ${field}`);
      return false;
    }
  }
  
  return true;
};

// Feature flags
export const isFeatureEnabled = (feature: keyof AppConfig['features']): boolean => {
  return config.features[feature] || false;
};

// Subscription helpers
export const getSubscriptionPlan = (planId: string): SubscriptionPlan | null => {
  return config.subscription.plans[planId] || null;
};

export const getAllPlans = (): SubscriptionPlan[] => {
  return Object.values(config.subscription.plans).sort((a, b) => a.priority - b.priority);
};

export default config;
