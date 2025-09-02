import { useState, useEffect, useCallback } from 'react';
import { spiritualAIBridge } from '../spiritual-ai-bridge';
import type {
  SpiritualUserProfile,
  LearningPath,
  PersonalizedCurriculum,
  PersonalizedLesson,
  AdaptiveUIConfig,
  PatternAnalysis,
  PracticeReadiness,
  LearningStage,
} from '../types/spiritual-types';

// ===========================================
// SPIRITUAL PROFILE HOOK
// ===========================================

export function useSpiritualProfile(userId: string) {
  const [profile, setProfile] = useState<SpiritualUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await spiritualAIBridge.getSpiritualProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(
    async (updates: Partial<SpiritualUserProfile>) => {
      if (!userId) return;

      try {
        const updated = await spiritualAIBridge.updateSpiritualProfile(
          userId,
          updates
        );
        setProfile(updated);
        return updated;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update profile'
        );
        throw err;
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}

// ===========================================
// LEARNING PATH HOOK
// ===========================================

export function useLearningPath(
  userId: string,
  currentKnowledge?: Record<string, any>
) {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generatePath = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const path = await spiritualAIBridge.generateLearningPath(
        userId,
        currentKnowledge
      );
      setLearningPath(path);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate learning path'
      );
    } finally {
      setLoading(false);
    }
  }, [userId, currentKnowledge]);

  useEffect(() => {
    generatePath();
  }, [generatePath]);

  return {
    learningPath,
    loading,
    error,
    regenerate: generatePath,
  };
}

// ===========================================
// PERSONALIZED CURRICULUM HOOK
// ===========================================

export function usePersonalizedCurriculum(userId: string) {
  const [curriculum, setCurriculum] = useState<PersonalizedCurriculum | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurriculum = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await spiritualAIBridge.getPersonalizedCurriculum(userId);
      setCurriculum(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch curriculum'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  return {
    curriculum,
    loading,
    error,
    refetch: fetchCurriculum,
  };
}

// ===========================================
// DAILY LESSONS HOOK
// ===========================================

export function useDailyLessons(userId: string, stage: LearningStage) {
  const [currentLesson, setCurrentLesson] = useState<PersonalizedLesson | null>(
    null
  );
  const [lessonHistory, setLessonHistory] = useState<PersonalizedLesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = useCallback(
    async (dayNumber: number) => {
      if (!userId || !stage) return;

      setLoading(true);
      setError(null);

      try {
        const lesson = await spiritualAIBridge.getDailyLesson(
          userId,
          stage,
          dayNumber
        );
        setCurrentLesson(lesson);

        // Add to history if not already present
        setLessonHistory(prev => {
          const exists = prev.find(l => l.id === lesson.id);
          if (exists) return prev;
          return [...prev, lesson];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch lesson');
      } finally {
        setLoading(false);
      }
    },
    [userId, stage]
  );

  const getTodaysLesson = useCallback(() => {
    const dayNumber =
      Math.floor(
        (Date.now() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
      ) + 1;
    return fetchLesson(dayNumber);
  }, [fetchLesson]);

  return {
    currentLesson,
    lessonHistory,
    loading,
    error,
    fetchLesson,
    getTodaysLesson,
  };
}

// ===========================================
// ADAPTIVE UI HOOK
// ===========================================

export function useAdaptiveUI(userId: string) {
  const [config, setConfig] = useState<AdaptiveUIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await spiritualAIBridge.getAdaptiveUIConfig(userId);
      setConfig(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch UI config'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Helper functions for UI adaptation
  const shouldShowAdvancedFeatures =
    config?.uiAdaptations.showAdvancedFeatures ?? false;
  const getComplexityLevel = () =>
    config?.uiAdaptations.complexityLevel ?? 'standard';
  const getGuidanceLevel = () => config?.uiAdaptations.guidanceLevel ?? 'full';
  const shouldShowSafetyWarnings = config?.uiAdaptations.safetyWarnings ?? true;

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    // Convenience getters
    shouldShowAdvancedFeatures,
    getComplexityLevel,
    getGuidanceLevel,
    shouldShowSafetyWarnings,
  };
}

// ===========================================
// PRACTICE READINESS HOOK
// ===========================================

export function usePracticeReadiness(userId: string) {
  const [assessments, setAssessments] = useState<
    Record<string, PracticeReadiness>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessPractice = useCallback(
    async (practiceType: string) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const assessment = await spiritualAIBridge.assessPracticeReadiness(
          userId,
          practiceType
        );
        setAssessments(prev => ({
          ...prev,
          [practiceType]: assessment,
        }));
        return assessment;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to assess practice readiness'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const isReadyFor = useCallback(
    (practiceType: string) => {
      return assessments[practiceType]?.assessment.ready ?? false;
    },
    [assessments]
  );

  const getWarnings = useCallback(
    (practiceType: string) => {
      return assessments[practiceType]?.assessment.warnings ?? [];
    },
    [assessments]
  );

  return {
    assessments,
    loading,
    error,
    assessPractice,
    isReadyFor,
    getWarnings,
  };
}

// ===========================================
// PATTERN ANALYSIS HOOK
// ===========================================

export function usePatternAnalysis(userId: string) {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePatterns = useCallback(
    async (timeframe?: { from: Date; to: Date }) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const data = await spiritualAIBridge.analyzePatterns(userId, timeframe);
        setAnalysis(data);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to analyze patterns'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return {
    analysis,
    loading,
    error,
    analyzePatterns,
  };
}

// ===========================================
// COMPREHENSIVE SPIRITUAL AI HOOK
// ===========================================

/**
 * Combined hook for complete spiritual AI integration
 * Provides all spiritual AI functionality in one convenient hook
 */
export function useSpiritualAI(userId: string) {
  const profile = useSpiritualProfile(userId);
  const adaptiveUI = useAdaptiveUI(userId);
  const practiceReadiness = usePracticeReadiness(userId);

  // Only fetch curriculum and learning path if profile is loaded
  const curriculum = usePersonalizedCurriculum(profile.profile ? userId : '');
  const learningPath = useLearningPath(profile.profile ? userId : '');
  const dailyLessons = useDailyLessons(
    profile.profile ? userId : '',
    profile.profile?.learningStage ?? 'foundation'
  );

  const isLoading = profile.loading || adaptiveUI.loading;
  const hasError = profile.error || adaptiveUI.error;

  return {
    // Individual hook results
    profile,
    curriculum,
    learningPath,
    dailyLessons,
    adaptiveUI,
    practiceReadiness,

    // Combined state
    isLoading,
    hasError,

    // Convenience methods
    isReady: !!profile.profile && !isLoading,
    spiritualLevel: profile.profile?.spiritualLevel,
    learningStage: profile.profile?.learningStage,
  };
}
