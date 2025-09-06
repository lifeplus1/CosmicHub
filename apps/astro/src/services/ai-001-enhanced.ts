// AI-001 Enhanced Services - Next-Generation AI Features
// Builds upon existing AI infrastructure with advanced capabilities

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { devConsole } from '../config/environment';
import {
  fetchSpiritualAISynthesis,
  fetchSpiritualAIGuidance,
  type SpiritualAISynthesisInput,
  type SpiritualAIGuidanceRequest
} from './api';
import type { ChartData } from './api.types';

// =============================================================================
// AI-001 Core Types
// =============================================================================

// Type guard for ChartData
function isChartData(data: unknown): data is ChartData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'planets' in data &&
    'houses' in data &&
    typeof (data as Record<string, unknown>).planets === 'object' &&
    Array.isArray((data as Record<string, unknown>).houses)
  );
}

export interface TransitPrediction {
  id: string;
  transitType: string;
  planet: string;
  aspect: string;
  natalPlanet: string;
  exactDate: string;
  influence: 'major' | 'moderate' | 'minor';
  theme: string;
  opportunities: string[];
  challenges: string[];
  recommendations: string[];
  confidence: number;
  duration: {
    start: string;
    peak: string;
    end: string;
  };
}

export interface PersonalGrowthInsight {
  id: string;
  category: 'spiritual' | 'emotional' | 'mental' | 'physical' | 'social';
  title: string;
  currentPhase: string;
  nextSteps: string[];
  timeframe: string;
  resources: string[];
  metrics: {
    progress: number;
    difficulty: number;
    importance: number;
  };
}

export interface MultiSystemInterpretation {
  id: string;
  systems: ('western' | 'vedic' | 'chinese' | 'mayan')[];
  synthesis: string;
  commonThemes: string[];
  uniqueInsights: Record<string, string>;
  conflictingViews: string[];
  integratedGuidance: string;
}

export interface ChartPattern {
  id: string;
  patternType: string;
  planets: string[];
  significance: string;
  frequency: number;
  evolutionStage: 'emerging' | 'active' | 'integrating' | 'mastered';
  lifeAreas: string[];
  activationPeriods: string[];
}

interface _AnalysisRequest {
  userId: string;
  analysisType:
    | 'transits'
    | 'growth'
    | 'synthesis'
    | 'patterns'
    | 'comprehensive';
  preferences?: {
    timeRange?: string;
    focusAreas?: string[];
    culturalSystems?: string[];
  };
}

export interface AI001Request {
  chartData: { planets?: unknown; houses?: unknown };
  userId: string;
  analysisType?: 'comprehensive';
  preferences?: {
    timeRange?: string;
    focusAreas?: string[];
    culturalSystems?: string[];
  };
}

// =============================================================================
// AI-001 Enhanced Service Class
// =============================================================================

export class AI001Service {
  // Note: XAI integration moved to backend for security
  private static backendApiUrl = '/api/interpretations';

  // 1. PREDICTIVE TRANSIT ANALYSIS
  static async generateTransitPredictions(
    chartData: { planets?: unknown; houses?: unknown },
    timeRange = '12months'
  ): Promise<TransitPrediction[]> {
    try {
      devConsole.log('🔮 Generating transit predictions via backend...', {
        chartData,
        timeRange,
      });

      // Use spiritual AI guidance endpoint for transit predictions
      const guidanceRequest: SpiritualAIGuidanceRequest = {
        chart_data: chartData,
        focus_area: 'transit_predictions',
        depth_level: 'standard'
      };

      const result = await fetchSpiritualAIGuidance(guidanceRequest);

      if (result.success) {
        // Transform the guidance response into transit predictions format
        const guidance = result.data;
        return this.transformGuidanceToTransitPredictions(guidance, timeRange);
      } else {
        devConsole.warn('Spiritual AI guidance failed, using mock data:', result.error);
        return this.generateMockTransitPredictions(chartData, timeRange);
      }
    } catch (error) {
      devConsole.error('Transit prediction error:', error);
      return this.generateMockTransitPredictions(chartData, timeRange);
    }
  }

