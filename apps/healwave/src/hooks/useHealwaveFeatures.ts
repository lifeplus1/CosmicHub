import { useMemo } from 'react';
import { useUnrestrictedSubscription } from '../providers/useUnrestrictedSubscription';

export interface FeatureRestriction {
  isAllowed: boolean;
  requiresUpgrade: boolean;
  requiredTier: 'premium' | 'clinical';
  message: string;
}

export interface HealwaveFeatures {
  // Audio Features
  unlimitedDuration: FeatureRestriction;
  highQualityAudio: FeatureRestriction;
  sessionRecording: FeatureRestriction;
  audioExport: FeatureRestriction;
  
  // Frequency Features
  advancedFrequencies: FeatureRestriction;
  customFrequencies: FeatureRestriction;
  rileFrequencies: FeatureRestriction;
  binauralBeats: FeatureRestriction;
  
  // Preset Features
  customPresets: FeatureRestriction;
  presetSharing: FeatureRestriction;
  presetExport: FeatureRestriction;
  
  // Clinical Features
  patientManagement: FeatureRestriction;
  practitionerDashboard: FeatureRestriction;
  hipaaCompliance: FeatureRestriction;
  whiteLabeling: FeatureRestriction;
  
  // General Features
  offlineMode: FeatureRestriction;
  prioritySupport: FeatureRestriction;
  progressTracking: FeatureRestriction;
}

export const useHealwaveFeatures = (): HealwaveFeatures => {
  const { userTier } = useUnrestrictedSubscription();
  
  // Development override: Check URL params for tier override
  const urlParams = new URLSearchParams(window.location.search);
  const tierOverride = urlParams.get('tier');
  
  const currentTier = (tierOverride ?? userTier?.toLowerCase() ?? 'free');
  
  return useMemo(() => {
    const createRestriction = (
      requiredTier: 'premium' | 'clinical',
      feature: string
    ): FeatureRestriction => {
      const tierHierarchy = ['free', 'premium', 'clinical'];
      const userLevel = tierHierarchy.indexOf(currentTier);
      const requiredLevel = tierHierarchy.indexOf(requiredTier);
      const isAllowed = userLevel >= requiredLevel;
      
      return {
        isAllowed,
        requiresUpgrade: !isAllowed,
        requiredTier,
        message: isAllowed 
          ? `${feature} is available`
          : `${feature} requires ${requiredTier} subscription`
      };
    };

    return {
      // Audio Features (Premium)
      unlimitedDuration: createRestriction('premium', 'Unlimited session duration'),
      highQualityAudio: createRestriction('premium', 'High-quality audio (320kbps)'),
      sessionRecording: createRestriction('premium', 'Session recording'),
      audioExport: createRestriction('premium', 'Audio export'),
      
      // Frequency Features (Premium)
      advancedFrequencies: createRestriction('premium', 'Advanced frequency library'),
      customFrequencies: createRestriction('premium', 'Custom frequency creation'),
      rileFrequencies: createRestriction('premium', 'Rife frequency database'),
      binauralBeats: createRestriction('premium', 'Advanced binaural beats'),
      
      // Preset Features (Premium)
      customPresets: createRestriction('premium', 'Custom preset creation'),
      presetSharing: createRestriction('premium', 'Preset sharing'),
      presetExport: createRestriction('premium', 'Preset export'),
      
      // Clinical Features (Clinical tier)
      patientManagement: createRestriction('clinical', 'Patient management'),
      practitionerDashboard: createRestriction('clinical', 'Practitioner dashboard'),
      hipaaCompliance: createRestriction('clinical', 'HIPAA compliance tools'),
      whiteLabeling: createRestriction('clinical', 'White-label options'),
      
      // General Features
      offlineMode: createRestriction('premium', 'Offline mode'),
      prioritySupport: createRestriction('premium', 'Priority support'),
      progressTracking: createRestriction('premium', 'Advanced progress tracking'),
    };
  }, [currentTier]);
};

// Usage limits for free tier
export const useUsageLimits = () => {
  const { userTier } = useUnrestrictedSubscription();
  
  return useMemo(() => {
    if (userTier !== 'free') {
      return {
        sessionDurationMinutes: -1, // Unlimited
        sessionsPerDay: -1, // Unlimited
        presetsAllowed: -1, // Unlimited
        frequenciesAllowed: -1 // Unlimited
      };
    }
    
    return {
      sessionDurationMinutes: 30, // 30 minute limit for free
      sessionsPerDay: 3, // 3 sessions per day for free
      presetsAllowed: 5, // 5 saved presets for free
      frequenciesAllowed: 10 // 10 basic frequencies for free
    };
  }, [userTier]);
};
