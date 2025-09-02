// packages/shared/src/hooks/useSpiritualAI.ts
/**
 * SPIRITUAL-001: React Hook for AI-Enhanced Spiritual Analysis
 * Based on Grok Response #2 recommendations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SpiritualAIService,
  SynthesisInput,
  SynthesisOutput,
  LearningPath,
  PatternAnalysis,
  UserProfile,
  CurrentKnowledge,
  SpiritualAIError,
  SpiritualAIConfig,
  UseSpiritualAI,
} from '@cosmichub/types/spiritual-ai';

interface SpiritualAIHookOptions {
  config?: Partial<SpiritualAIConfig>;
  enableCaching?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useSpiritualAI(
  options: SpiritualAIHookOptions = {}
): UseSpiritualAI {
  // Default configuration
  const defaultConfig: SpiritualAIConfig = {
    api_endpoint: '/api/spiritual-ai',
    timeout_ms: 30000,
    cache_duration_minutes: 15,
    enable_pattern_caching: true,
    max_synthesis_complexity: 10,
    safety_checks_enabled: true,
    ...options.config,
  };

  // State management
  const [synthesisData, setSynthesisData] = useState<SynthesisOutput | null>(
    null
  );
  const [synthesisLoading, setSynthesisLoading] = useState(false);
  const [synthesisError, setSynthesisError] = useState<SpiritualAIError | null>(
    null
  );

  const [learningPathData, setLearningPathData] = useState<LearningPath | null>(
    null
  );
  const [learningPathLoading, setLearningPathLoading] = useState(false);
  const [learningPathError, setLearningPathError] =
    useState<SpiritualAIError | null>(null);

  const [patternsData, setPatternsData] = useState<PatternAnalysis | null>(
    null
  );
  const [patternsLoading, setPatternsLoading] = useState(false);
  const [patternsError, setPatternsError] = useState<SpiritualAIError | null>(
    null
  );

  const [isConnected, setIsConnected] = useState(true);

  // Cache management
  const cacheRef = useRef(new Map<string, { data: any; timestamp: number }>());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Utility functions
  const getCachedData = useCallback(
    (key: string) => {
      if (!options.enableCaching) return null;

      const cached = cacheRef.current.get(key);
      if (!cached) return null;

      const isExpired =
        Date.now() - cached.timestamp >
        defaultConfig.cache_duration_minutes * 60 * 1000;
      if (isExpired) {
        cacheRef.current.delete(key);
        return null;
      }

      return cached.data;
    },
    [options.enableCaching, defaultConfig.cache_duration_minutes]
  );

  const setCachedData = useCallback(
    (key: string, data: any) => {
      if (!options.enableCaching) return;

      cacheRef.current.set(key, {
        data,
        timestamp: Date.now(),
      });
    },
    [options.enableCaching]
  );

  const createCacheKey = useCallback((type: string, params: any) => {
    return `${type}_${JSON.stringify(params)}`;
  }, []);

  // API call wrapper with error handling
  const makeAPICall = useCallback(
    async <T>(
      endpoint: string,
      data: any,
      setLoading: (loading: boolean) => void,
      setError: (error: SpiritualAIError | null) => void
    ): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        // Cancel previous request if exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        const response = await fetch(
          `${defaultConfig.api_endpoint}${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'API call failed');
        }

        setIsConnected(true);
        return result.data;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return null; // Request was cancelled
        }

        const spiritualError: SpiritualAIError = {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unknown error occurred',
          details: { originalError: error },
          suggestions: [
            'Check your internet connection',
            'Try again in a moment',
          ],
        };

        setError(spiritualError);
        setIsConnected(false);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [defaultConfig.api_endpoint]
  );

  // Synthesis function
  const synthesize = useCallback(
    async (input: SynthesisInput) => {
      const cacheKey = createCacheKey('synthesis', input);
      const cached = getCachedData(cacheKey);

      if (cached) {
        setSynthesisData(cached);
        return;
      }

      // Validate input complexity
      const complexityScore =
        (input.birth_data.planets?.length || 0) +
        (input.birth_data.transits?.length || 0) +
        (input.spiritual_systems.kabbalah?.active_sephirot?.length || 0);

      if (complexityScore > defaultConfig.max_synthesis_complexity) {
        setSynthesisError({
          code: 'COMPLEXITY_LIMIT_EXCEEDED',
          message: 'Input data is too complex for processing',
          suggestions: [
            'Reduce the number of planets or transits',
            'Simplify spiritual system inputs',
          ],
        });
        return;
      }

      const result = await makeAPICall<SynthesisOutput>(
        '/synthesize',
        input,
        setSynthesisLoading,
        setSynthesisError
      );

      if (result) {
        setSynthesisData(result);
        setCachedData(cacheKey, result);
      }
    },
    [
      createCacheKey,
      getCachedData,
      setCachedData,
      makeAPICall,
      defaultConfig.max_synthesis_complexity,
    ]
  );

  // Learning path generation
  const generatePath = useCallback(
    async (profile: UserProfile, knowledge: CurrentKnowledge) => {
      const cacheKey = createCacheKey('learning_path', { profile, knowledge });
      const cached = getCachedData(cacheKey);

      if (cached) {
        setLearningPathData(cached);
        return;
      }

      const result = await makeAPICall<LearningPath>(
        '/learning-path',
        { user_profile: profile, current_knowledge: knowledge },
        setLearningPathLoading,
        setLearningPathError
      );

      if (result) {
        setLearningPathData(result);
        setCachedData(cacheKey, result);
      }
    },
    [createCacheKey, getCachedData, setCachedData, makeAPICall]
  );

  // Pattern analysis
  const analyzePatterns = useCallback(
    async (history: any[], current: any) => {
      const cacheKey = createCacheKey('patterns', {
        history: history.slice(-10),
        current,
      }); // Only cache last 10 entries
      const cached = getCachedData(cacheKey);

      if (cached) {
        setPatternsData(cached);
        return;
      }

      const result = await makeAPICall<PatternAnalysis>(
        '/patterns',
        { user_history: history, current_analysis: current },
        setPatternsLoading,
        setPatternsError
      );

      if (result) {
        setPatternsData(result);
        setCachedData(cacheKey, result);
      }
    },
    [createCacheKey, getCachedData, setCachedData, makeAPICall]
  );

  // Auto-refresh setup
  useEffect(() => {
    if (!options.autoRefresh || !options.refreshInterval) return;

    const interval = setInterval(() => {
      // Refresh synthesis if we have input data
      if (synthesisData) {
        // Note: Would need to store original input to re-synthesize
        console.log('Auto-refresh triggered for synthesis');
      }

      // Refresh patterns if we have history data
      if (patternsData) {
        // Note: Would need to store original history to re-analyze
        console.log('Auto-refresh triggered for patterns');
      }
    }, options.refreshInterval);

    return () => clearInterval(interval);
  }, [
    options.autoRefresh,
    options.refreshInterval,
    synthesisData,
    patternsData,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    synthesis: {
      data: synthesisData,
      loading: synthesisLoading,
      error: synthesisError,
      synthesize,
    },
    learningPath: {
      data: learningPathData,
      loading: learningPathLoading,
      error: learningPathError,
      generatePath,
    },
    patterns: {
      data: patternsData,
      loading: patternsLoading,
      error: patternsError,
      analyzePatterns,
    },
    config: defaultConfig,
    isConnected,
  };
}

// Additional utility hooks

export function useSpiritualSynthesis(input?: SynthesisInput) {
  const { synthesis } = useSpiritualAI();

  useEffect(() => {
    if (input) {
      synthesis.synthesize(input);
    }
  }, [input, synthesis.synthesize]);

  return synthesis;
}

export function useLearningPath(
  profile?: UserProfile,
  knowledge?: CurrentKnowledge
) {
  const { learningPath } = useSpiritualAI();

  useEffect(() => {
    if (profile && knowledge) {
      learningPath.generatePath(profile, knowledge);
    }
  }, [profile, knowledge, learningPath.generatePath]);

  return learningPath;
}

export function usePatternAnalysis(history?: any[], current?: any) {
  const { patterns } = useSpiritualAI();

  useEffect(() => {
    if (history && current) {
      patterns.analyzePatterns(history, current);
    }
  }, [history, current, patterns.analyzePatterns]);

  return patterns;
}

// Performance optimization hook
export function useSpiritualAIOptimized(deps: any[] = []) {
  const hookInstance = useRef<UseSpiritualAI | null>(null);

  // Only create new instance if dependencies change
  const depsChanged = useRef(false);
  const prevDeps = useRef(deps);

  if (JSON.stringify(prevDeps.current) !== JSON.stringify(deps)) {
    depsChanged.current = true;
    prevDeps.current = deps;
  }

  if (!hookInstance.current || depsChanged.current) {
    hookInstance.current = useSpiritualAI({
      enableCaching: true,
      autoRefresh: false,
    });
    depsChanged.current = false;
  }

  return hookInstance.current;
}