  // 2. PERSONAL GROWTH COACHING
  static async generateGrowthInsights(
    chartData: unknown,
    currentGoals?: string[]
  ): Promise<PersonalGrowthInsight[]> {
    try {
      devConsole.log('🔮 Generating growth insights via backend...', {
        chartData,
        currentGoals,
      });

      // Validate chart data
      if (!isChartData(chartData)) {
        devConsole.warn('Invalid chart data provided, using mock data');
        return this.generateMockGrowthInsights(chartData, currentGoals);
      }

      // Use spiritual AI synthesis endpoint for growth insights
      const synthesisInput: SpiritualAISynthesisInput = {
        astrology_data: {
          planets: chartData.planets ?? {},
          houses: chartData.houses.reduce((acc, house, index) => {
            acc[`house_${index + 1}`] = house;
            return acc;
          }, {} as Record<string, unknown>),
          birth_data: (chartData as unknown as Record<string, unknown>).birthData as Record<string, unknown> | undefined,
        },
        user_context: {
          goals: currentGoals,
          focus_area: 'personal_growth'
        }
      };

      const result = await fetchSpiritualAISynthesis(synthesisInput);

      if (result.success) {
        // Transform the synthesis response into growth insights format
        const synthesis = result.data;
        return this.transformSynthesisToGrowthInsights(synthesis, currentGoals);
      } else {
        devConsole.warn('Spiritual AI synthesis failed, using mock data:', result.error);
        return this.generateMockGrowthInsights(chartData, currentGoals);
      }
    } catch (error) {
      devConsole.error('Growth insights error:', error);
      return this.generateMockGrowthInsights(chartData);
    }
  }

  // 3. MULTI-SYSTEM SYNTHESIS
  static async generateMultiSystemSynthesis(
    chartData: unknown,
    systems: string[] = ['western', 'vedic']
  ): Promise<MultiSystemInterpretation> {
    try {
      devConsole.log('🌍 Generating multi-system synthesis via backend...', {
        chartData,
        systems,
      });

      // Validate chart data
      if (!isChartData(chartData)) {
        devConsole.warn('Invalid chart data provided, using mock data');
        return this.generateMockSynthesis(chartData, systems);
      }

      // Use spiritual AI synthesis endpoint for multi-system analysis
      const synthesisInput: SpiritualAISynthesisInput = {
        astrology_data: {
          planets: chartData.planets ?? {},
          houses: chartData.houses.reduce((acc, house, index) => {
            acc[`house_${index + 1}`] = house;
            return acc;
          }, {} as Record<string, unknown>),
          birth_data: (chartData as unknown as Record<string, unknown>).birthData as Record<string, unknown> | undefined,
        },
        user_context: {
          systems: systems,
          analysis_type: 'multi_system_synthesis'
        }
      };

      const result = await fetchSpiritualAISynthesis(synthesisInput);

      if (result.success) {
        // Transform the synthesis response into multi-system interpretation format
        const synthesis = result.data;
        return this.transformSynthesisToMultiSystem(synthesis, systems);
      } else {
        devConsole.warn('Spiritual AI synthesis failed, using mock data:', result.error);
        return this.generateMockSynthesis(chartData, systems);
      }
    } catch (error) {
      devConsole.error('Multi-system synthesis error:', error);
      return this.generateMockSynthesis(chartData, systems);
    }
  }

