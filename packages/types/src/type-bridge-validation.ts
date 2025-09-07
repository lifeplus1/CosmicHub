/**
 * Type Bridge Validation Utilities
 * 
 * This module provides runtime validation for the Type Bridge System,
 * ensuring consistency between TypeScript types and runtime data.
 */

import { z } from 'zod';

// Zod schemas for existing Type Bridge types
export const ElementInfoSchema = z.object({
  element: z.enum(['wood', 'fire', 'earth', 'metal', 'water']),
  score: z.number().min(0).max(100),
  characteristics: z.array(z.string()),
  recommendations: z.array(z.string())
});

export const ElementalBalanceSchema = z.object({
  wood: z.number().min(0).max(100),
  fire: z.number().min(0).max(100),
  earth: z.number().min(0).max(100),
  metal: z.number().min(0).max(100),
  water: z.number().min(0).max(100)
});

export const HealthRecommendationSchema = z.object({
  category: z.enum(['diet', 'exercise', 'lifestyle', 'herbs', 'acupuncture', 'meditation']),
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  timeframe: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const TCMResponseSchema = z.object({
  dominant_element: z.string(),
  elemental_balance: ElementalBalanceSchema,
  element_info: z.record(ElementInfoSchema),
  constitution_type: z.string(),
  qi_flow_analysis: z.object({
    overall_flow: z.enum(['smooth', 'stagnant', 'excessive', 'deficient']),
    meridian_status: z.record(z.string()),
    blockages: z.array(z.string()),
    recommendations: z.array(z.string())
  }),
  seasonal_adjustments: z.object({
    current_season: z.string(),
    adjustments: z.array(z.string()),
    optimal_activities: z.array(z.string())
  }),
  confidence_score: z.number().min(0).max(1)
});

export const HealthRecommendationsResponseSchema = z.object({
  recommendations: z.array(HealthRecommendationSchema),
  summary: z.object({
    total_recommendations: z.number(),
    priority_breakdown: z.record(z.number()),
    categories_covered: z.array(z.string())
  }),
  personalization: z.object({
    user_profile_match: z.number().min(0).max(1),
    customization_factors: z.array(z.string())
  })
});

// Astrology specific schemas
export const PlanetPositionSchema = z.object({
  planet: z.string(),
  sign: z.string(),
  degree: z.number().min(0).max(360),
  house: z.number().min(1).max(12),
  retrograde: z.boolean()
});

export const AstrologyChartSchema = z.object({
  planets: z.array(PlanetPositionSchema),
  houses: z.array(z.object({
    house: z.number().min(1).max(12),
    sign: z.string(),
    degree: z.number()
  })),
  aspects: z.array(z.object({
    planet1: z.string(),
    planet2: z.string(),
    aspect: z.string(),
    orb: z.number()
  }))
});

// Component prop schemas
export const BaseComponentPropsSchema = z.object({
  className: z.string().optional(),
  children: z.any().optional(), // React.ReactNode
  id: z.string().optional(),
  'data-testid': z.string().optional()
});

// Analytics data validation schemas (Layer 1: Static Type Safety)
export const RealTimeMetricsSchema = z.object({
  realTimeUsers: z.number().min(0),
  chartCalculationsPerMinute: z.number().min(0),
  aiInteractionsPerHour: z.number().min(0),
  mobileAppSessions: z.number().min(0),
  subscriptionConversions: z.number().min(0),
  errorRate: z.number().min(0).max(1),
  averageResponseTime: z.number().min(0),
  averageSessionDurationMs: z.number().min(0)
});

export const AstrologyAnalyticsSchema = z.object({
  chartCalculations: z.object({
    natal: z.number().min(0),
    transit: z.number().min(0),
    synastry: z.number().min(0),
    composite: z.number().min(0),
    solar_return: z.number().min(0)
  }),
  aiFeatureUsage: z.object({
    predictiveTransits: z.number().min(0),
    aiQuestions: z.number().min(0),
    multiSystemSynthesis: z.number().min(0),
    growthCoaching: z.number().min(0),
    patternRecognition: z.number().min(0)
  }),
  userPreferences: z.object({
    favoriteChartTypes: z.array(z.string()),
    preferredAstrologySystem: z.enum(['western', 'vedic', 'chinese']),
    aiInteractionFrequency: z.number().min(0),
    averageSessionDuration: z.number().min(0)
  })
});

export const ConversionFunnelDataSchema = z.object({
  totalVisitors: z.number().min(0),
  signups: z.number().min(0),
  trialStarts: z.number().min(0),
  subscriptions: z.number().min(0),
  conversionRates: z.object({
    visitorToSignup: z.number().min(0).max(1),
    signupToTrial: z.number().min(0).max(1),
    trialToSubscription: z.number().min(0).max(1),
    visitorToSubscription: z.number().min(0).max(1)
  })
});

export const UserSegmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  criteria: z.record(z.union([z.string(), z.number(), z.boolean()])),
  users: z.number().min(0),
  conversionRate: z.number().min(0).max(1),
  averageLifetimeValue: z.number().min(0)
});

