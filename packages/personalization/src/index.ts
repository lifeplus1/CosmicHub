/**
 * Personalization Package - AI-002 Phase 6B/6C Integration
 * Comprehensive bridge to existing spiritual AI systems for personalized user experiences
 */

// Import types first for utility functions
import type { SpiritualLevel, LearningStage } from './types/spiritual-types';

// Type definitions
export type {
  SpiritualLevel,
  LearningStage,
  SpiritualUserProfile,
  LearningPath,
  PersonalizedCurriculum,
  AdaptiveUIConfig,
} from './types/spiritual-types';

// Core API bridge service
export { PersonalizationBridge } from './spiritual-ai-bridge';

// React hooks for spiritual AI integration
export {
  useSpiritualProfile,
  useLearningPath,
  usePersonalizedCurriculum,
  useSpiritualAI,
} from './hooks/spiritual-ai-hooks';

// React components for adaptive UI
export {
  AdaptiveDashboard,
  PersonalizedWidget,
  LearningProgressTracker,
  SpiritualLevelBadge,
} from './components/adaptive-ui-components';

// Analytics tracking functions
export {
  trackSpiritualAIInteraction,
  trackSpiritualProgress,
  trackSpiritualSafety,
  trackDailyLessonEngagement,
  trackLearningPathUsage,
  trackCurriculumPersonalization,
  trackAdaptiveUIUsage,
  trackPatternAnalysis,
  trackMobileSpiritualAI,
} from './analytics/spiritual-analytics';

// CSS styles (import this in your app)
// import '@cosmichub/personalization/src/styles/adaptive-ui.css';

/**
 * Package Configuration
 */
export const PERSONALIZATION_CONFIG = {
  // API endpoints - these should match your backend spiritual AI services
  API_BASE_URL: process.env.SPIRITUAL_AI_API_URL || '/api/spiritual',

  // Feature flags
  FEATURES: {
    ADAPTIVE_UI: true,
    ANALYTICS_TRACKING: true,
    MOBILE_NOTIFICATIONS: true,
    ADVANCED_INSIGHTS: true,
    SAFETY_MONITORING: true,
  },

  // Spiritual AI backend endpoints
  ENDPOINTS: {
    SPIRITUAL_PROFILE: '/profile',
    LEARNING_PATH: '/learning-path',
    DAILY_LESSONS: '/daily-lessons',
    CURRICULUM: '/curriculum',
    PRACTICE_ASSESSMENT: '/practice-assessment',
    INSIGHTS: '/insights',
    SAFETY_CHECK: '/safety-check',
  },

  // UI complexity levels
  COMPLEXITY_LEVELS: ['minimal', 'standard', 'detailed'] as const,

  // Spiritual levels hierarchy
  SPIRITUAL_LEVELS: ['beginner', 'intermediate', 'advanced', 'master'] as const,

  // Learning stages progression
  LEARNING_STAGES: [
    'foundation',
    'integration',
    'synthesis',
    'mastery',
  ] as const,
} as const;

/**
 * Utility functions for personalization logic
 */
