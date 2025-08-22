/**
 * Application configuration management
 */

// Define typed environment interfaces
interface ViteMetaEnv {
  readonly MODE?: string;
  readonly [key: string]: string | boolean | undefined;
}

interface NodeEnv {
  readonly NODE_ENV?: string;
  readonly [key: string]: string | undefined;
}

// Cross-runtime env accessor (works in Vite browser and Node)
const getViteEnv = (): ViteMetaEnv | undefined => {
  try {
    return typeof import.meta !== 'undefined' 
      ? (import.meta as { env?: ViteMetaEnv }).env 
      : undefined;
  } catch {
    return undefined;
  }
};

const getNodeEnv = (): NodeEnv | undefined => {
  try {
    return typeof globalThis !== 'undefined' && 'process' in globalThis 
      ? (globalThis as { process?: { env?: NodeEnv } }).process?.env 
      : undefined;
  } catch {
    return undefined;
  }
};

const viteEnv = getViteEnv();
const nodeEnv = getNodeEnv();

const getEnv = (key: string, fallback = ''): string => {
  const fromVite = viteEnv?.[key];
  const fromNode = nodeEnv?.[key];
  return String(fromVite ?? fromNode ?? fallback);
};

const MODE: string = String(viteEnv?.['MODE'] ?? nodeEnv?.['NODE_ENV'] ?? 'development');

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
    crossAppIntegration: boolean;
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
  baseUrl: getEnv('VITE_API_URL', 'http://localhost:8000'),
    timeout: 30000,
    retries: 3
  },
  firebase: {
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', ''),
  apiKey: getEnv('VITE_FIREBASE_API_KEY', ''),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', ''),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', ''),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
  appId: getEnv('VITE_FIREBASE_APP_ID', '')
  },
  features: {
    aiInterpretation: true,
    humanDesign: true,
    geneKeys: true,
    numerology: true,
    transits: true,
    multiSystem: true,
    healwaveIntegration: true,
    crossAppIntegration: true
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
  stripePublishableKey: getEnv('VITE_STRIPE_PUBLISHABLE_KEY', '')
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
  baseUrl: getEnv('VITE_APP_URL', 'https://cosmichub.app')
  },
  api: {
    ...defaultConfig.api,
  baseUrl: getEnv('VITE_API_URL', 'https://api.cosmichub.app')
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
  const env = MODE || 'development';
  
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
    // Safe nested property access with proper typing
    const path = field.split('.');
    let value: unknown = config;
    for (const key of path) {
      if (typeof value !== 'object' || value === null || !(key in value)) {
        value = undefined;
        break;
      }
      value = (value as Record<string, unknown>)[key];
    }
    
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

// App configuration helper
export const getAppConfig = (appName: string) => {
  return {
    ...config,
    app: {
      ...config.app,
      name: appName
    }
  };
};

// Subscription helpers
export const getSubscriptionPlan = (planId: string): SubscriptionPlan | null => {
  return config.subscription.plans[planId] ?? null;
};

export const getAllPlans = (): SubscriptionPlan[] => {
  return Object.values(config.subscription.plans).sort((a, b) => a.priority - b.priority);
};

export default config;