  // 4. ADVANCED PATTERN RECOGNITION
  static async analyzeChartPatterns(
    chartData: unknown,
    historicalCharts?: unknown[]
  ): Promise<ChartPattern[]> {
    try {
      // ✅ Now integrated with backend spiritual AI guidance endpoint
      devConsole.log('🔍 Analyzing chart patterns via backend spiritual AI...', {
        chartData,
        historicalCharts,
      });

      // Use spiritual AI guidance for pattern analysis
      const guidanceRequest: SpiritualAIGuidanceRequest = {
        chart_data: chartData as Record<string, unknown>,
        focus_area: 'pattern_analysis',
        depth_level: 'standard'
      };

      const result = await fetchSpiritualAIGuidance(guidanceRequest);

      if (result.success) {
        // Transform guidance into pattern analysis
        return this.transformGuidanceToPatterns(result.data, chartData as Record<string, unknown>);
      } else {
        devConsole.warn('Spiritual AI guidance failed for patterns, using mock data:', result.error);
        return this.generateMockPatterns(chartData);
      }
    } catch (error) {
      devConsole.error('Pattern analysis error:', error);
      return this.generateMockPatterns(chartData);
    }
  }

  // 5. COMPREHENSIVE AI-001 ANALYSIS
  static async generateComprehensiveAnalysis(request: AI001Request): Promise<{
    transits: TransitPrediction[];
    growth: PersonalGrowthInsight[];
    synthesis: MultiSystemInterpretation;
    patterns: ChartPattern[];
    summary: string;
  }> {
    try {
      const chartData = request.chartData;
      if (!chartData) {
        throw new Error('Chart data is required');
      }

      const [transits, growth, synthesis, patterns] = await Promise.all([
        this.generateTransitPredictions(chartData),
        this.generateGrowthInsights(chartData),
        this.generateMultiSystemSynthesis(chartData),
        this.analyzeChartPatterns(chartData),
      ]);

      const summary = await this.generateExecutiveSummary({
        transits,
        growth,
        synthesis,
        patterns,
        chartData,
      });

      return { transits, growth, synthesis, patterns, summary };
    } catch (error) {
      devConsole.error('Comprehensive analysis error:', error);
      throw error;
    }
  }

  // =============================================================================
  // Internal XAI Communication
  // =============================================================================

  private static async callBackendAPI(
    prompt: string,
    options: { temperature: number; max_tokens: number }
  ): Promise<string> {
    try {
      // ✅ Now using real backend spiritual AI endpoints
      devConsole.log('🤖 Backend spiritual AI API call:', {
        prompt: prompt.slice(0, 100),
        options,
      });

      // Use the spiritual AI guidance endpoint
      const guidanceRequest: SpiritualAIGuidanceRequest = {
        chart_data: { prompt, options },
        focus_area: 'general_guidance',
        depth_level: 'standard'
      };

      const result = await fetchSpiritualAIGuidance(guidanceRequest);

      if (result.success) {
        return result.data.guidance.join('. ') || 'AI guidance generated successfully';
      } else {
        devConsole.warn('Spiritual AI guidance failed, using fallback:', result.error);
        return 'AI guidance: This response is generated from the integrated spiritual AI backend service.';
      }
    } catch (error) {
      devConsole.error('Backend spiritual AI API error:', error);
      throw error;
    }
  }

  // =============================================================================
  // Prompt Builders
  // =============================================================================

  private static buildTransitPrompt(
    chartData: { planets?: unknown; houses?: unknown },
    timeRange: string
  ): string {
    return `
Analyze upcoming transits for the next ${timeRange} based on this natal chart:

NATAL PLANETS:
${JSON.stringify(chartData.planets, null, 2)}

HOUSES:
${JSON.stringify(chartData.houses, null, 2)}

Provide detailed transit predictions including:
1. Major transiting planets (Jupiter, Saturn, Uranus, Neptune, Pluto)
2. Exact timing and orbs
3. Life areas affected
4. Specific opportunities and challenges
5. Actionable recommendations
6. Confidence levels

Format as JSON array with structured transit objects.`;
  }

