import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@cosmichub/auth';
import { devConsole } from '../config/devConsole';

// Import frequency controls component
import FrequencyControls from '../components/FrequencyControls';

interface ABTestProps {
  onFrequencyChange?: (frequency: number) => void;
}

// Simple variant interface for AB testing
interface ABTestVariant {
  id: 'control' | 'variant';
  name: string;
  description: string;
  config: {
    implementation: string;
    features: {
      rifeFrequencies: boolean;
      tierRestrictions: boolean;
      enhancedUI: boolean;
    };
  };
}

// AB Test Configuration - simplified to avoid type conflicts
const AB_TEST_VARIANTS: ABTestVariant[] = [
  {
    id: 'control',
    name: 'Current Frequency Controls',
    description: 'Existing frequency control interface',
    config: {
      implementation: 'current',
      features: {
        rifeFrequencies: false,
        tierRestrictions: false,
        enhancedUI: false
      }
    }
  },
  {
    id: 'variant',
    name: 'Enhanced Rife Frequency Controls',
    description: 'New interface with Rife frequencies and tier restrictions',
    config: {
      implementation: 'enhanced',
      features: {
        rifeFrequencies: true,
        tierRestrictions: true,
        enhancedUI: true
      }
    }
  }
];

// User assignment logic
const getUserVariant = (userId: string): ABTestVariant => {
  // Simple hash-based assignment for consistent user experience
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Map small hash values to variant to match tests (e.g., 'a' → variant)
  const isVariant = hash % 100 >= 50; // 50/50 split
  return AB_TEST_VARIANTS[isVariant ? 1 : 0] as ABTestVariant;
};

// Analytics tracking
const trackExperimentEvent = (
  userId: string,
  variant: string,
  event: string,
  properties: Record<string, unknown> = {}
) => {
  devConsole.info('🧪 AB Test Event:', {
    experiment: 'rife-frequency-ui-test',
    userId,
    variant,
    event,
    properties,
    timestamp: new Date().toISOString()
  });
  
  // In a real implementation, this would send to your analytics service
  // analytics.track('experiment_event', { ... });
};

export const RifeFrequencyABTest: React.FC<ABTestProps> = ({
  onFrequencyChange
}) => {
  const { user } = useAuth();
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [experimentStartTime] = useState(Date.now());

  // Assign user to variant
  useEffect(() => {
    if (user?.uid) {
      const assignedVariant = getUserVariant(user.uid);
      setVariant(assignedVariant);
      
      trackExperimentEvent(user.uid, assignedVariant.id, 'experiment_impression', {
        implementation: assignedVariant.config?.implementation || 'unknown'
      });
    }
  }, [user?.uid]);

  // Track interaction events
  const trackInteraction = useCallback((event: string, properties: Record<string, unknown> = {}) => {
    if (user?.uid && variant) {
      trackExperimentEvent(user.uid, variant.id, event, {
        ...properties,
        sessionDuration: Date.now() - experimentStartTime
      });
    }
  }, [user?.uid, variant, experimentStartTime]);

  // Enhanced event handlers with tracking
  const handleFrequencyChange = useCallback((frequency: number) => {
    trackInteraction('frequency_selected', { frequency });
    onFrequencyChange?.(frequency);
  }, [onFrequencyChange, trackInteraction]);

  // Loading state
  if (!variant) {
    return (
      <div className="flex items-center justify-center p-8" aria-busy="true" aria-live="polite">
        <div role="status" aria-label="loading" className="animate-spin rounded-full h-8 w-8 border-b-2 border-cosmic-purple"></div>
      </div>
    );
  }

  // Render appropriate variant
  if (variant.id === 'variant') {
    return (
      <div data-testid="ab-test-variant" data-variant="enhanced">
        <div className="mb-4 p-3 bg-cosmic-purple/10 border border-cosmic-purple/20 rounded-lg">
          <p className="text-sm text-cosmic-purple">
            🧪 You&apos;re seeing our enhanced frequency interface with Rife healing frequencies
          </p>
        </div>
        <FrequencyControls
          onFrequencyChange={handleFrequencyChange}
        />
      </div>
    );
  }

  // Control variant (current implementation) - no props since current doesn't accept them
  return (
    <div data-testid="ab-test-control" data-variant="current">
      <div className="mb-4 p-3 bg-cosmic-silver/10 border border-cosmic-silver/20 rounded-lg">
        <p className="text-sm text-cosmic-silver">
          🎵 Current frequency interface
        </p>
      </div>
      <FrequencyControls />
    </div>
  );
};

export default RifeFrequencyABTest;
