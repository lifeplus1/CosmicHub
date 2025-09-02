// packages/types/src/spiritual-ai.ts
/**
 * SPIRITUAL-001: Advanced AI Enhancement Types
 * TypeScript interfaces for Grok's AI algorithms
 */

export enum SpiritualLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  MASTER = 'master',
}

export interface SynthesisInput {
  birth_data: {
    planets?: Array<{
      name: string;
      strength: number;
      sign?: string;
      house?: number;
    }>;
    life_path: number;
    transits?: Array<{
      planet: string;
      aspect: string;
      orb: number;
      timing?: string;
    }>;
    chinese_elements?: string[];
    user_level?: string;
  };
  spiritual_systems: {
    kabbalah?: {
      elements: string[];
      active_sephirot?: string[];
    };
    tarot?: {
      active_cards?: string[];
      spreads?: string[];
    };
  };
}

export interface SynthesisOutput {
  themes: string[];
  recommendations: Array<{
    path: string;
    practice: string;
    explanation: string;
  }>;
  confidence_score: number;
  synthesis_type: string;
}

export interface LearningPath {
  level: string;
  modules: string[];
  estimated_duration: number; // minutes
  prerequisites: string[];
  practices: string[];
}

export interface PatternAnalysis {
  recurring_themes: string[];
  development_cycles: Array<{
    type: string;
    start_date?: string;
    indicators: string[];
  }>;
  crisis_indicators: string[];
  awakening_signals: string[];
  confidence_level: number;
}

export interface UserProfile {
  spiritual_interests: string[];
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  available_time_minutes: number;
  experience_level: SpiritualLevel;
  current_practices: string[];
}

export interface CurrentKnowledge {
  tarot_familiarity: number; // 0-1 scale
  kabbalah_familiarity: number; // 0-1 scale
  practice_consistency: number; // 0-1 scale
  study_time_months: number;
}

export interface CorrespondenceWeight {
  name: string;
  traditional_strength: number;
  personal_relevance: number;
  temporal_factor: number;
  final_weight: number;
}

export interface SpiritualPractice {
  type: string;
  description: string;
  duration: string;
  frequency: string;
  difficulty_level: SpiritualLevel;
  required_materials?: string[];
  safety_notes?: string[];
}

export interface DevelopmentCycle {
  phase: 'foundation' | 'integration' | 'synthesis' | 'mastery';
  duration_weeks: number;
  focus_areas: string[];
  milestones: string[];
  challenges: string[];
}

export interface SpiritualTiming {
  optimal_days: string[];
  lunar_phase: string;
  seasonal_alignment: string;
  personal_cycle_position: number;
  next_significant_date?: string;
}

// Main AI service interface following Grok's recommendations
export interface SpiritualAIService {
  // Cross-system synthesis
  synthesizeThemes(input: SynthesisInput): Promise<SynthesisOutput>;

  // Progressive learning
  createLearningPath(
    userProfile: UserProfile,
    currentKnowledge: CurrentKnowledge
  ): Promise<LearningPath>;

  // Dynamic weighting
  calculateCorrespondenceWeights(
    correspondences: Array<{
      name: string;
      type: string;
      traditional_strength: number;
    }>,
    context: {
      user_profile: UserProfile;
      birth_data: SynthesisInput['birth_data'];
      current_transits: any[];
    }
  ): Promise<Record<string, number>>;

  // Pattern recognition
  analyzePatterns(
    userHistory: Array<{
      date: string;
      themes: string[];
      practices: string[];
      insights: string[];
    }>,
    currentAnalysis: {
      transits: any[];
      spiritual_focus: string[];
      life_events: string[];
    }
  ): Promise<PatternAnalysis>;

  // Practice recommendations
  generatePractices(
    themes: string[],
    userLevel: SpiritualLevel,
    availableTime: number
  ): Promise<SpiritualPractice[]>;

  // Timing optimization
  calculateOptimalTiming(
    birthData: SynthesisInput['birth_data'],
    practiceType: string
  ): Promise<SpiritualTiming>;
}

// Component props for React integration
export interface SpiritualSynthesisProps {
  birthData: SynthesisInput['birth_data'];
  onSynthesisComplete: (result: SynthesisOutput) => void;
  userProfile?: UserProfile;
  showAdvancedOptions?: boolean;
}

export interface LearningPathProps {
  userProfile: UserProfile;
  currentKnowledge: CurrentKnowledge;
  onPathGenerated: (path: LearningPath) => void;
  allowCustomization?: boolean;
}

export interface PatternAnalysisProps {
  userHistory: Parameters<SpiritualAIService['analyzePatterns']>[0];
  currentAnalysis: Parameters<SpiritualAIService['analyzePatterns']>[1];
  onPatternsDetected: (patterns: PatternAnalysis) => void;
  visualizationMode?: 'timeline' | 'network' | 'chart';
}

// API response types
export interface SpiritualAIResponse<T> {
  success: boolean;
  data: T;
  confidence_score: number;
  processing_time_ms: number;
  recommendations?: string[];
  warnings?: string[];
}

// Error types
export interface SpiritualAIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}

// Configuration types
export interface SpiritualAIConfig {
  api_endpoint: string;
  timeout_ms: number;
  cache_duration_minutes: number;
  enable_pattern_caching: boolean;
  max_synthesis_complexity: number;
  safety_checks_enabled: boolean;
}

// Real-time update types for WebSocket integration
export interface SpiritualInsightUpdate {
  type: 'synthesis' | 'pattern' | 'practice' | 'timing';
  timestamp: string;
  user_id: string;
  data: SynthesisOutput | PatternAnalysis | SpiritualPractice | SpiritualTiming;
  priority: 'low' | 'medium' | 'high';
  expires_at?: string;
}

// Hook types for React integration
export interface UseSpiritualAI {
  synthesis: {
    data: SynthesisOutput | null;
    loading: boolean;
    error: SpiritualAIError | null;
    synthesize: (input: SynthesisInput) => Promise<void>;
  };

  learningPath: {
    data: LearningPath | null;
    loading: boolean;
    error: SpiritualAIError | null;
    generatePath: (
      profile: UserProfile,
      knowledge: CurrentKnowledge
    ) => Promise<void>;
  };

  patterns: {
    data: PatternAnalysis | null;
    loading: boolean;
    error: SpiritualAIError | null;
    analyzePatterns: (history: any[], current: any) => Promise<void>;
  };

  config: SpiritualAIConfig;
  isConnected: boolean;
}