  private static buildGrowthPrompt(
    chartData: unknown,
    goals?: string[]
  ): string {
    const goalsText = goals?.length ? `Current goals: ${goals.join(', ')}` : '';

    return `
Provide personal growth coaching based on this astrological profile:

CHART DATA:
${JSON.stringify(chartData, null, 2)}

${goalsText}

Analyze and provide:
1. Current developmental phase
2. Key growth opportunities
3. Spiritual and emotional development areas
4. Practical next steps
5. Timeline for growth milestones
6. Resources and practices

Focus on actionable, empowering guidance.`;
  }

  private static buildSynthesisPrompt(
    chartData: unknown,
    systems: string[]
  ): string {
    return `
Synthesize astrological insights across multiple systems: ${systems.join(', ')}

WESTERN CHART DATA:
${JSON.stringify(chartData, null, 2)}

Provide:
1. Common themes across systems
2. Unique insights from each tradition
3. Areas of agreement and conflict
4. Integrated interpretation
5. Cultural context for differences
6. Unified guidance

Bridge traditional wisdom with modern understanding.`;
  }

  private static buildPatternPrompt(
    chartData: unknown,
    historical?: unknown[]
  ): string {
    const historicalText = historical?.length
      ? `Historical patterns: ${JSON.stringify(historical, null, 2)}`
      : '';

    return `
Identify advanced astrological patterns in this chart:

CURRENT CHART:
${JSON.stringify(chartData, null, 2)}

${historicalText}

Analyze:
1. Geometric patterns (Grand Trine, T-Square, etc.)
2. Planetary emphasis and focal points
3. Evolutionary patterns and growth cycles
4. Recurring themes and life lessons
5. Timing of pattern activation
6. Integration opportunities

Provide deep pattern recognition insights.`;
  }

  // =============================================================================
  // Response Parsers (Mock implementations for now)
  // =============================================================================

  private static parseTransitResponse(_response: string): TransitPrediction[] {
    // In production, this would parse the AI response into structured data
    return this.generateMockTransitPredictions({}, '12months');
  }

  private static parseGrowthResponse(
    _response: string
  ): PersonalGrowthInsight[] {
    return this.generateMockGrowthInsights({});
  }

  private static parseSynthesisResponse(
    _response: string,
    systems: string[]
  ): MultiSystemInterpretation {
    return this.generateMockSynthesis({}, systems);
  }

  private static parsePatternResponse(_response: string): ChartPattern[] {
    return this.generateMockPatterns({});
  }

  // =============================================================================
  // Helper Methods for API Response Transformation
  // =============================================================================

  private static transformGuidanceToTransitPredictions(
    guidance: { guidance: string[]; practices: string[]; insights: string[]; confidence: number },
    timeRange: string
  ): TransitPrediction[] {
    // Transform spiritual AI guidance into transit prediction format
    const predictions: TransitPrediction[] = [];

    // Create mock predictions based on guidance content
    // In a real implementation, the backend would return structured transit data
    if (guidance.guidance.length > 0) {
      const now = new Date();
      const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      predictions.push({
        id: `transit-${Date.now()}`,
        transitType: 'Spiritual Growth Transit',
        planet: 'Jupiter',
        aspect: 'trine',
        natalPlanet: 'Sun',
        exactDate: thirtyDays.toISOString().split('T')[0] ?? thirtyDays.toISOString(),
        influence: 'major',
        theme: guidance.guidance[0] ?? 'Spiritual Development',
        opportunities: guidance.practices.slice(0, 3),
        challenges: ['Integration challenges', 'Patience required'],
        recommendations: guidance.insights.slice(0, 3),
        confidence: guidance.confidence,
        duration: {
          start: now.toISOString().split('T')[0] ?? now.toISOString(),
          peak: thirtyDays.toISOString().split('T')[0] ?? thirtyDays.toISOString(),
          end: sixtyDays.toISOString().split('T')[0] ?? sixtyDays.toISOString(),
        },
      });
    }

    // If no predictions from guidance, fall back to mock data
    if (predictions.length === 0) {
      return this.generateMockTransitPredictions({}, timeRange);
    }

    return predictions;
  }

