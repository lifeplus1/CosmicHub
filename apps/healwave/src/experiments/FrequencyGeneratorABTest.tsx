import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@cosmichub/auth';
import { devConsole } from '../config/devConsole';

// Import frequency generator implementations
import { HealWaveFrequencyGeneratorUnrestricted } from '../components/FrequencyGeneratorUnrestricted';
import { EnhancedFrequencyGenerator } from '../components/EnhancedFrequencyGenerator';
import { EnhancedHealWave } from '../components/enhancements/EnhancedHealWave';
import FrequencyControls from '../components/FrequencyControls';

interface FrequencyGeneratorABTestProps {
  onFrequencyChange?: (frequency: number) => void;
  onVolumeChange?: (volume: number) => void;
  onDurationChange?: (duration: number) => void;
}

// Comprehensive A/B test variants for frequency generators
interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  config: {
    implementation: string;
    features: Record<string, boolean>;
    ui: {
      theme: string;
      animations: string;
      accessibility: string;
    };
  };
}

// A/B Test Configuration with 4 variants
const FREQUENCY_GENERATOR_VARIANTS: readonly ABTestVariant[] = [
  {
    id: 'control',
    name: 'Classic Frequency Generator',
    description: 'Original frequency generator with basic controls - no restrictions',
    component: HealWaveFrequencyGeneratorUnrestricted,
    config: {
      implementation: 'original',
      features: {
        d3Visualization: false,
        binauralBeats: false,
        sacredGeometry: false,
        tierRestrictions: false,
        customPresets: false,
        realTimeUpdates: false
      },
      ui: {
        theme: 'cosmic',
        animations: 'css',
        accessibility: 'basic'
      }
    }
  },
  {
    id: 'enhanced-controls',
    name: 'Enhanced Controls',
    description: 'Advanced controls with full access and custom presets',
    component: FrequencyControls,
    config: {
      implementation: 'enhanced-controls',
      features: {
        d3Visualization: false,
        binauralBeats: true,
        sacredGeometry: false,
        tierRestrictions: false,
        customPresets: true,
        realTimeUpdates: false
      },
      ui: {
        theme: 'cosmic',
        animations: 'css',
        accessibility: 'basic'
      }
    }
  },
  {
    id: 'd3-visualization',
    name: 'D3.js Visualization',
    description: 'Professional D3.js charts with real-time frequency visualization',
    component: EnhancedFrequencyGenerator,
    config: {
      implementation: 'd3-enhanced',
      features: {
        d3Visualization: true,
        binauralBeats: true,
        sacredGeometry: false,
        tierRestrictions: false,
        customPresets: false,
        realTimeUpdates: true
      },
      ui: {
        theme: 'cosmic',
        animations: 'framer-motion',
        accessibility: 'wcag-aa'
      }
    }
  },
  {
    id: 'sacred-geometry',
    name: 'Sacred Geometry',
    description: 'Spiritual interface with sacred geometry patterns and chakra alignment',
    component: EnhancedHealWave,
    config: {
      implementation: 'sacred-geometry',
      features: {
        d3Visualization: false,
        binauralBeats: true,
        sacredGeometry: true,
        tierRestrictions: false,
        customPresets: false,
        realTimeUpdates: false
      },
      ui: {
        theme: 'spiritual',
        animations: 'framer-motion',
        accessibility: 'basic'
      }
    }
  }
];

// Enhanced user assignment with consistent bucketing
const getUserVariant = (userId: string): ABTestVariant => {
  // Use consistent hash for user bucketing
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bucket = hash % 100;

  // 25% split for each variant
  const variantIndex = Math.min(
    bucket < 25 ? 0 : bucket < 50 ? 1 : bucket < 75 ? 2 : 3,
    FREQUENCY_GENERATOR_VARIANTS.length - 1
  );

  const selectedVariant = FREQUENCY_GENERATOR_VARIANTS[variantIndex];
  // Since we control the array and index calculation, this should never be undefined
  // but we include a safety check for robustness
  return selectedVariant as ABTestVariant;
};

// Comprehensive analytics tracking
const trackExperimentEvent = (
  userId: string,
  variant: ABTestVariant,
  event: string,
  properties: Record<string, unknown> = {}
) => {
  const experimentData = {
    experiment_id: 'frequency-generator-comparison',
    experiment_name: 'Frequency Generator UI Comparison',
    variant_id: variant.id,
    variant_name: variant.name,
    user_id: userId,
    timestamp: new Date().toISOString(),
    implementation: variant.config.implementation,
    features: variant.config.features,
    ui_theme: variant.config.ui.theme,
    ...properties
  };

  // Log to console for development (replace with actual analytics service)
  devConsole.info('🧪 Frequency Generator A/B Test:', {
    event,
    variant: variant.name,
    userId,
    properties: experimentData
  });

  // TODO: Integrate with actual analytics service
  // trackEvent('experiment_interaction', experimentData);
};