export const PersonalizationUtils = {
  /**
   * Determine UI complexity based on spiritual level
   */
  getComplexityForLevel: (
    level: SpiritualLevel
  ): 'minimal' | 'standard' | 'detailed' => {
    switch (level) {
      case 'beginner':
        return 'minimal';
      case 'intermediate':
        return 'standard';
      case 'advanced':
        return 'detailed';
      case 'master':
        return 'detailed';
      default:
        return 'standard';
    }
  },

  /**
   * Check if user should see advanced features
   */
  shouldShowAdvancedFeatures: (
    level: SpiritualLevel,
    stage: LearningStage
  ): boolean => {
    return (
      (level === 'advanced' || level === 'master') &&
      (stage === 'synthesis' || stage === 'mastery')
    );
  },

  /**
   * Get guidance level based on experience
   */
  getGuidanceLevel: (
    level: SpiritualLevel,
    experienceYears: number
  ): 'full' | 'minimal' | 'none' => {
    if (level === 'beginner' || experienceYears < 1) return 'full';
    if (level === 'intermediate' || experienceYears < 3) return 'minimal';
    return 'none';
  },

  /**
   * Calculate learning progress percentage
   */
  calculateProgress: (
    currentStage: LearningStage,
    completedMilestones: number,
    totalMilestones: number
  ): number => {
    const stageWeights = {
      foundation: 0.25,
      integration: 0.5,
      synthesis: 0.75,
      mastery: 1.0,
    };

    const stageProgress = stageWeights[currentStage];
    const milestoneProgress =
      totalMilestones > 0 ? (completedMilestones / totalMilestones) * 0.25 : 0;

    return Math.min(stageProgress + milestoneProgress, 1.0);
  },

  /**
   * Format stage name for display
   */
  formatStageName: (stage: LearningStage): string => {
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  },

  /**
   * Format level name for display
   */
  formatLevelName: (level: SpiritualLevel): string => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  },
};

/**
 * Integration checklist for developers
 */
export const INTEGRATION_CHECKLIST = {
  BACKEND_REQUIREMENTS: [
    'spiritual_ai_enhanced.py service running',
    'spiritual_educational_system.py accessible',
    'spiritual_safety_protocols.py configured',
    'API endpoints properly exposed',
    'Authentication middleware setup',
  ],

  FRONTEND_SETUP: [
    'Import CSS styles in root component',
    'Configure API base URL in environment',
    'Wrap app with spiritual AI providers',
    'Initialize analytics tracking',
    'Test responsive design on mobile',
  ],

  TESTING_POINTS: [
    'Profile data loading and error states',
    'Learning path generation for different levels',
    'Adaptive UI complexity changes',
    'Analytics event tracking',
    'Offline functionality (if enabled)',
  ],
} as const;

/**
 * Quick start example
 */
export const QUICK_START_EXAMPLE = `
// 1. Install and import
import { 
  AdaptiveDashboard, 
  useSpiritualProfile,
  PersonalizationUtils 
} from '@cosmichub/personalization';
import '@cosmichub/personalization/src/styles/adaptive-ui.css';

// 2. Use in your React component
function SpiritualApp() {
  const userId = 'user123';
  const { profile, loading } = useSpiritualProfile(userId);
  
  if (loading) return <div>Loading spiritual profile...</div>;
  
  return (
    <AdaptiveDashboard 
      userId={userId}
      complexity={PersonalizationUtils.getComplexityForLevel(profile?.spiritualLevel)}
    />
  );
}

// 3. Backend integration points:
// - spiritual_ai_enhanced.py: GET /api/spiritual/profile/{userId}
// - spiritual_educational_system.py: GET /api/spiritual/learning-path/{userId}  
// - spiritual_safety_protocols.py: POST /api/spiritual/safety-check
`;

// Legacy exports for backward compatibility (only include existing modules)
export {
  PersonalizationService,
  personalizationService,
} from './personalization-service';
export { UserBehaviorTracker } from './behavior-tracker';
export { PersonalizedInsightEngine } from './insight-engine';
export { AdaptiveUIManager } from './adaptive-ui';

// Legacy type exports
export type {
  UserAction,
  UserPreference,
  PersonalizedInsight,
  AdaptiveUIState,
  LearningPattern,
} from './types';

// Schema exports for validation
export {
  UserActionSchema,
  UserPreferenceSchema,
  PersonalizedInsightSchema,
  AdaptiveUIStateSchema,
  LearningPatternSchema,
  isUserAction,
  isUserPreference,
  isPersonalizedInsight,
  isAdaptiveUIState,
  isLearningPattern,
} from './types';

// Legacy React hooks (only include existing ones)
export { usePersonalization } from './hooks/usePersonalization';
