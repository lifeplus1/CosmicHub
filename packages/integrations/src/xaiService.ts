import { z } from 'zod';
import { InterpretationRequest } from './types';

// Schema for validating API response
const ChatCompletionSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string() }),
      })
    )
    .min(1),
});

// Schema for validating request payload
const InterpretationRequestSchema = z.object({
  birthDate: z.string(),
  birthTime: z.string(),
  birthLocation: z.string(),
  interpretationType: z.enum([
    'general',
    'personality',
    'career',
    'relationships',
  ]),
});

export class XAIService {
  private static baseUrl = 'https://api.x.ai/v1';

  private static getApiKey(): string {
    // Support both Node and Vite environments without unsafe member access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalProcess: any = (globalThis as unknown as { process?: unknown })
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

  static async generateInterpretation(
    request: InterpretationRequest
  ): Promise<string> {
    // Validate request
    try {
      InterpretationRequestSchema.parse(request);
    } catch (error) {
      throw new Error(
        `Invalid request data: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }

    try {
      const apiKey = this.getApiKey();
      const prompt = this.buildPrompt(request);

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
                'You are an expert astrological interpreter with deep knowledge of cosmic influences, planetary alignments, and their impact on human personality and life path. Provide detailed, insightful, and personalized astrological interpretations based on birth data.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        await response.json().catch(() => undefined); // consume body if present
        throw new Error(
          `xAI API request failed: ${response.statusText} (${response.status})`
        );
      }

      const json: unknown = await response.json();
      const parsed = ChatCompletionSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error('Unexpected API response shape');
      }
      const first = parsed.data.choices[0];
      if (!first) throw new Error('Empty choices array in response');
      return first.message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`xAI API error: ${error.message}`);
      }
      throw new Error('Failed to fetch interpretation from xAI API');
    }
  }

  private static buildPrompt(request: InterpretationRequest): string {
    const { birthDate, birthTime, birthLocation, interpretationType } = request;

    const prompts = {
      general: `Generate a comprehensive astrological interpretation for someone born on ${birthDate} at ${birthTime} in ${birthLocation}. 

Focus on:
- Their cosmic blueprint and overall life theme
- Key planetary influences and their meanings
- Potential for growth and major life lessons
- Unique gifts and talents indicated by their chart
- General guidance for their life path

Provide an insightful, personalized interpretation that feels authentic and meaningful.`,

      personality: `Provide a detailed personality analysis based on the astrological chart for someone born on ${birthDate} at ${birthTime} in ${birthLocation}.

Focus on:
- Core personality traits and characteristics
- Communication style and how they express themselves
- Emotional nature and how they process feelings
- Strengths and potential challenges
- How they interact with others and form relationships

Create a personality profile that helps them understand their authentic self.`,

      career: `Analyze the career potential and professional path based on the astrological chart for someone born on ${birthDate} at ${birthTime} in ${birthLocation}.

Focus on:
- Natural talents and abilities for the workplace
- Suitable career paths and industries
- Leadership style and work preferences
- Professional strengths and areas for development
- Timing for career moves and opportunities

Provide practical career guidance based on their astrological indicators.`,

      relationships: `Provide a comprehensive relationship analysis based on the astrological chart for someone born on ${birthDate} at ${birthTime} in ${birthLocation}.

Focus on:
- Romantic tendencies and love language
- What they seek in partnerships
- Compatibility factors and relationship patterns
- Communication style in relationships
- Areas for growth in love and partnership

Help them understand their relationship dynamics and attract healthy partnerships.`,
    };

    return prompts[interpretationType] || prompts.general;
  }

  // Fallback to mock service for development/testing
  static async generateMockInterpretation(
    request: InterpretationRequest
  ): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const interpretations = {
      general: `Based on your birth details (${request.birthDate} at ${request.birthTime} in ${request.birthLocation}), your astrological chart reveals a unique cosmic blueprint. Your planetary positions suggest a dynamic personality with strong intuitive abilities and a natural inclination toward creativity and innovation. The alignment of your celestial bodies indicates significant potential for personal growth and spiritual development throughout your lifetime.`,

      personality: `Your personality profile shows a fascinating blend of traits influenced by your birth chart. Born on ${request.birthDate}, your cosmic signature reveals someone who is naturally empathetic, intellectually curious, and possesses a strong sense of justice. Your birth time of ${request.birthTime} places emphasis on communication and relationships, suggesting you have a gift for connecting with others on a deep level.`,

      career: `Career-wise, your astrological profile from ${request.birthLocation} indicates excellent potential in fields that involve creativity, communication, or helping others. Your planetary alignments suggest you would thrive in roles that allow for independence and innovation. Consider careers in technology, arts, counseling, or entrepreneurship where your natural abilities can shine.`,

      relationships: `In relationships, your birth chart reveals someone who values deep, meaningful connections. Born at ${request.birthTime} on ${request.birthDate}, your Venus and Mars placements suggest you are both passionate and nurturing in romantic partnerships. You seek partners who can match your intellectual depth and emotional authenticity.`,
    };

    return (
      interpretations[request.interpretationType] || interpretations.general
    );
  }
}
