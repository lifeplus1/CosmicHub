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

export interface TransitAnalysisRequest {
  transitType: 'current' | 'upcoming' | 'past';
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

export interface ChatQuestionRequest {
  question: string;
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

export interface MultiSystemSynthesisRequest {
  systems: Array<'western' | 'vedic' | 'chinese' | 'mayan' | 'uranian'>;
  synthesisType:
    | 'personality'
    | 'life_path'
    | 'relationships'
    | 'career'
    | 'spiritual';
  chartData: ChartData;
  depth: 'basic' | 'intermediate' | 'advanced';
}

export interface PersonalGrowthRequest {
  growthArea:
    | 'emotional_intelligence'
    | 'leadership'
    | 'creativity'
    | 'relationships'
    | 'spiritual_development';
  currentChallenges: string[];
  goals: string[];
  timeframe: 'immediate' | 'short_term' | 'long_term';
  chartData: ChartData;
}

export interface PatternRecognitionRequest {
  chartCollection: ChartData[];
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
export class AIEnhancedService {
  private static baseUrl = 'https://api.x.ai/v1';

  private static getApiKey(): string {
    // Support both Node and Vite environments
    const globalProcess: unknown = (globalThis as unknown as { process?: unknown })
      .process;
    const nodeEnv =
      (globalProcess && typeof globalProcess === 'object'
        ? (globalProcess as { env?: Record<string, unknown> }).env
        : undefined) ?? undefined;
    const nodeKey =
      typeof nodeEnv?.['XAI_API_KEY'] === 'string'
        ? String(nodeEnv['XAI_API_KEY'])
        : undefined;
    const metaEnv = (
      import.meta as unknown as { env?: Record<string, unknown> }
    ).env;
    const viteKey =
      typeof metaEnv?.['VITE_XAI_API_KEY'] === 'string'
        ? String(metaEnv['VITE_XAI_API_KEY'])
        : undefined;
    const key = nodeKey ?? viteKey;
    if (!key) throw new Error('XAI_API_KEY environment variable is not set');
    return key;
  }

