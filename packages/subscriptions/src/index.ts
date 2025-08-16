// Unified subscription tiers & helpers (initial consolidation stage)
// NOTE: Some rich metadata for astro remains in apps/astro until refactor phase 2.

export interface BasicTierPrice { monthly: number; yearly: number; }

export interface HealwaveSubscriptionTier {
  id: string; name: string; price: BasicTierPrice; features: string[];
  limits: { sessionsPerDay?: number; sessionMaxDuration?: number };
  stripePriceIds: { monthly: string; yearly: string };
}

export interface AstroSubscriptionTier {
  name: string;
  description: string;
  icon: string;
  color: string;
  price: BasicTierPrice;
  features: string[];
  limits: { chartsPerMonth: number; chartStorage: number; synastryAnalyses: number; aiQueries: number };
  educationalInfo?: {
    bestFor: string[];
    keyBenefits: string[];
    examples: string[];
    upgradeReasons: string[];
  };
}

// HealWave tiers (source of truth migrated from apps/healwave & shared)
export const HEALWAVE_TIERS: Record<string, HealwaveSubscriptionTier> = {
  free: { id:'free', name:'Free', price:{monthly:0, yearly:0}, features:[
    '3 core binaural frequencies','20-minute session limit','2 sessions per day','Basic progress tracking','Standard audio quality'
  ], limits:{ sessionsPerDay:2, sessionMaxDuration:20*60 }, stripePriceIds:{ monthly:'', yearly:'' }},
  premium: { id:'premium', name:'HealWave Pro', price:{monthly:9.99, yearly:79.99}, features:[
    'All therapeutic frequencies (15+)','Unlimited sessions','50+ premium presets','Custom frequency builder','High-fidelity audio (320kbps)','Advanced progress tracking','Offline mode','Background sounds mixing','Sleep & wake programs','Export custom sessions'
  ], limits:{}, stripePriceIds:{ monthly:'price_healwave_pro_monthly', yearly:'price_healwave_pro_yearly' }},
  clinical: { id:'clinical', name:'HealWave Clinical', price:{monthly:49.99, yearly:499.99}, features:[
    'All Pro features','FDA-compliant protocols','Practitioner dashboard','Client management','White-label options','HIPAA compliance','Research database access','Priority clinical support'
  ], limits:{}, stripePriceIds:{ monthly:'price_healwave_clinical_monthly', yearly:'price_healwave_clinical_yearly' }}
};

// Full Astro tiers (consolidated from apps/astro/src/types/subscription.ts)
export const COSMICHUB_TIERS: Record<string, AstroSubscriptionTier> = {
  free: {
    name: 'Free Explorer',
    description: 'Perfect for beginners exploring astrology',
    icon: '👤',
    color: 'gray',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Basic birth chart calculation',
      'Western tropical astrology',
      'Planet positions and aspects',
      'House placements',
      'Basic chart interpretation',
      'Community support'
    ],
    limits: { chartsPerMonth: 3, chartStorage: 5, synastryAnalyses: 0, aiQueries: 0 },
    educationalInfo: {
      bestFor: [ 'Astrology beginners','Casual chart exploration','Learning basic concepts','Testing the platform' ],
      keyBenefits: [ 'No cost to start','Essential chart features','Learn astrology basics','Explore your natal chart' ],
      examples: [ 'Calculate your first birth chart','Understand your Sun, Moon, Rising','Explore house meanings','Learn about planetary aspects' ],
      upgradeReasons: [ 'Need more than 3 charts per month','Want to save more than 5 charts','Interested in advanced analysis','Seeking relationship compatibility' ]
    }
  },
  premium: {
    name: 'Cosmic Seeker',
    description: 'Advanced tools for serious astrology enthusiasts',
    icon: '🌟',
    color: 'purple',
    price: { monthly: 14.99, yearly: 149.99 },
    features: [
      'Everything in Free',
      'Unlimited chart calculations',
      'Unlimited chart storage',
      'Multi-system analysis',
      'Synastry compatibility',
      'Advanced house systems',
      'PDF export and sharing',
      'Email support',
      'Chart history and organization'
    ],
    limits: { chartsPerMonth: -1, chartStorage: -1, synastryAnalyses: 20, aiQueries: 0 },
    educationalInfo: {
      bestFor: [ 'Serious astrology students','Professional astrologers','Relationship analysis enthusiasts','Multi-cultural astrology explorers' ],
      keyBenefits: [ 'Unlimited chart calculations','Compare multiple astrological systems','Relationship compatibility analysis','Professional-grade features' ],
      examples: [ 'Calculate charts for entire family','Compare Western vs Vedic interpretations','Analyze romantic compatibility','Study Chinese Four Pillars astrology' ],
      upgradeReasons: [ 'Want AI-powered interpretations','Need transit analysis and timing','Require advanced predictive tools','Seek cutting-edge features' ]
    }
  },
  elite: {
    name: 'Cosmic Master',
    description: 'Complete astrological mastery suite with AI',
    icon: '👑',
    color: 'gold',
    price: { monthly: 29.99, yearly: 299.99 },
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
    limits: { chartsPerMonth: -1, chartStorage: -1, synastryAnalyses: -1, aiQueries: 100 },
    educationalInfo: {
      bestFor: [ 'Professional astrologers','Advanced practitioners','AI-assisted analysis seekers','Predictive astrology enthusiasts' ],
      keyBenefits: [ 'AI-powered deep analysis','Predictive timing capabilities','Cutting-edge astrological techniques','Unlimited access to all features' ],
      examples: [ 'Get AI analysis of complex aspects','Predict optimal timing for decisions','Explore Uranian midpoint techniques','Access latest astrological innovations' ],
      upgradeReasons: [ 'This is the ultimate plan','Includes every feature available','Perfect for professional use','Future-proof with new features' ]
    }
  }
};

