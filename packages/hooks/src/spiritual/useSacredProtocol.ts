import { useState, useEffect, useCallback, useMemo } from 'react';

// Expert-recommended types for sacred geometry protocols
interface SacredProtocolState {
  isActive: boolean;
  currentProtocol: string | null;
  phase: 'preparation' | 'engagement' | 'integration' | 'completion';
  duration: number;
  breathCycle: number;
  cardinalDirection: 'north' | 'south' | 'east' | 'west' | null;
}

interface SacredProtocolConfig {
  enableBreathTimer: boolean;
  useCardinalDirections: boolean;
  preparationDuration: number; // seconds
  integrationDuration: number; // seconds
  enableAffirmations: boolean;
  enableMudraGuidance: boolean;
}

interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  breathCount?: number;
  affirmation?: string;
  mudra?: string;
  cardinalAlignment?: boolean;
}

// Expert-specified traditional protocols
const SACRED_PROTOCOLS: Record<string, ProtocolStep[]> = {
  'golden-ratio-meditation': [
    {
      id: 'preparation',
      title: 'Sacred Space Preparation',
      description: 'Align yourself with cardinal directions and set intention',
      duration: 60,
      cardinalAlignment: true,
      affirmation: 'I align with the sacred geometry of creation'
    },
    {
      id: 'breath-centering',
      title: 'Phi Breath Centering',
      description: 'Breathe in golden ratio rhythm (1.618 seconds in, 1 second out)',
      duration: 120,
      breathCount: 21,
      mudra: 'Gyan Mudra (thumb and index finger touching)'
    },
    {
      id: 'geometry-visualization',
      title: 'Sacred Geometry Visualization',
      description: 'Visualize the golden spiral expanding from your heart center',
      duration: 300,
      affirmation: 'I am connected to the infinite spiral of creation'
    },
    {
      id: 'integration',
      title: 'Integration and Gratitude',
      description: 'Integrate the experience with gratitude',
      duration: 60,
      affirmation: 'I carry this sacred wisdom with me'
    }
  ],
  'elemental-balance': [
    {
      id: 'grounding',
      title: 'Earth Grounding',
      description: 'Connect with the stability of the cube and earth element',
      duration: 90,
      cardinalAlignment: true,
      mudra: 'Prithvi Mudra (thumb and ring finger touching)'
    },
    {
      id: 'flow-activation',
      title: 'Elemental Flow Activation',
      description: 'Move through the five elements with corresponding sacred shapes',
      duration: 240,
      breathCount: 25
    },
    {
      id: 'integration',
      title: 'Elemental Integration',
      description: 'Integrate all five elements in harmony',
      duration: 90,
      affirmation: 'All elements flow in perfect balance within me'
    }
  ],
  'mandala-journey': [
    {
      id: 'center-point',
      title: 'Finding the Center',
      description: 'Connect with your inner center point',
      duration: 60,
      mudra: 'Anjali Mudra (prayer position)'
    },
    {
      id: 'spiral-expansion',
      title: 'Spiral Expansion',
      description: 'Expand awareness in sacred spiral patterns',
      duration: 180,
      breathCount: 18
    },
    {
      id: 'return-to-center',
      title: 'Return to Center',
      description: 'Return to center with expanded awareness',
      duration: 60,
      affirmation: 'I am centered in the sacred geometry of being'
    }
  ]
};

// Default configuration based on expert recommendations
const DEFAULT_CONFIG: SacredProtocolConfig = {
  enableBreathTimer: true,
  useCardinalDirections: true,
  preparationDuration: 60,
  integrationDuration: 60,
  enableAffirmations: true,
  enableMudraGuidance: true
};

export interface UseSacredProtocolOptions {
  config?: Partial<SacredProtocolConfig>;
  onPhaseChange?: (phase: SacredProtocolState['phase']) => void;
  onProtocolComplete?: (protocolId: string) => void;
  enableDeviceCompass?: boolean;
}