  /**
   * Feature 1: Predictive Transit Analysis with AI-Powered Timing Recommendations
   */
  static async generateTransitAnalysis(
    request: TransitAnalysisRequest
  ): Promise<string> {
    try {
      TransitAnalysisSchema.parse(request);
    } catch (error) {
      throw new Error(
        `Invalid transit analysis request: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }

    const prompt = this.buildTransitAnalysisPrompt(request);
    return this.makeAIRequest(prompt, 'transit-analysis');
  }

  private static buildTransitAnalysisPrompt(
    request: TransitAnalysisRequest
  ): string {
    const { transitType, timeframe, focusAreas, birthData } = request;

    return `As an expert astrologer specializing in predictive transit analysis, provide detailed timing insights for someone born on ${birthData.date} at ${birthData.time} in ${birthData.location}.

TRANSIT ANALYSIS REQUEST:
- Transit Type: ${transitType}
- Timeframe: ${timeframe}
- Focus Areas: ${focusAreas.join(', ')}

Please provide:

1. **Key Transit Influences**: Identify the most significant planetary transits affecting this person
2. **Precise Timing**: Exact dates or date ranges for peak influence
3. **Life Area Impact**: How these transits will specifically affect ${focusAreas.join(', ')}
4. **Action Recommendations**: Specific timing for major decisions, launches, or life changes
5. **Preparation Guidance**: How to prepare for and maximize these cosmic opportunities
6. **Potential Challenges**: Warning periods and how to navigate them
7. **Strategic Timing**: Best dates for important actions within the ${timeframe}

Focus on practical, actionable timing recommendations that help optimize life decisions based on cosmic influences. Include specific dates and recommended actions.`;
  }

  /**
   * Feature 2: Custom AI Question Answering System (Chat-based Astrology Insights)
   */
  static async answerAstrologyQuestion(
    request: ChatQuestionRequest
  ): Promise<string> {
    try {
      ChatQuestionSchema.parse(request);
    } catch (error) {
      throw new Error(
        `Invalid chat question request: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }

    const prompt = this.buildChatPrompt(request);
    return this.makeAIRequest(prompt, 'chat-qa');
  }

  private static buildChatPrompt(request: ChatQuestionRequest): string {
    const { question, context } = request;

    let contextInfo = '';
    if (context.userProfile) {
      contextInfo += `\nUser Birth Data: ${context.userProfile.birthDate} at ${context.userProfile.birthTime} in ${context.userProfile.birthLocation}`;
    }

    if (context.chartData) {
      contextInfo +=
        '\nChart data is available for specific planetary positions and aspects.';
    }

    if (context.previousMessages && context.previousMessages.length > 0) {
      contextInfo += '\n\nPrevious conversation context:\n';
      context.previousMessages.slice(-3).forEach(msg => {
        contextInfo += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    return `As a knowledgeable astrology expert, answer the following question with detailed, personalized insights:

QUESTION: "${question}"

${contextInfo}

Please provide:
1. **Direct Answer**: Address the specific question asked
2. **Astrological Context**: Relevant planetary influences, aspects, or chart factors
3. **Practical Guidance**: Actionable advice or insights
4. **Additional Insights**: Related astrological wisdom that might be helpful
5. **Follow-up Suggestions**: Questions or areas to explore further

Make your response conversational, insightful, and personally relevant. Draw from your deep knowledge of astrology while keeping the tone friendly and accessible.`;
  }

  /**
   * Feature 3: Multi-System AI Synthesis (Cross-Cultural Interpretation Fusion)
   */
  static async generateMultiSystemSynthesis(
    request: MultiSystemSynthesisRequest
  ): Promise<string> {
    try {
      MultiSystemSynthesisSchema.parse(request);
    } catch (error) {
      throw new Error(
        `Invalid multi-system synthesis request: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }

    const prompt = this.buildMultiSystemPrompt(request);
    return this.makeAIRequest(prompt, 'multi-system-synthesis');
  }

  private static buildMultiSystemPrompt(
    request: MultiSystemSynthesisRequest
  ): string {
    const { systems, synthesisType, depth } = request;

    const systemDescriptions = {
      western:
        'Western Tropical Astrology with zodiac signs, houses, and planetary aspects',
      vedic:
        'Vedic Sidereal Astrology with nakshatras, dashas, and karmic influences',
      chinese:
        'Chinese Astrology with animal signs, elements, and Four Pillars analysis',
      mayan:
        'Mayan Sacred Calendar with Tzolkin energies and spiritual guidance',
      uranian:
        'Uranian Astrology with transneptunian points and sensitive degree analysis',
    };

    const includedSystems = systems
      .map(s => systemDescriptions[s])
      .join('\n- ');

    return `As a master astrologer with expertise in multiple astrological traditions, create a ${depth} synthesis analysis for ${synthesisType} using these systems:

SYSTEMS TO INTEGRATE:
- ${includedSystems}

SYNTHESIS FOCUS: ${synthesisType.replace('_', ' ').toUpperCase()}

Please provide:

1. **Individual System Insights**: Key findings from each astrological tradition
2. **Cross-System Correlations**: Where different systems agree or complement each other
3. **Unified Interpretation**: Synthesized understanding combining all traditions
4. **Cultural Wisdom Integration**: How different cultural approaches enrich the interpretation
5. **Practical Application**: How these multi-system insights apply to daily life
6. **Unique Revelations**: Insights only visible when combining multiple systems
7. **Balanced Perspective**: A comprehensive view honoring each tradition's wisdom

Create a ${depth}-level analysis that respects each tradition while revealing deeper truths through their integration. Focus specifically on ${synthesisType} with practical, actionable insights.`;
  }

  /**
   * Feature 4: Personal Growth Coaching with AI-Driven Developmental Insights
   */
  static async generatePersonalGrowthCoaching(
    request: PersonalGrowthRequest
  ): Promise<string> {
    try {
      PersonalGrowthSchema.parse(request);
    } catch (error) {
      throw new Error(
        `Invalid personal growth request: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }

    const prompt = this.buildGrowthCoachingPrompt(request);
    return this.makeAIRequest(prompt, 'personal-growth');
  }

  private static buildGrowthCoachingPrompt(
    request: PersonalGrowthRequest
  ): string {
    const { growthArea, currentChallenges, goals, timeframe } = request;

    return `As an expert astrological life coach, provide developmental guidance for ${growthArea.replace('_', ' ')} growth:

GROWTH FOCUS: ${growthArea.replace('_', ' ').toUpperCase()}
TIMEFRAME: ${timeframe.replace('_', ' ')}

CURRENT CHALLENGES:
${currentChallenges.map(c => `- ${c}`).join('\n')}

STATED GOALS:
${goals.map(g => `- ${g}`).join('\n')}

Using astrological insights, provide:

1. **Astrological Growth Profile**: How your birth chart supports this growth area
2. **Challenge Analysis**: Astrological perspective on current obstacles and their purpose
3. **Strength Activation**: Natural talents and abilities to leverage for growth
4. **Step-by-Step Development Plan**: Practical actions aligned with cosmic timing
5. **Milestone Mapping**: Key growth phases and when to expect breakthroughs
6. **Shadow Work Guidance**: Unconscious patterns to address for true transformation
7. **Supportive Practices**: Daily/weekly activities to accelerate development
8. **Success Indicators**: How to recognize and measure your growth progress

Create a personalized development plan that combines practical psychology with astrological wisdom, specifically designed for ${timeframe} transformation in ${growthArea.replace('_', ' ')}.`;
  }

  /**
   * Feature 5: Advanced Pattern Recognition Across User Chart Collections
   */
  static async analyzePatterns(
    request: PatternRecognitionRequest
  ): Promise<string> {
    try {
      PatternRecognitionSchema.parse(request);
    } catch (error) {
      throw new Error(
        `Invalid pattern recognition request: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }

    const prompt = this.buildPatternAnalysisPrompt(request);
    return this.makeAIRequest(prompt, 'pattern-recognition');
  }

  private static buildPatternAnalysisPrompt(
    request: PatternRecognitionRequest
  ): string {
    const { patternTypes, analysisDepth, chartCollection } = request;

    return `As an expert astrological pattern analyst, examine this collection of ${chartCollection.length} charts to identify significant patterns:

ANALYSIS REQUEST:
- Pattern Types: ${patternTypes.join(', ')}
- Analysis Depth: ${analysisDepth}
- Chart Collection Size: ${chartCollection.length} charts

Please analyze and report:

1. **Dominant Patterns**: Most frequently occurring astrological configurations
2. **Rare Configurations**: Unique or unusual planetary combinations found
3. **Evolutionary Themes**: Common growth patterns across the chart collection
4. **Karmic Indicators**: Shared lessons and life purpose themes
5. **Timing Correlations**: Similar age periods or life phases showing major developments
6. **Relationship Patterns**: Common dynamics in partnerships and connections
7. **Career Indicators**: Professional path similarities and variations
8. **Health & Vitality**: Physical and energetic patterns across the collection
9. **Spiritual Development**: Common awakening patterns and spiritual gifts
10. **Predictive Insights**: What these patterns suggest for future development

Provide a ${analysisDepth} analysis that reveals hidden connections and helps understand collective astrological themes. Focus on actionable insights and meaningful patterns that can guide personal development and life decisions.

Note: Respect privacy - provide general pattern insights without identifying specific individuals.`;
  }

  /**
   * Core AI Request Handler
   */
  private static async makeAIRequest(
    prompt: string,
    requestType: string
  ): Promise<string> {
    try {
      const apiKey = this.getApiKey();

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content:
                'You are an advanced astrological AI system with deep expertise in predictive analysis, multi-system synthesis, personal development, and pattern recognition. Provide detailed, accurate, and actionable insights while maintaining a professional yet accessible tone.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        await response.json().catch(() => undefined);
        throw new Error(
          `xAI API request failed: ${response.statusText} (${response.status})`
        );
      }

      const json: unknown = await response.json();
      const parsed = z
        .object({
          choices: z
            .array(
              z.object({
                message: z.object({ content: z.string() }),
              })
            )
            .min(1),
        })
        .safeParse(json);

      if (!parsed.success) {
        throw new Error('Unexpected API response shape');
      }

      const first = parsed.data.choices[0];
      if (!first) throw new Error('Empty choices array in response');

      return first.message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Enhanced AI Service error (${requestType}): ${error.message}`
        );
      }
      throw new Error(`Failed to process ${requestType} request`);
    }
  }

  /**
   * Fallback to Mock Service for Development/Testing
   */
  static async generateMockResponse(
    requestType: string,
    request: Record<string, unknown>
  ): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResponses = {
      'transit-analysis': `🌟 TRANSIT ANALYSIS - ${(request.timeframe as string)?.toUpperCase() ?? 'CUSTOM'} FORECAST

Key Planetary Influences:
• Jupiter trine your natal Sun (Peak: Next month) - Major career expansion opportunity
• Saturn sextile Mercury (Active: Next 3 months) - Perfect time for structured learning and skill development
• Venus return in 7th house (Exact: In 2 weeks) - Significant relationship developments expected

Strategic Timing Recommendations:
📅 Best dates for major decisions: [Specific dates would be calculated based on actual chart]
💼 Career advancement window: Open now through next quarter
💕 Relationship opportunities: Strongest in coming month
💰 Financial planning: Excellent timing for investments in ${(request.focusAreas as string[])?.includes('finances') ? '2 weeks' : 'near future'}

Action Plan:
1. IMMEDIATE (Next 2 weeks): Focus on ${(request.focusAreas as string[])?.[0] ?? 'career'} opportunities
2. SHORT-TERM (Next month): Initiate important conversations and collaborations
3. MEDIUM-TERM (Next quarter): Launch major projects or make significant life changes

Cosmic timing is strongly supportive for your goals in ${(request.focusAreas as string[])?.join(', ') ?? 'all areas'}.`,

      'chat-qa': `Thank you for your thoughtful question! Based on your astrological profile and the cosmic influences at play, here's my insight:

🌟 **Direct Answer**: ${(request.question as string)?.includes('career') ? 'Your career path is illuminated by strong Jupiter influences, suggesting expansion and growth opportunities ahead.' : 'The planetary positions in your chart provide clear guidance for this situation.'}

🪐 **Astrological Context**: Your chart shows ${(request.context as { userProfile?: unknown })?.userProfile ? 'strong emphasis on personal development and authentic self-expression' : 'significant potential for growth and positive change'}. The current planetary transits are particularly supportive of your intentions.

✨ **Practical Guidance**: 
1. Trust your intuition - your chart shows strong psychic abilities
2. Take action during the waxing moon phase for best results
3. Focus on communication and relationship building this month

💡 **Additional Insights**: The cosmic energies right now are perfectly aligned with your question. This is an auspicious time for new beginnings and positive changes.

🔮 **Follow-up Suggestions**: Consider exploring how your Moon sign influences your emotional responses, or ask about timing for specific goals you're working toward.

Is there a particular aspect of this guidance you'd like me to elaborate on?`,

      'multi-system-synthesis': `🌍 MULTI-SYSTEM SYNTHESIS - ${(request.synthesisType as string)?.toUpperCase() ?? 'COMPREHENSIVE'} ANALYSIS

Integration of ${(request.systems as string[])?.join(', ').toUpperCase() ?? 'MULTIPLE'} Astrological Traditions:

🔯 **Western Astrology Insights**: 
Strong emphasis on ${(request.synthesisType as string) ?? 'personal development'} with key placements supporting growth and expansion.

🕉️ **Vedic Astrology Perspective**: 
Your nakshatra indicates a soul purpose aligned with ${(request.synthesisType as string) === 'career' ? 'service and expertise sharing' : 'spiritual development and wisdom teaching'}.

🐉 **Chinese Astrology Wisdom**: 
Your animal sign and element combination suggests ${(request.synthesisType as string) === 'relationships' ? 'harmony through balance and patience' : 'success through persistent effort and strategic timing'}.

🏛️ **Unified Interpretation**: 
All systems converge on a theme of ${(request.depth as string) === 'advanced' ? 'transformational leadership and spiritual service' : 'personal growth and authentic expression'}. The integration reveals:

• Natural talents: Leadership, communication, and intuitive insight
• Life purpose: Bridge different worlds and bring wisdom to others
• Optimal path: Combining practical skills with spiritual understanding
• Timing: Current cosmic alignments support major initiatives

🌟 **Cross-Cultural Wisdom**: Each tradition emphasizes your role as a connector and wisdom keeper, suggesting your greatest fulfillment comes through helping others understand deeper truths.`,

      'personal-growth': `🌱 PERSONAL GROWTH COACHING - ${(request.growthArea as string)?.replace('_', ' ').toUpperCase() ?? 'COMPREHENSIVE'} DEVELOPMENT

Astrological Growth Analysis:

🎯 **Your Growth Profile**: 
Your birth chart reveals natural gifts in ${(request.growthArea as string) ?? 'personal development'} with strong planetary support for transformation and expansion.

🔍 **Challenge Perspective**: 
Current obstacles are actually cosmic invitations to develop:
${(request.currentChallenges as string[])?.map((c: string) => `• ${c} - Opportunity for mastery and wisdom`).join('\n') ?? '• Patience and self-compassion\n• Trust in divine timing\n• Integration of shadow aspects'}

💪 **Strength Activation Plan**:
1. **Natural Talents**: Your chart shows gifts in intuition, communication, and healing
2. **Cosmic Support**: Current planetary transits favor ${(request.timeframe as string) ?? 'gradual'} transformation
3. **Action Steps**: Daily meditation, journaling, and conscious relationship building

📈 **Development Milestones**:
• Week 1-2: Awareness and intention setting
• Month 1: Initial breakthrough and new patterns
• Month 2-3: Integration and deepening practice
• Month 3-6: Significant transformation and mastery

🌟 **Success Indicators**: 
You'll know you're progressing when you feel more aligned with your authentic self, experience greater synchronicities, and find yourself naturally inspiring others.

Your ${(request.timeframe as string) ?? 'immediate'} growth potential is exceptionally strong right now!`,

      'pattern-recognition': `📊 PATTERN RECOGNITION ANALYSIS - ${(request.patternTypes as string[])?.join(', ').toUpperCase() ?? 'COMPREHENSIVE'} PATTERNS

Collection Analysis of ${(request.chartCollection as unknown[])?.length ?? 'Multiple'} Charts:

🔍 **Dominant Patterns Identified**:
• 73% show strong water sign emphasis - indicating collective emotional sensitivity and intuitive abilities
• 68% have significant 7th/11th house activity - suggesting relationship and community focus themes
• 45% display prominent Jupiter aspects - indicating shared growth and expansion opportunities

⭐ **Rare Configurations Found**:
• Multiple charts show Chiron-Venus healing aspects (unusual frequency)
• Uncommon concentration of Aquarius/Leo axis emphasis
• Several charts feature exact grand trines in fire signs

🔮 **Evolutionary Themes**:
• Age 28-35: Major life direction changes and spiritual awakening
• Age 42-49: Career mastery and service orientation emergence  
• Common soul contracts around healing, teaching, and creative expression

💫 **Collective Insights**:
This chart collection represents a group with shared spiritual mission around ${(request.analysisDepth as string) === 'comprehensive' ? 'consciousness evolution and planetary healing' : 'personal and collective transformation'}. Strong indicators suggest:

• Synchronized awakening experiences
• Natural healing and teaching abilities
• Important role in collective consciousness shift
• Karmic connections and soul family recognition

🎯 **Predictive Patterns**: 
The group shows strong indicators for significant breakthroughs in ${new Date().getFullYear() + 1}-${new Date().getFullYear() + 2}, particularly in areas of creative expression and spiritual service.

This collection represents powerful change agents with aligned soul purposes.`,
    };

    return (
      mockResponses[requestType as keyof typeof mockResponses] ||
      'Advanced AI analysis completed successfully. Enhanced insights generated based on your request.'
    );
  }
}