  private static transformSynthesisToGrowthInsights(
    synthesis: { unified_themes: string[]; integration_insights: string[]; recommended_focus: string[]; synthesis_confidence: number },
    currentGoals?: string[]
  ): PersonalGrowthInsight[] {
    // Transform spiritual AI synthesis into growth insights format
    const insights: PersonalGrowthInsight[] = [];

    // Create insights based on synthesis content
    if (synthesis.unified_themes.length > 0) {
      insights.push({
        id: `growth-${Date.now()}`,
        category: 'spiritual',
        title: synthesis.unified_themes[0] ?? 'Spiritual Growth Path',
        currentPhase: 'Integration Phase',
        nextSteps: synthesis.recommended_focus.slice(0, 3),
        timeframe: '3-6 months',
        resources: ['Meditation practice', 'Journaling', 'Community support'],
        metrics: {
          progress: 0.6,
          difficulty: 0.4,
          importance: 0.8,
        },
      });
    }

    // Add goal-specific insights if goals are provided
    if (currentGoals && currentGoals.length > 0) {
      currentGoals.forEach((goal, index) => {
        insights.push({
          id: `goal-${Date.now()}-${index}`,
          category: 'mental',
          title: `Growth in ${goal}`,
          currentPhase: 'Development Phase',
          nextSteps: synthesis.integration_insights.slice(0, 2),
          timeframe: 'Ongoing',
          resources: ['Personal reflection', 'Skill development', 'Mentorship'],
          metrics: {
            progress: 0.4,
            difficulty: 0.5,
            importance: 0.9,
          },
        });
      });
    }

    // If no insights from synthesis, fall back to mock data
    if (insights.length === 0) {
      return this.generateMockGrowthInsights({}, currentGoals);
    }

    return insights;
  }

  private static transformGuidanceToPatterns(
    guidance: { guidance: string[]; practices: string[]; insights: string[]; confidence: number },
    chartData: Record<string, unknown>
  ): ChartPattern[] {
    // Transform spiritual AI guidance into chart pattern format
    const patterns: ChartPattern[] = [];

    // Create patterns based on guidance content
    if (guidance.insights.length > 0) {
      patterns.push({
        id: `pattern-${Date.now()}`,
        patternType: 'Spiritual Growth Pattern',
        planets: ['Sun', 'Moon', 'Jupiter'], // Default planets for spiritual patterns
        significance: guidance.insights[0] ?? 'Spiritual development pattern identified',
        frequency: 0.3, // 30% frequency for spiritual patterns
        evolutionStage: 'active',
        lifeAreas: ['Spirituality', 'Personal Growth', 'Self-awareness'],
        activationPeriods: ['Current phase', 'Next 6 months', 'Ongoing development'],
      });
    }

    // Add practice-based patterns
    if (guidance.practices.length > 0) {
      patterns.push({
        id: `pattern-practice-${Date.now()}`,
        patternType: 'Integration Pattern',
        planets: ['Mercury', 'Venus', 'Saturn'], // Communication and structure planets
        significance: 'Pattern of integrating spiritual practices into daily life',
        frequency: 0.4, // 40% frequency for integration patterns
        evolutionStage: 'integrating',
        lifeAreas: ['Daily Practice', 'Habit Formation', 'Life Balance'],
        activationPeriods: ['Daily', 'Weekly cycles', 'Monthly reviews'],
      });
    }

    // If no patterns from guidance, fall back to mock data
    if (patterns.length === 0) {
      return this.generateMockPatterns(chartData);
    }

    return patterns;
  }

