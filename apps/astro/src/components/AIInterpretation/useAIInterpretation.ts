import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { xaiConfig, devConsole } from '../../config/environment';

// Temporary direct imports while package resolution is being fixed
interface InterpretationRequest {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  interpretationType: 'general' | 'personality' | 'career' | 'relationships';
}

// Type interfaces for API response validation
interface APIMessage {
  content?: unknown;
}

interface APIChoice {
  message?: unknown;
}

interface APIResponse {
  choices?: unknown[];
}

// XAI Service class (temporary inline implementation)
class XAIService {
  private static baseUrl = xaiConfig.baseUrl;
  
  private static getApiKey(): string {
    if (xaiConfig.enabled !== true || typeof xaiConfig.apiKey !== 'string' || xaiConfig.apiKey === '') {
      throw new Error('XAI API key is not configured');
    }
    return xaiConfig.apiKey;
  }

  static async generateInterpretation(request: InterpretationRequest): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      const prompt = this.buildPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: xaiConfig.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert astrological interpreter with deep knowledge of cosmic influences, planetary alignments, and their impact on human personality and life path.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`xAI API request failed: ${response.statusText} (${response.status})`);
      }

      const data: unknown = await response.json();
      
      // Type-safe parsing of API response
      if (
        typeof data !== 'object' ||
        data === null ||
        !('choices' in data)
      ) {
        throw new Error('Invalid API response: missing choices array');
      }

      const dataObj = data as APIResponse;
      if (
        !Array.isArray(dataObj.choices) ||
        dataObj.choices.length === 0 ||
        typeof dataObj.choices[0] !== 'object' ||
        dataObj.choices[0] === null
      ) {
        throw new Error('Invalid API response: invalid choices array');
      }

      const choice = dataObj.choices[0] as APIChoice;
      if (
        !('message' in choice) ||
        typeof choice.message !== 'object' ||
        choice.message === null
      ) {
        throw new Error('Invalid API response: invalid message format');
      }

      const message = choice.message as APIMessage;
      if (
        !('content' in message) ||
        typeof message.content !== 'string' ||
        message.content === ''
      ) {
        throw new Error('Invalid API response: missing or empty content');
      }

      return message.content;
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
      general: `Generate a comprehensive astrological interpretation for someone born on ${birthDate} at ${birthTime} in ${birthLocation}. Focus on their cosmic blueprint, planetary influences, and potential for growth.`,
      personality: `Provide a detailed personality analysis based on the astrological chart for someone born on ${birthDate} at ${birthTime} in ${birthLocation}. Highlight key traits, strengths, and communication style.`,
      career: `Analyze the career potential based on the astrological chart for someone born on ${birthDate} at ${birthTime} in ${birthLocation}. Suggest suitable career paths and strengths.`,
      relationships: `Provide a relationship analysis based on the astrological chart for someone born on ${birthDate} at ${birthTime} in ${birthLocation}. Focus on romantic tendencies and compatibility factors.`
    };

    return prompts[interpretationType] ?? prompts.general;
  }

  static async generateMockInterpretation(request: InterpretationRequest): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const interpretations = {
      general: `Based on your birth details (${request.birthDate} at ${request.birthTime} in ${request.birthLocation}), your astrological chart reveals a unique cosmic blueprint. Your planetary positions suggest a dynamic personality with strong intuitive abilities and a natural inclination toward creativity and innovation.`,
      personality: `Your personality profile shows a fascinating blend of traits influenced by your birth chart. Born on ${request.birthDate}, your cosmic signature reveals someone who is naturally empathetic, intellectually curious, and possesses a strong sense of justice.`,
      career: `Career-wise, your astrological profile from ${request.birthLocation} indicates excellent potential in fields that involve creativity, communication, or helping others. Your planetary alignments suggest you would thrive in roles that allow for independence and innovation.`,
      relationships: `In relationships, your birth chart reveals someone who values deep, meaningful connections. Born at ${request.birthTime} on ${request.birthDate}, your Venus and Mars placements suggest you are both passionate and nurturing in romantic partnerships.`
    };

    return interpretations[request.interpretationType] ?? interpretations.general;
  }
}

interface UseAIInterpretationReturn {
  interpretation: string | null;
  loading: boolean;
  error: string | null;
  generateInterpretation: (request: InterpretationRequest) => Promise<void>;
  clearInterpretation: () => void;
}

export const useAIInterpretation = (): UseAIInterpretationReturn => {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { isLoading: loading } = useQuery({
    queryKey: ['interpretation'],
    queryFn: () => null, // Placeholder; actual fetch happens in generateInterpretation
    enabled: false, // Prevent auto-fetching
  });

  const generateInterpretation = useCallback(
    async (request: InterpretationRequest) => {
      setError(null);
      
      // Check cache first
      const cacheKey = ['interpretation', JSON.stringify(request)];
      const cachedInterpretation = queryClient.getQueryData<string>(cacheKey);

      if (typeof cachedInterpretation === 'string' && cachedInterpretation !== '') {
        setInterpretation(cachedInterpretation);
        return;
      }

      try {
        // Try xAI service first, fallback to mock if API key is not available
        let result: string;
        try {
          result = await XAIService.generateInterpretation(request);
        } catch (xaiError) {
          devConsole.warn('xAI service failed, falling back to mock service:', xaiError);
          result = await XAIService.generateMockInterpretation(request);
        }
        
        setInterpretation(result);
        queryClient.setQueryData(cacheKey, result); // Cache the result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate interpretation';
        setError(errorMessage);
  devConsole.error('AI interpretation error:', err);
      }
    },
    [queryClient]
  );

  const clearInterpretation = useCallback(() => {
    setInterpretation(null);
    setError(null);
    queryClient.removeQueries({ queryKey: ['interpretation'] }); // Clear cache
  }, [queryClient]);

  return {
    interpretation,
    loading,
    error,
    generateInterpretation,
    clearInterpretation,
  };
};