export const AnalyticsDashboardPropsSchema = BaseComponentPropsSchema.extend({
  apiEndpoint: z.string().url().optional(),
  refreshInterval: z.number().min(1000).optional(),
  className: z.string().optional()
});

export const SacredGeometryDemoPropsSchema = BaseComponentPropsSchema.extend({
  geometryType: z.enum(['flower-of-life', 'mandala', 'golden-ratio', 'platonic-solids']).optional(),
  animated: z.boolean().optional(),
  size: z.number().min(100).max(1000).optional(),
  onShapeClick: z.function().optional()
});

// Validation helper functions
export class TypeBridgeValidator {
  /**
   * Validate data against a schema with detailed error reporting
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown, context?: string): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          received: err.code === 'invalid_type' ? typeof data : 'invalid'
        }));
        
        console.error(`Type Bridge Validation Error${context ? ` in ${context}` : ''}:`, {
          errors: formattedErrors,
          data
        });
        
        throw new Error(`Validation failed${context ? ` for ${context}` : ''}: ${formattedErrors.map(e => `${e.path}: ${e.message}`).join(', ')}`);
      }
      throw error;
    }
  }

  /**
   * Safe validation that returns a result object instead of throwing
   */
  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return { success: false, error: errorMessage };
      }
      return { success: false, error: 'Unknown validation error' };
    }
  }

  /**
   * Create a typed API response validator
   */
  static createAPIValidator<T>(schema: z.ZodSchema<T>, endpoint: string) {
    return {
      validate: (data: unknown): T => this.validate(schema, data, `API endpoint ${endpoint}`),
      safeValidate: (data: unknown) => this.safeValidate(schema, data),
      schema
    };
  }

  /**
   * Create a component props validator
   */
  static createPropsValidator<T>(schema: z.ZodSchema<T>, componentName: string) {
    return {
      validate: (props: unknown): T => this.validate(schema, props, `${componentName} props`),
      safeValidate: (props: unknown) => this.safeValidate(schema, props),
      schema
    };
  }
}

// Pre-configured validators for common types
export const TCMValidator = TypeBridgeValidator.createAPIValidator(TCMResponseSchema, 'TCM Analysis');
export const HealthRecommendationsValidator = TypeBridgeValidator.createAPIValidator(HealthRecommendationsResponseSchema, 'Health Recommendations');
export const AstrologyValidator = TypeBridgeValidator.createAPIValidator(AstrologyChartSchema, 'Astrology Chart');

// Analytics validators (Layer 2: Runtime Validation)
export const RealTimeMetricsValidator = TypeBridgeValidator.createAPIValidator(RealTimeMetricsSchema, 'Real-Time Metrics');
export const AstrologyAnalyticsValidator = TypeBridgeValidator.createAPIValidator(AstrologyAnalyticsSchema, 'Astrology Analytics');
export const ConversionFunnelValidator = TypeBridgeValidator.createAPIValidator(ConversionFunnelDataSchema, 'Conversion Funnel');
export const UserSegmentValidator = TypeBridgeValidator.createAPIValidator(UserSegmentSchema, 'User Segment');

// Component validators
export const AnalyticsDashboardValidator = TypeBridgeValidator.createPropsValidator(AnalyticsDashboardPropsSchema, 'AnalyticsDashboard');
export const SacredGeometryDemoValidator = TypeBridgeValidator.createPropsValidator(SacredGeometryDemoPropsSchema, 'SacredGeometryDemo');

// Type guards for runtime type checking
export const isElementInfo = (value: unknown): value is z.infer<typeof ElementInfoSchema> => {
  return ElementInfoSchema.safeParse(value).success;
};

