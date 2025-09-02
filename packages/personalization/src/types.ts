import { z } from 'zod';

// User behavior tracking schemas
export const UserActionSchema = z.object({
  type: z.enum([
    'chart_generated',
    'transit_viewed',
    'synastry_calculated',
    'interpretation_read',
    'feature_used',
    'content_shared',
    'session_started',
    'session_ended',
  ]),
  timestamp: z.date(),
  userId: z.string(),
  sessionId: z.string(),
  metadata: z.record(z.any()).optional(),
  duration: z.number().optional(), // in milliseconds
  context: z.object({
    page: z.string(),
    feature: z.string(),
    userAgent: z.string().optional(),
    viewport: z
      .object({
        width: z.number(),
        height: z.number(),
      })
      .optional(),
  }),
});

export const UserPreferenceSchema = z.object({
  userId: z.string(),
  preferences: z.object({
    interpretationStyle: z.enum([
      'traditional',
      'modern',
      'psychological',
      'spiritual',
    ]),
    complexity: z.enum(['beginner', 'intermediate', 'advanced']),
    topics: z.array(
      z.enum([
        'birth_chart',
        'transits',
        'synastry',
        'progressions',
        'solar_return',
        'lunar_cycles',
        'career',
        'relationships',
        'spirituality',
      ])
    ),
    notificationFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']),
    preferredTimeOfDay: z.enum(['morning', 'afternoon', 'evening']),
    timezone: z.string(),
    language: z.string().default('en'),
  }),
  learningProfile: z.object({
    readingSpeed: z.enum(['slow', 'normal', 'fast']),
    visualLearner: z.boolean(),
    detailOriented: z.boolean(),
    explorationPattern: z.enum(['systematic', 'intuitive', 'goal-oriented']),
  }),
  engagementHistory: z.object({
    totalSessions: z.number(),
    averageSessionDuration: z.number(),
    favoriteFeatures: z.array(z.string()),
    completedGuidedTours: z.array(z.string()),
    lastActiveDate: z.date(),
  }),
});

export const PersonalizedInsightSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(['daily', 'transit', 'seasonal', 'milestone', 'recommendation']),
  title: z.string(),
  content: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.enum([
    'career',
    'relationships',
    'personal_growth',
    'spirituality',
    'health',
    'finance',
  ]),
  confidence: z.number().min(0).max(1), // AI confidence score
  personalizedFactors: z.array(z.string()), // what made this personalized
  actionItems: z.array(
    z.object({
      text: z.string(),
      type: z.enum(['explore', 'reflect', 'action', 'learn']),
      link: z.string().optional(),
    })
  ),
  validUntil: z.date(),
  createdAt: z.date(),
  viewedAt: z.date().optional(),
  engagedWith: z.boolean().default(false),
});

export const AdaptiveUIStateSchema = z.object({
  userId: z.string(),
  adaptations: z.object({
    layoutComplexity: z.enum(['minimal', 'standard', 'detailed']),
    navigationStyle: z.enum(['guided', 'freeform', 'expert']),
    contentDepth: z.enum(['overview', 'balanced', 'comprehensive']),
    visualDensity: z.enum(['spacious', 'normal', 'compact']),
    interactionStyle: z.enum(['tooltips', 'inline', 'discovery']),
  }),
  customizations: z.object({
    hiddenElements: z.array(z.string()),
    preferredWidgets: z.array(z.string()),
    dashboardLayout: z.record(z.any()),
    quickActions: z.array(z.string()),
  }),
  learningProgress: z.object({
    completedOnboarding: z.boolean(),
    masteredFeatures: z.array(z.string()),
    strugglingAreas: z.array(z.string()),
    suggestedNextSteps: z.array(z.string()),
  }),
  lastUpdated: z.date(),
});

export const LearningPatternSchema = z.object({
  userId: z.string(),
  patterns: z.object({
    peakActivityHours: z.array(z.number()), // hours 0-23
    sessionFrequency: z.number(), // sessions per week
    featureAdoptionSpeed: z.enum(['slow', 'normal', 'fast']),
    errorRecoveryStyle: z.enum(['help-seeking', 'trial-error', 'methodical']),
    informationProcessing: z.enum(['sequential', 'holistic', 'analytical']),
  }),
  adaptations: z.object({
    recommendedComplexity: z.enum(['beginner', 'intermediate', 'advanced']),
    suggestedFeatures: z.array(z.string()),
    personalizedTutorials: z.array(z.string()),
    adaptiveHints: z.boolean(),
  }),
  confidence: z.number().min(0).max(1),
  lastAnalyzed: z.date(),
});

// Type exports
export type UserAction = z.infer<typeof UserActionSchema>;
export type UserPreference = z.infer<typeof UserPreferenceSchema>;
export type PersonalizedInsight = z.infer<typeof PersonalizedInsightSchema>;
export type AdaptiveUIState = z.infer<typeof AdaptiveUIStateSchema>;
export type LearningPattern = z.infer<typeof LearningPatternSchema>;

// Type guards for runtime validation
export const isUserAction = (value: unknown): value is UserAction => {
  return UserActionSchema.safeParse(value).success;
};

export const isUserPreference = (value: unknown): value is UserPreference => {
  return UserPreferenceSchema.safeParse(value).success;
};

export const isPersonalizedInsight = (
  value: unknown
): value is PersonalizedInsight => {
  return PersonalizedInsightSchema.safeParse(value).success;
};

export const isAdaptiveUIState = (value: unknown): value is AdaptiveUIState => {
  return AdaptiveUIStateSchema.safeParse(value).success;
};

export const isLearningPattern = (value: unknown): value is LearningPattern => {
  return LearningPatternSchema.safeParse(value).success;
};