export const FrequencyGeneratorABTest: React.FC<FrequencyGeneratorABTestProps> = ({
  onFrequencyChange,
  onVolumeChange,
  onDurationChange
}) => {
  const { user } = useAuth();
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [experimentStartTime] = useState(Date.now());
  const [sessionInteractions, setSessionInteractions] = useState(0);

  // Assign user to variant
  useEffect(() => {
    if (user?.uid) {
      const assignedVariant = getUserVariant(user.uid);
      setVariant(assignedVariant);

      trackExperimentEvent(user.uid, assignedVariant, 'experiment_started', {
        session_start_time: experimentStartTime,
        user_agent: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  }, [user?.uid, experimentStartTime]);

  // Track session duration and interactions
  useEffect(() => {
    if (!variant || !user?.uid) return;

    const trackSessionEnd = () => {
      trackExperimentEvent(user.uid, variant, 'experiment_session_end', {
        session_duration: Date.now() - experimentStartTime,
        total_interactions: sessionInteractions,
        interactions_per_minute: sessionInteractions / ((Date.now() - experimentStartTime) / 60000)
      });
    };

    // Track on page unload
    window.addEventListener('beforeunload', trackSessionEnd);

    return () => {
      window.removeEventListener('beforeunload', trackSessionEnd);
      trackSessionEnd();
    };
  }, [variant, user?.uid, experimentStartTime, sessionInteractions]);

  // Enhanced event handlers with comprehensive tracking
  const trackInteraction = useCallback((event: string, properties: Record<string, unknown> = {}) => {
    if (user?.uid && variant) {
      setSessionInteractions(prev => prev + 1);
      trackExperimentEvent(user.uid, variant, event, {
        ...properties,
        session_duration: Date.now() - experimentStartTime,
        interaction_count: sessionInteractions + 1
      });
    }
  }, [user?.uid, variant, experimentStartTime, sessionInteractions]);

  const handleFrequencyChange = useCallback((frequency: number) => {
    trackInteraction('frequency_changed', {
      frequency_value: frequency,
      frequency_category: getFrequencyCategory(frequency)
    });
    onFrequencyChange?.(frequency);
  }, [onFrequencyChange, trackInteraction]);

  const handleVolumeChange = useCallback((volume: number) => {
    trackInteraction('volume_changed', {
      volume_percentage: volume,
      volume_category: volume > 75 ? 'high' : volume > 50 ? 'medium' : 'low'
    });
    onVolumeChange?.(volume);
  }, [onVolumeChange, trackInteraction]);

  const handleDurationChange = useCallback((duration: number) => {
    trackInteraction('duration_changed', {
      duration_minutes: duration,
      duration_category: duration > 30 ? 'long' : duration > 10 ? 'medium' : 'short'
    });
    onDurationChange?.(duration);
  }, [onDurationChange, trackInteraction]);

  // Track preset selections
  const handlePresetSelect = useCallback((preset: { name?: string; category?: string; baseFrequency?: number; frequency?: number }) => {
    trackInteraction('preset_selected', {
      preset_name: preset.name ?? 'unknown',
      preset_category: preset.category ?? 'unknown',
      preset_frequency: preset.baseFrequency ?? preset.frequency
    });
  }, [trackInteraction]);

  // Loading state
  if (!variant) {
    return (
      <div className="flex items-center justify-center p-8" aria-busy="true" aria-live="polite">
        <div role="status" aria-label="Assigning experiment variant" className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple mx-auto mb-4"></div>
          <p className="text-cosmic-silver">Preparing your personalized experience...</p>
        </div>
      </div>
    );
  }

  // Render appropriate variant with experiment indicators
  const Component = variant.component;

  return (
    <div
      data-testid={`ab-test-${variant.id}`}
      data-variant={variant.id}
      data-experiment="frequency-generator-comparison"
    >
      {/* Experiment indicator for development/testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-200">
                🧪 A/B Test: {variant.name}
              </p>
              <p className="text-xs text-purple-300 mt-1">
                {variant.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-400">
                Variant: {variant.id}
              </p>
              <p className="text-xs text-purple-400">
                Implementation: {variant.config.implementation}
              </p>
            </div>
          </div>

          {/* Feature flags */}
          <div className="mt-2 flex flex-wrap gap-1">
            {Object.entries(variant.config.features).map(([feature, enabled]) => (
              enabled && (
                <span
                  key={feature}
                  className="px-2 py-1 text-xs bg-purple-600/30 text-purple-200 rounded-full"
                >
                  {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              )
            ))}
          </div>

          {/* No Restrictions Notice */}
          <div className="mt-3 p-2 bg-green-900/30 border border-green-500/30 rounded">
            <div className="flex items-center space-x-2">
              <span className="text-green-300">✨</span>
              <p className="text-xs font-medium text-green-200">
                AB Test Mode: All subscription restrictions removed - Full premium access
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Render the component with enhanced props */}
      <Component
        onFrequencyChange={handleFrequencyChange}
        onVolumeChange={handleVolumeChange}
        onDurationChange={handleDurationChange}
        onPresetSelect={handlePresetSelect}
        // Pass through any variant-specific props
        {...(variant.id === 'd3-visualization' && {
          showVisualization: true,
          realTimeUpdates: true
        })}
        {...(variant.id === 'sacred-geometry' && {
          currentSettings: { volume: 50, duration: 10, fadeIn: 2, fadeOut: 2 }
        })}
      />

      {/* Session stats for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-900/50 border border-gray-700 rounded text-xs text-gray-400">
          Session: {Math.round((Date.now() - experimentStartTime) / 1000)}s |
          Interactions: {sessionInteractions} |
          Rate: {(sessionInteractions / ((Date.now() - experimentStartTime) / 60000)).toFixed(1)}/min
        </div>
      )}
    </div>
  );
};

// Helper function to categorize frequencies
const getFrequencyCategory = (frequency: number): string => {
  if (frequency < 50) return 'delta';
  if (frequency < 100) return 'theta';
  if (frequency < 200) return 'alpha';
  if (frequency < 1000) return 'beta';
  if (frequency < 2000) return 'gamma';
  return 'ultra-high';
};

export default FrequencyGeneratorABTest;