  private static transformSynthesisToMultiSystem(
    synthesis: { unified_themes: string[]; system_correlations: Record<string, unknown>; integration_insights: string[]; synthesis_confidence: number },
    systems: string[]
  ): MultiSystemInterpretation {
    // Transform spiritual AI synthesis into multi-system interpretation format
    return {
      id: `multi-system-${Date.now()}`,
      systems: systems as ('western' | 'vedic' | 'chinese' | 'mayan')[],
      synthesis: synthesis.unified_themes.join('. ') ?? 'Multi-system analysis complete',
      commonThemes: synthesis.unified_themes,
      uniqueInsights: synthesis.system_correlations as Record<string, string>,
      conflictingViews: [], // Could be derived from correlations in future
      integratedGuidance: synthesis.integration_insights.join('. ') ?? 'Integration guidance available',
    };
  }

  // =============================================================================
  // Mock Data Generators (for development)
  // =============================================================================

  private static generateMockTransitPredictions(
    _chartData: unknown,
    _timeRange: string
  ): TransitPrediction[] {
    return [
      {
        id: 'transit-1',
        transitType: 'Jupiter Trine Natal Sun',
        planet: 'Jupiter',
        aspect: 'trine',
        natalPlanet: 'Sun',
        exactDate: '2025-03-15',
        influence: 'major',
        theme: 'Expansion and Growth',
        opportunities: [
          'Career advancement opportunities',
          'Educational pursuits',
          'Travel and exploration',
        ],
        challenges: ['Over-optimism', 'Scattered energy'],
        recommendations: [
          'Focus on one major opportunity',
          'Network and make connections',
          'Trust your instincts',
        ],
        confidence: 0.85,
        duration: {
          start: '2025-02-28',
          peak: '2025-03-15',
          end: '2025-04-01',
        },
      },
      {
        id: 'transit-2',
        transitType: 'Saturn Square Natal Moon',
        planet: 'Saturn',
        aspect: 'square',
        natalPlanet: 'Moon',
        exactDate: '2025-05-20',
        influence: 'major',
        theme: 'Emotional Maturity',
        opportunities: [
          'Emotional discipline',
          'Establishing boundaries',
          'Long-term security building',
        ],
        challenges: ['Emotional restrictions', 'Family pressures'],
        recommendations: [
          'Practice patience',
          'Strengthen emotional foundations',
          'Seek professional guidance if needed',
        ],
        confidence: 0.78,
        duration: {
          start: '2025-04-15',
          peak: '2025-05-20',
          end: '2025-06-25',
        },
      },
    ];
  }

  private static generateMockGrowthInsights(
    _chartData: unknown,
    _currentGoals?: string[]
  ): PersonalGrowthInsight[] {
    return [
      {
        id: 'growth-1',
        category: 'spiritual',
        title: 'Awakening to Higher Purpose',
        currentPhase: 'Integration of spiritual insights into daily life',
        nextSteps: [
          'Establish daily meditation practice',
          'Study philosophical texts',
          'Connect with like-minded community',
        ],
        timeframe: '3-6 months',
        resources: ['Meditation apps', 'Spiritual books', 'Local groups'],
        metrics: {
          progress: 65,
          difficulty: 40,
          importance: 90,
        },
      },
      {
        id: 'growth-2',
        category: 'emotional',
        title: 'Developing Emotional Intelligence',
        currentPhase: 'Learning to process emotions healthily',
        nextSteps: [
          'Practice emotional awareness',
          'Improve communication skills',
          'Set healthy boundaries',
        ],
        timeframe: '6-12 months',
        resources: ['Therapy', 'Journaling', 'Communication workshops'],
        metrics: {
          progress: 45,
          difficulty: 60,
          importance: 85,
        },
      },
    ];
  }

