// AB Test Configuration for Rife Frequency Interface
export const RIFE_FREQUENCY_EXPERIMENT_CONFIG = {
  id: 'rife-frequency-ui-test',
  name: 'Rife Frequency Interface Comparison',
  description: 'Compare current frequency controls vs enhanced Rife frequency interface with tier restrictions',
  status: 'active',
  duration_days: 14,
  
  variants: {
    control: {
      name: 'Current Frequency Controls',
      description: 'Existing frequency control interface',
      allocation: 50,
      features: {
        rifeFrequencies: false,
        tierRestrictions: false,
        enhancedUI: false
      }
    },
    variant: {
      name: 'Enhanced Rife Frequency Controls', 
      description: 'New interface with Rife frequencies and tier restrictions',
      allocation: 50,
      features: {
        rifeFrequencies: true,
        tierRestrictions: true,
        enhancedUI: true
      }
    }
  },
  
  metrics: {
    primary: 'frequency_engagement_rate',
    secondary: [
      'session_duration',
      'feature_discovery_rate', 
      'upgrade_conversion_rate',
      'user_satisfaction_score',
      'rife_frequency_usage',
      'premium_feature_attempts'
    ],
    success_criteria: {
      frequency_engagement_rate: { target: 0.15, direction: 'increase' },
      upgrade_conversion_rate: { target: 0.05, direction: 'increase' },
      session_duration: { target: 300, direction: 'increase' }, // 5 minutes
      feature_discovery_rate: { target: 0.3, direction: 'increase' }
    }
  }
} as const;