export const isTCMResponse = (value: unknown): value is z.infer<typeof TCMResponseSchema> => {
  return TCMResponseSchema.safeParse(value).success;
};

export const isHealthRecommendationsResponse = (value: unknown): value is z.infer<typeof HealthRecommendationsResponseSchema> => {
  return HealthRecommendationsResponseSchema.safeParse(value).success;
};

// Analytics type guards (Layer 3: Type Safety Guards)
export const isRealTimeMetrics = (value: unknown): value is z.infer<typeof RealTimeMetricsSchema> => {
  return RealTimeMetricsSchema.safeParse(value).success;
};

export const isAstrologyAnalytics = (value: unknown): value is z.infer<typeof AstrologyAnalyticsSchema> => {
  return AstrologyAnalyticsSchema.safeParse(value).success;
};

export const isConversionFunnelData = (value: unknown): value is z.infer<typeof ConversionFunnelDataSchema> => {
  return ConversionFunnelDataSchema.safeParse(value).success;
};

export const isUserSegment = (value: unknown): value is z.infer<typeof UserSegmentSchema> => {
  return UserSegmentSchema.safeParse(value).success;
};

// Utility types for better type inference
export type ValidatedTCMResponse = z.infer<typeof TCMResponseSchema>;
export type ValidatedHealthRecommendations = z.infer<typeof HealthRecommendationsResponseSchema>;
export type ValidatedAstrologyChart = z.infer<typeof AstrologyChartSchema>;
export type ValidatedAnalyticsDashboardProps = z.infer<typeof AnalyticsDashboardPropsSchema>;
export type ValidatedSacredGeometryDemoProps = z.infer<typeof SacredGeometryDemoPropsSchema>;

// Analytics validated types (Layer 4: Descriptive Type Aliases)
export type ValidatedRealTimeMetrics = z.infer<typeof RealTimeMetricsSchema>;
export type ValidatedAstrologyAnalytics = z.infer<typeof AstrologyAnalyticsSchema>;
export type ValidatedConversionFunnelData = z.infer<typeof ConversionFunnelDataSchema>;
export type ValidatedUserSegment = z.infer<typeof UserSegmentSchema>;

// Development utilities
export const createMockData = {
  tcmResponse: (): ValidatedTCMResponse => ({
    dominant_element: 'fire',
    elemental_balance: { wood: 20, fire: 85, earth: 60, metal: 40, water: 30 },
    element_info: {
      fire: {
        element: 'fire',
        score: 85,
        characteristics: ['energetic', 'passionate', 'warm'],
        recommendations: ['stay hydrated', 'practice cooling exercises']
      }
    },
    constitution_type: 'fire_dominant',
    qi_flow_analysis: {
      overall_flow: 'excessive',
      meridian_status: { heart: 'strong', liver: 'normal' },
      blockages: [],
      recommendations: ['meditation', 'gentle exercise']
    },
    seasonal_adjustments: {
      current_season: 'summer',
      adjustments: ['increase water intake'],
      optimal_activities: ['swimming', 'early morning exercise']
    },
    confidence_score: 0.87
  }),

  healthRecommendations: (): ValidatedHealthRecommendations => ({
    recommendations: [
      {
        category: 'diet',
        title: 'Cooling Foods',
        description: 'Incorporate cooling foods like cucumber and green tea',
        priority: 'high',
        timeframe: '2 weeks',
        tags: ['fire-element', 'cooling']
      }
    ],
    summary: {
      total_recommendations: 1,
      priority_breakdown: { high: 1 },
      categories_covered: ['diet']
    },
    personalization: {
      user_profile_match: 0.92,
      customization_factors: ['fire_dominant', 'summer_season']
    }
  })
};

export default {
  TypeBridgeValidator,
  TCMValidator,
  HealthRecommendationsValidator,
  AstrologyValidator,
  RealTimeMetricsValidator,
  AstrologyAnalyticsValidator,
  ConversionFunnelValidator,
  UserSegmentValidator,
  AnalyticsDashboardValidator,
  SacredGeometryDemoValidator,
  createMockData,
  isElementInfo,
  isTCMResponse,
  isHealthRecommendationsResponse,
  isRealTimeMetrics,
  isAstrologyAnalytics,
  isConversionFunnelData,
  isUserSegment
};
