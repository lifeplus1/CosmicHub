import { z } from 'zod';

// Types that bridge to existing spiritual AI systems in Phase 6C

// Learning stages from spiritual_educational_system.py
export const LearningStageSchema = z.enum([
  'foundation',
  'integration',
  'synthesis',
  'mastery',
]);
export type LearningStage = z.infer<typeof LearningStageSchema>;

// Spiritual levels from spiritual_safety_protocols.py
export const SpiritualLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'master',
]);
export type SpiritualLevel = z.infer<typeof SpiritualLevelSchema>;

// User profile structure that maps to spiritual AI backend
export const SpiritualUserProfileSchema = z.object({
  userId: z.string(),
  spiritualLevel: SpiritualLevelSchema,
  learningStage: LearningStageSchema,
  profile: z.object({
    spiritual_experience_years: z.number().default(0),
    practice_consistency: z
      .enum(['none', 'occasional', 'regular', 'daily'])
      .default('none'),
    knowledge_areas: z.array(z.string()).default([]),
    learning_preferences: z
      .array(z.enum(['visual', 'hands_on', 'discussion', 'reading']))
      .default(['visual']),
    spiritual_interests: z.array(z.string()).default([]),
    available_time_minutes: z.number().default(30),
    teaching_experience: z.boolean().default(false),
  }),
  preferences: z.object({
    interpretation_style: z
      .enum(['traditional', 'modern', 'psychological', 'spiritual'])
      .default('modern'),
    complexity: z
      .enum(['beginner', 'intermediate', 'advanced'])
      .default('beginner'),
    notification_frequency: z
      .enum(['none', 'daily', 'weekly'])
      .default('weekly'),
    preferred_time_of_day: z
      .enum(['morning', 'afternoon', 'evening'])
      .default('morning'),
  }),
  lastUpdated: z.date().default(() => new Date()),
});

export type SpiritualUserProfile = z.infer<typeof SpiritualUserProfileSchema>;

// Learning path from spiritual_ai_enhanced.py
export const LearningPathSchema = z.object({
  level: z.string(),
  modules: z.array(z.string()),
  estimated_duration: z.number(), // in days
  prerequisites: z.array(z.string()),
  practices: z.array(z.string()),
  personalized_recommendations: z.array(z.string()).optional(),
});

export type LearningPath = z.infer<typeof LearningPathSchema>;

// Daily lesson from spiritual_educational_system.py
export const PersonalizedLessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  stage: LearningStageSchema,
  dayNumber: z.number(),
  activities: z.array(
    z.object({
      type: z.enum(['reading', 'meditation', 'practice', 'reflection']),
      content: z.string(),
      duration_minutes: z.number(),
    })
  ),
  safetyNotes: z.array(z.string()).optional(),
  nextSteps: z.array(z.string()).optional(),
  generatedAt: z.date().default(() => new Date()),
});

export type PersonalizedLesson = z.infer<typeof PersonalizedLessonSchema>;

// Curriculum from spiritual_educational_system.py
export const PersonalizedCurriculumSchema = z.object({
  userId: z.string(),
  currentStage: LearningStageSchema,
  learningStyle: z.string(),
  curriculum: z.object({
    lessons: z.array(PersonalizedLessonSchema),
    assessments: z.array(
      z.object({
        type: z.enum(['knowledge', 'practice', 'understanding', 'integration']),
        content: z.string(),
        criteria: z.array(z.string()),
      })
    ),
    progressMilestones: z.array(z.string()),
  }),
  progressTracking: z.object({
    completedLessons: z.array(z.string()),
    currentProgress: z.number().min(0).max(1),
    timeSpent: z.number(), // minutes
    readinessForNextStage: z.boolean(),
  }),
  safetyProtocols: z.array(z.string()),
  createdAt: z.date(),
  lastUpdated: z.date(),
});

export type PersonalizedCurriculum = z.infer<
  typeof PersonalizedCurriculumSchema
>;

// Adaptive UI configuration based on spiritual level and learning progress
export const AdaptiveUIConfigSchema = z.object({
  userId: z.string(),
  spiritualLevel: SpiritualLevelSchema,
  uiAdaptations: z.object({
    showAdvancedFeatures: z.boolean(),
    complexityLevel: z.enum(['minimal', 'standard', 'detailed']),
    guidanceLevel: z.enum(['full', 'minimal', 'none']),
    safetyWarnings: z.boolean(),
    practiceReminders: z.boolean(),
  }),
  dashboardLayout: z.object({
    primaryWidgets: z.array(z.string()),
    hiddenSections: z.array(z.string()),
    quickActions: z.array(z.string()),
  }),
  personalization: z.object({
    favoriteTopics: z.array(z.string()),
    learningGoals: z.array(z.string()),
    practiceSchedule: z
      .object({
        frequency: z.string(),
        preferredTime: z.string(),
        duration: z.number(),
      })
      .optional(),
  }),
  lastUpdated: z.date(),
});

export type AdaptiveUIConfig = z.infer<typeof AdaptiveUIConfigSchema>;

// API response types for spiritual AI endpoints
export const SpiritualAIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  generatedAt: z.date().default(() => new Date()),
});

export type SpiritualAIResponse = z.infer<typeof SpiritualAIResponseSchema>;

// Pattern analysis from spiritual_ai_enhanced.py
export const PatternAnalysisSchema = z.object({
  userId: z.string(),
  patterns: z.object({
    recurring_themes: z.array(z.string()),
    development_cycles: z.array(
      z.object({
        phase: z.string(),
        characteristics: z.array(z.string()),
        duration: z.string().optional(),
      })
    ),
    crisis_indicators: z.array(z.string()),
    awakening_signals: z.array(z.string()),
  }),
  confidence_level: z.number().min(0).max(1),
  recommendations: z.array(z.string()),
  timeframe: z.object({
    analyzed_from: z.date(),
    analyzed_to: z.date(),
  }),
  generatedAt: z.date(),
});

export type PatternAnalysis = z.infer<typeof PatternAnalysisSchema>;

// Practice readiness assessment from spiritual_safety_protocols.py
export const PracticeReadinessSchema = z.object({
  userId: z.string(),
  practiceType: z.string(),
  assessment: z.object({
    ready: z.boolean(),
    level: SpiritualLevelSchema,
    warnings: z.array(z.string()),
    prerequisites: z.array(z.string()),
    recommendations: z.array(z.string()),
    safety_recommendations: z.array(z.string()),
  }),
  timeToReady: z.string().optional(),
  nextAssessment: z.date().optional(),
  assessedAt: z.date(),
});

export type PracticeReadiness = z.infer<typeof PracticeReadinessSchema>;

// Type guards for runtime validation
export const isSpiritualUserProfile = (
  value: unknown
): value is SpiritualUserProfile => {
  return SpiritualUserProfileSchema.safeParse(value).success;
};

export const isLearningPath = (value: unknown): value is LearningPath => {
  return LearningPathSchema.safeParse(value).success;
};

export const isPersonalizedLesson = (
  value: unknown
): value is PersonalizedLesson => {
  return PersonalizedLessonSchema.safeParse(value).success;
};

export const isPersonalizedCurriculum = (
  value: unknown
): value is PersonalizedCurriculum => {
  return PersonalizedCurriculumSchema.safeParse(value).success;
};

export const isAdaptiveUIConfig = (
  value: unknown
): value is AdaptiveUIConfig => {
  return AdaptiveUIConfigSchema.safeParse(value).success;
};