export const FEATURE_TOOLTIPS: Record<string, {
  title: string; description: string; examples: string[]; tier: 'free' | 'premium' | 'elite';
}> = {
  basicCharts: {
    title: 'Basic Birth Charts',
    description: 'Calculate accurate natal charts using Western tropical astrology with essential planetary positions and aspects.',
    examples: [ 'Sun, Moon, Rising sign calculations','All planetary positions in signs and houses','Major aspects between planets','House cusps and angles' ],
    tier: 'free'
  },
  multiSystemAnalysis: {
    title: 'Multi-System Analysis',
    description: 'Compare insights from multiple astrological traditions including Western, Vedic, Chinese, and Mayan systems.',
    examples: [ 'Western tropical vs Vedic sidereal differences','Chinese Four Pillars analysis','Mayan sacred calendar insights','Integrated cross-cultural perspectives' ],
    tier: 'premium'
  },
  synastryAnalysis: {
    title: 'Synastry Compatibility',
    description: 'Analyze relationship dynamics by comparing two birth charts to understand compatibility and potential challenges.',
    examples: [ 'Romantic partner compatibility','Friendship dynamics analysis','Family relationship insights','Business partnership potential' ],
    tier: 'premium'
  },
  transitAnalysis: {
    title: 'Transit Analysis',
    description: 'Track current planetary movements and their effects on your natal chart for timing and predictive insights.',
    examples: [ 'Current life phase understanding','Optimal timing for important decisions','Challenge and opportunity periods','Personal growth cycles' ],
    tier: 'elite'
  },
  aiInterpretation: {
    title: 'AI Chart Interpretation',
    description: 'Advanced artificial intelligence analyzes complex chart patterns to provide personalized, nuanced interpretations.',
    examples: [ 'Deep personality analysis synthesis','Life purpose and career guidance','Custom question answering','Complex aspect pattern interpretation' ],
    tier: 'elite'
  },
  pdfExport: {
    title: 'PDF Export',
    description: 'Generate professional-quality chart reports and interpretations that you can save, print, or share.',
    examples: [ 'Complete natal chart reports','Synastry analysis documents','Professional presentation format','Shareable with astrologers or friends' ],
    tier: 'premium'
  }
};

export const calculateYearlySavings = (monthly:number, yearly:number) => Math.round(((monthly*12 - yearly)/(monthly*12))*100);
export const getUserTier = (subscription: { tier:string; status:string } | null) => (!subscription || subscription.status !== 'active') ? 'free' : subscription.tier;
export const hasFeatureAccess = (userTier:string, requiredTier:string, tiers:Record<string, any>) => {
  const order = Object.keys(tiers); return order.indexOf(userTier) >= order.indexOf(requiredTier);
};
export const getTierLimits = (tier: string, limit: keyof AstroSubscriptionTier['limits']) => COSMICHUB_TIERS[tier]?.limits[limit];

// Backwards compatibility named export (legacy code may look for COSMICHUB_BASIC_TIERS)
export { COSMICHUB_TIERS as COSMICHUB_BASIC_TIERS };
