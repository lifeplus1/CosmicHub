import { z } from 'zod';

// Define proper types for chart data
interface ChartData {
  planets?: Record<string, unknown>;
  houses?: unknown[];
  aspects?: unknown[];
  [key: string]: unknown;
}

// Enhanced AI schemas for new features
const TransitAnalysisSchema = z.object({
  transitType: z.enum(['current', 'upcoming', 'past']),
  timeframe: z.enum(['week', 'month', 'quarter', 'year']),
  focusAreas: z.array(
    z.enum(['career', 'relationships', 'health', 'spirituality', 'finances'])
  ),
  timing: z
    .object({
      exactDate: z.string(),
      influence_period: z.object({
        start: z.string(),
        peak: z.string(),
        end: z.string(),
      }),
    })
    .optional(),
});

const ChatQuestionSchema = z.object({
  question: z.string().min(5).max(1000),
  context: z.object({
    chartData: z.record(z.unknown()).optional(),
    previousMessages: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      )
      .optional(),
    userProfile: z
      .object({
        birthDate: z.string(),
        birthTime: z.string(),
        birthLocation: z.string(),
      })
      .optional(),
  }),
});

const MultiSystemSynthesisSchema = z.object({
  systems: z.array(z.enum(['western', 'vedic', 'chinese', 'mayan', 'uranian'])),
  synthesisType: z.enum([
    'personality',
    'life_path',
    'relationships',
    'career',
    'spiritual',
  ]),
  chartData: z.record(z.unknown()),
  depth: z.enum(['basic', 'intermediate', 'advanced']),
});

const PersonalGrowthSchema = z.object({
  growthArea: z.enum([
    'emotional_intelligence',
    'leadership',
    'creativity',
    'relationships',
    'spiritual_development',
  ]),
  currentChallenges: z.array(z.string()),
  goals: z.array(z.string()),
  timeframe: z.enum(['immediate', 'short_term', 'long_term']),
  chartData: z.record(z.unknown()),
});

const PatternRecognitionSchema = z.object({
  chartCollection: z.array(z.record(z.unknown())),
  patternTypes: z.array(
    z.enum(['personality', 'life_events', 'relationships', 'career', 'health'])
  ),
  analysisDepth: z.enum(['surface', 'deep', 'comprehensive']),
  userId: z.string(),
});

  timeframe: 'week' | 'month' | 'quarter' | 'year';
  focusAreas: Array<
    'career' | 'relationships' | 'health' | 'spirituality' | 'finances'
  >;
  chartData: ChartData;
  birthData: {
    date: string;
    time: string;
    location: string;
  };
}

  context: {
    chartData?: ChartData;
    previousMessages?: Array<{
      role: 'user' | 'assistant';
      content: string;
    }>;
    userProfile?: {
      birthDate: string;
      birthTime: string;
      birthLocation: string;
    };
  };
}

  synthesisType:
    | 'personality'
    | 'life_path'
    | 'relationships'
    | 'career'
    | 'spiritual';
  chartData: ChartData;
  depth: 'basic' | 'intermediate' | 'advanced';
}

  currentChallenges: string[];
  goals: string[];
  timeframe: 'immediate' | 'short_term' | 'long_term';
  chartData: ChartData;
}

  patternTypes: Array<
    'personality' | 'life_events' | 'relationships' | 'career' | 'health'
  >;
  analysisDepth: 'surface' | 'deep' | 'comprehensive';
  userId: string;
}

/**
 * Enhanced AI Service with Next-Generation Features
 * Implements AI-001: Advanced AI capabilities for astrology platform
 */