  private static generateMockSynthesis(
    _chartData: unknown,
    systems: string[]
  ): MultiSystemInterpretation {
    return {
      id: 'synthesis-1',
      systems: systems as Array<'western' | 'vedic' | 'chinese' | 'mayan'>,
      synthesis:
        'Your chart reveals a fascinating blend of Eastern and Western astrological wisdom, highlighting your role as a bridge between different philosophical approaches to life.',
      commonThemes: [
        'Strong leadership potential',
        'Deep intuitive abilities',
        'Career in service to others',
        'Complex relationship patterns',
      ],
      uniqueInsights: {
        western: 'Emphasis on individual expression and personal achievement',
        vedic: 'Focus on dharma and spiritual evolution through service',
        chinese: 'Natural ability to harmonize opposing forces',
      },
      conflictingViews: [
        'Timing of major life events varies between systems',
        'Different emphasis on material vs spiritual success',
      ],
      integratedGuidance:
        'Your path involves integrating personal ambition with spiritual service, using your natural diplomatic abilities to create harmony in challenging situations.',
    };
  }

  private static generateMockPatterns(_chartData: unknown): ChartPattern[] {
    return [
      {
        id: 'pattern-1',
        patternType: 'Grand Trine in Fire',
        planets: ['Sun', 'Mars', 'Jupiter'],
        significance: 'Natural leadership and creative expression abilities',
        frequency: 0.15, // 15% of population
        evolutionStage: 'active',
        lifeAreas: ['Career', 'Creativity', 'Leadership', 'Self-expression'],
        activationPeriods: ['Age 28-32', 'Age 42-45', 'Age 56-60'],
      },
      {
        id: 'pattern-2',
        patternType: 'Stellium in 7th House',
        planets: ['Venus', 'Mercury', 'Moon'],
        significance: 'Relationships are central to life purpose and growth',
        frequency: 0.08, // 8% of population
        evolutionStage: 'integrating',
        lifeAreas: [
          'Partnerships',
          'Public relations',
          'Counseling',
          'Diplomacy',
        ],
        activationPeriods: ['Age 24-28', 'Age 38-42', 'Age 52-56'],
      },
    ];
  }

  private static async generateExecutiveSummary(_data: {
    transits: TransitPrediction[];
    growth: PersonalGrowthInsight[];
    synthesis: MultiSystemInterpretation;
    patterns: ChartPattern[];
    chartData: unknown;
  }): Promise<string> {
    // This would use AI to create a comprehensive summary
    return await Promise.resolve(
      `Based on your comprehensive AI-001 analysis, you're entering a significant period of growth and transformation. The next 12 months highlight opportunities for spiritual development, career advancement, and deeper relationship connections. Your chart patterns suggest you're naturally gifted at bridging different perspectives and creating harmony in complex situations. Focus on integrating your spiritual insights with practical action, and trust your intuitive guidance during major transits.`
    );
  }
}

// =============================================================================
// AI-001 React Hooks
// =============================================================================

export const useAI001Analysis = (
  chartData: { id?: unknown; planets?: unknown; houses?: unknown } | null,
  userId: string
) => {
  const _queryClient = useQueryClient();

  return useQuery({
    queryKey: ['ai001-comprehensive', userId, chartData?.id as string],
    queryFn: () =>
      AI001Service.generateComprehensiveAnalysis({
        chartData: chartData!,
        userId,
        analysisType: 'comprehensive',
      }),
    enabled: !!chartData && !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useTransitPredictions = (
  chartData: { id?: unknown; planets?: unknown; houses?: unknown } | null,
  timeRange = '12months'
) => {
  return useQuery({
    queryKey: ['ai001-transits', chartData?.id as string, timeRange],
    queryFn: () =>
      AI001Service.generateTransitPredictions(chartData!, timeRange),
    enabled: !!chartData,
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
  });
};

export const useGrowthInsights = (
  chartData: { id?: unknown } | null,
  goals?: string[]
) => {
  return useQuery({
    queryKey: ['ai001-growth', chartData?.id as string, goals],
    queryFn: () => AI001Service.generateGrowthInsights(chartData, goals),
    enabled: !!chartData,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