export const useSacredProtocol = (options: UseSacredProtocolOptions = {}) => {
  const [state, setState] = useState<SacredProtocolState>({
    isActive: false,
    currentProtocol: null,
    phase: 'preparation',
    duration: 0,
    breathCycle: 0,
    cardinalDirection: null
  });

  const [currentStep, setCurrentStep] = useState<ProtocolStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);

  const config = { ...DEFAULT_CONFIG, ...options.config };

  // Cardinal direction detection (basic implementation)
  const detectCardinalDirection = useCallback(() => {
    if (!config.useCardinalDirections || !options.enableDeviceCompass) return;
    
    // In a real implementation, this would use the device compass
    // For now, we'll simulate or ask the user to align manually
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((_position) => {
        // Basic cardinal direction simulation
        const directions: SacredProtocolState['cardinalDirection'][] = ['north', 'south', 'east', 'west'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        setState(prev => ({ ...prev, cardinalDirection: randomDirection ?? null }));
      });
    }
  }, [config.useCardinalDirections, options.enableDeviceCompass]);

  // Start a sacred geometry protocol
  const startProtocol = useCallback((protocolId: keyof typeof SACRED_PROTOCOLS) => {
    const protocol = SACRED_PROTOCOLS[protocolId];
    if (!protocol || protocol.length === 0) {
      console.warn(`Sacred protocol '${protocolId}' not found or empty`);
      return;
    }

    setState(prev => ({
      ...prev,
      isActive: true,
      currentProtocol: protocolId,
      phase: 'preparation',
      duration: 0,
      breathCycle: 0
    }));

    setCurrentStep(protocol[0] ?? null);
    setStepIndex(0);
    setRemainingTime(protocol[0]?.duration ?? 0);
    setBreathTimer(0);

    detectCardinalDirection();
    options.onPhaseChange?.('preparation');
  }, [detectCardinalDirection, options]);

  // Stop the current protocol
  const stopProtocol = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentProtocol: null,
      phase: 'preparation',
      duration: 0,
      breathCycle: 0,
      cardinalDirection: null
    }));

    setCurrentStep(null);
    setStepIndex(0);
    setRemainingTime(0);
    setBreathTimer(0);
  }, []);

  // Move to next step in protocol
  const nextStep = useCallback(() => {
    if (!state.currentProtocol) return;

    const protocol = SACRED_PROTOCOLS[state.currentProtocol];
    if (!protocol) return;
    
    const nextIndex = stepIndex + 1;

    if (nextIndex >= protocol.length) {
      // Protocol complete
      setState(prev => ({ ...prev, phase: 'completion' }));
      options.onPhaseChange?.('completion');
      if (state.currentProtocol) {
        options.onProtocolComplete?.(state.currentProtocol);
      }
      
      // Auto-stop after completion phase
      setTimeout(() => {
        stopProtocol();
      }, 3000);
      return;
    }

    const nextStepData = protocol[nextIndex];
    if (!nextStepData) return;
    
    setCurrentStep(nextStepData);
    setStepIndex(nextIndex);
    setRemainingTime(nextStepData.duration);

    // Update phase based on step
    if (nextIndex === 0) {
      setState(prev => ({ ...prev, phase: 'preparation' }));
      options.onPhaseChange?.('preparation');
    } else if (nextIndex === protocol.length - 1) {
      setState(prev => ({ ...prev, phase: 'integration' }));
      options.onPhaseChange?.('integration');
    } else {
      setState(prev => ({ ...prev, phase: 'engagement' }));
      options.onPhaseChange?.('engagement');
    }
  }, [state.currentProtocol, stepIndex, options, stopProtocol]);

  // Breath cycle management
  const advanceBreathCycle = useCallback(() => {
    if (!config.enableBreathTimer || !currentStep?.breathCount) return;

    setState(prev => ({
      ...prev,
      breathCycle: prev.breathCycle + 1
    }));

    // Auto-advance step when breath count is reached
    if (state.breathCycle + 1 >= currentStep.breathCount) {
      nextStep();
    }
  }, [config.enableBreathTimer, currentStep, state.breathCycle, nextStep]);

  // Timer management
  useEffect(() => {
    if (!state.isActive || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          nextStep();
          return 0;
        }
        return prev - 1;
      });

      setState(prev => ({
        ...prev,
        duration: prev.duration + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isActive, remainingTime, nextStep]);

  // Breath timer (for golden ratio breathing)
  useEffect(() => {
    if (!config.enableBreathTimer || !state.isActive) return;

    const breathInterval = setInterval(() => {
      setBreathTimer(prev => prev + 0.1);
    }, 100);

    return () => clearInterval(breathInterval);
  }, [config.enableBreathTimer, state.isActive]);

  // Get available protocols
  const availableProtocols = Object.keys(SACRED_PROTOCOLS);

  // Get current protocol steps
  const protocolSteps = state.currentProtocol ? SACRED_PROTOCOLS[state.currentProtocol] ?? [] : [];

  // Calculate progress
  const progress = protocolSteps.length > 0 ? (stepIndex / protocolSteps.length) * 100 : 0;

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Breath guidance for golden ratio rhythm
  const breathGuidance = useMemo(() => {
    if (!config.enableBreathTimer || !state.isActive) return null;

    const goldenRatio = 1.618;
    const breathCycleLength = goldenRatio + 1; // ~2.618 seconds total
    const cycleProgress = breathTimer % breathCycleLength;
    
    if (cycleProgress < goldenRatio) {
      return {
        phase: 'inhale' as const,
        progress: cycleProgress / goldenRatio,
        instruction: 'Breathe in with the golden ratio'
      };
    } else {
      return {
        phase: 'exhale' as const,
        progress: (cycleProgress - goldenRatio) / 1,
        instruction: 'Breathe out in natural rhythm'
      };
    }
  }, [config.enableBreathTimer, state.isActive, breathTimer]);

  return {
    // State
    state,
    currentStep,
    remainingTime,
    progress,
    breathGuidance,
    
    // Actions
    startProtocol,
    stopProtocol,
    nextStep,
    advanceBreathCycle,
    
    // Data
    availableProtocols,
    protocolSteps,
    config,
    
    // Utilities
    formatTime
  };
};

export default useSacredProtocol;
