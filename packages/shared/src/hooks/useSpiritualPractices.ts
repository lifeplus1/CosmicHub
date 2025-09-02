/**
 * SPIRITUAL-001 Week 2 - Spiritual Practices React Hooks
 * ======================================================
 *
 * React hooks for Grok Response #4 spiritual practice methods:
 * - useSpiritualPractices: Main hook for all practice types
 * - usePathworking: Tree of Life pathworking sessions
 * - useTarotMeditation: Tarot meditation practices
 * - useHebrewLetters: Hebrew letter contemplation
 * - useDailyRoutine: Daily spiritual routines
 * - usePracticeSafety: Safety monitoring and protocols
 *
 * Provides comprehensive spiritual practice integration with safety protocols.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  SpiritualLevel,
  PracticeType,
  SafetyStatus,
  PathworkingSessionRequest,
  PathworkingResponse,
  TarotMeditationRequest,
  TarotMeditationResponse,
  HebrewLetterRequest,
  HebrewLetterResponse,
  DailyRoutineRequest,
  DailyRoutineResponse,
  PracticeReadinessRequest,
  PracticeReadinessAssessment,
  SafetyCheckRequest,
  SafetyCheckResponse,
  StartSessionRequest,
  SessionStartResponse,
  CompleteSessionRequest,
  SessionCompletionResponse,
  UserProgress,
  TreePathsResource,
  HebrewLettersResource,
  UseSpiritualPracticesResult,
} from '@cosmichub/types/spiritual-practices';

// API configuration
const SPIRITUAL_PRACTICES_API_BASE = '/api/spiritual/practices';

// Custom error class for spiritual practice errors
class SpiritualPracticeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'SpiritualPracticeError';
  }
}

// API client utility
class SpiritualPracticesAPI {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${SPIRITUAL_PRACTICES_API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new SpiritualPracticeError(
          errorData.message || `Request failed with status ${response.status}`,
          errorData.code,
          errorData
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof SpiritualPracticeError) {
        throw error;
      }
      throw new SpiritualPracticeError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static async assessReadiness(
    request: PracticeReadinessRequest
  ): Promise<PracticeReadinessAssessment> {
    const response = await this.request<{
      assessment: PracticeReadinessAssessment;
    }>('/assess-readiness', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.assessment;
  }

  static async generatePathworking(
    request: PathworkingSessionRequest
  ): Promise<PathworkingResponse> {
    return this.request<PathworkingResponse>('/pathworking/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async generateTarotMeditation(
    request: TarotMeditationRequest
  ): Promise<TarotMeditationResponse> {
    return this.request<TarotMeditationResponse>('/tarot/meditation', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async generateHebrewSession(
    request: HebrewLetterRequest
  ): Promise<HebrewLetterResponse> {
    return this.request<HebrewLetterResponse>('/hebrew/contemplation', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async generateDailyRoutine(
    request: DailyRoutineRequest
  ): Promise<DailyRoutineResponse> {
    return this.request<DailyRoutineResponse>('/daily-routine/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async performSafetyCheck(
    request: SafetyCheckRequest
  ): Promise<SafetyCheckResponse> {
    return this.request<SafetyCheckResponse>('/safety-check', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async startSession(
    request: StartSessionRequest
  ): Promise<SessionStartResponse> {
    return this.request<SessionStartResponse>('/session/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  static async completeSession(
    sessionId: string,
    request: CompleteSessionRequest
  ): Promise<SessionCompletionResponse> {
    return this.request<SessionCompletionResponse>(
      `/session/${sessionId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  static async getProgress(userId: string): Promise<UserProgress> {
    return this.request<UserProgress>(`/progress/${userId}`);
  }

  static async getTreePaths(): Promise<TreePathsResource> {
    return this.request<TreePathsResource>('/resources/paths');
  }

  static async getHebrewLetters(): Promise<HebrewLettersResource> {
    return this.request<HebrewLettersResource>('/resources/hebrew-letters');
  }
}

/**
 * Main spiritual practices hook
 * Provides comprehensive access to all spiritual practice methods
 */
export function useSpiritualPractices(): UseSpiritualPracticesResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] =
    useState<SessionStartResponse | null>(null);

  // Clear error when new operation starts
  const clearError = useCallback(() => setError(null), []);

  // Wrapper for API calls with error handling
  const withErrorHandling = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      try {
        clearError();
        setLoading(true);
        return await operation();
      } catch (err) {
        const errorMessage =
          err instanceof SpiritualPracticeError
            ? err.message
            : 'An unexpected error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearError]
  );

  // Practice generation methods
  const generatePathworking = useCallback(
    (request: PathworkingSessionRequest) =>
      withErrorHandling(() =>
        SpiritualPracticesAPI.generatePathworking(request)
      ),
    [withErrorHandling]
  );

  const generateTarotMeditation = useCallback(
    (request: TarotMeditationRequest) =>
      withErrorHandling(() =>
        SpiritualPracticesAPI.generateTarotMeditation(request)
      ),
    [withErrorHandling]
  );

  const generateHebrewSession = useCallback(
    (request: HebrewLetterRequest) =>
      withErrorHandling(() =>
        SpiritualPracticesAPI.generateHebrewSession(request)
      ),
    [withErrorHandling]
  );

  const generateDailyRoutine = useCallback(
    (request: DailyRoutineRequest) =>
      withErrorHandling(() =>
        SpiritualPracticesAPI.generateDailyRoutine(request)
      ),
    [withErrorHandling]
  );

  // Safety and monitoring methods
  const assessReadiness = useCallback(
    (request: PracticeReadinessRequest) =>
      withErrorHandling(() => SpiritualPracticesAPI.assessReadiness(request)),
    [withErrorHandling]
  );

  const performSafetyCheck = useCallback(
    (request: SafetyCheckRequest) =>
      withErrorHandling(() =>
        SpiritualPracticesAPI.performSafetyCheck(request)
      ),
    [withErrorHandling]
  );

  // Session management methods
  const startSession = useCallback(
    async (request: StartSessionRequest) => {
      const response = await withErrorHandling(() =>
        SpiritualPracticesAPI.startSession(request)
      );
      setActiveSession(response);
      return response;
    },
    [withErrorHandling]
  );

  const completeSession = useCallback(
    async (sessionId: string, request: CompleteSessionRequest) => {
      const response = await withErrorHandling(() =>
        SpiritualPracticesAPI.completeSession(sessionId, request)
      );
      setActiveSession(null); // Clear active session
      return response;
    },
    [withErrorHandling]
  );

  // Progress tracking
  const getProgress = useCallback(
    (userId: string) =>
      withErrorHandling(() => SpiritualPracticesAPI.getProgress(userId)),
    [withErrorHandling]
  );

  // Resource methods
  const getTreePaths = useCallback(
    () => withErrorHandling(() => SpiritualPracticesAPI.getTreePaths()),
    [withErrorHandling]
  );

  const getHebrewLetters = useCallback(
    () => withErrorHandling(() => SpiritualPracticesAPI.getHebrewLetters()),
    [withErrorHandling]
  );

  return {
    // Practice generation
    generatePathworking,
    generateTarotMeditation,
    generateHebrewSession,
    generateDailyRoutine,

    // Safety and monitoring
    assessReadiness,
    performSafetyCheck,

    // Session management
    startSession,
    completeSession,

    // Progress tracking
    getProgress,

    // Resources
    getTreePaths,
    getHebrewLetters,

    // State
    loading,
    error,
    activeSession,
  };
}

/**
 * Specialized hook for Tree of Life pathworking
 */
export function usePathworking() {
  const [pathworkingSession, setPathworkingSession] =
    useState<PathworkingResponse | null>(null);
  const [currentPath, setCurrentPath] = useState<number | null>(null);
  const [sessionProgress, setSessionProgress] = useState<{
    phase: 'preparation' | 'journey' | 'integration' | 'complete';
    timeRemaining?: number;
  }>({ phase: 'preparation' });

  const { generatePathworking, startSession, completeSession, loading, error } =
    useSpiritualPractices();

  // Generate pathworking session
  const createPathworkingSession = useCallback(
    async (pathNumber: number, userLevel: SpiritualLevel, duration = 20) => {
      try {
        const response = await generatePathworking({
          path_number: pathNumber,
          user_level: userLevel,
          session_duration: duration,
        });

        setPathworkingSession(response);
        setCurrentPath(pathNumber);
        setSessionProgress({ phase: 'preparation' });

        return response;
      } catch (err) {
        console.error('Failed to create pathworking session:', err);
        throw err;
      }
    },
    [generatePathworking]
  );

  // Start pathworking session
  const startPathworking = useCallback(
    async (level: SpiritualLevel) => {
      if (!pathworkingSession) {
        throw new Error('No pathworking session available');
      }

      const sessionResponse = await startSession({
        practice_type: 'pathworking',
        session_content: pathworkingSession.data || {},
        level,
        estimated_duration: pathworkingSession.estimated_duration,
      });

      setSessionProgress({
        phase: 'journey',
        timeRemaining: pathworkingSession.estimated_duration,
      });
      return sessionResponse;
    },
    [pathworkingSession, startSession]
  );

  // Complete pathworking session
  const completePathworking = useCallback(
    async (
      sessionId: string,
      insights: string[],
      adverseEffects?: string[]
    ) => {
      const response = await completeSession(sessionId, {
        insights,
        adverse_effects: adverseEffects,
        completion_quality: 'full',
      });

      setSessionProgress({ phase: 'complete' });
      return response;
    },
    [completeSession]
  );

  // Reset session
  const resetPathworking = useCallback(() => {
    setPathworkingSession(null);
    setCurrentPath(null);
    setSessionProgress({ phase: 'preparation' });
  }, []);

  return {
    // State
    pathworkingSession,
    currentPath,
    sessionProgress,
    loading,
    error,

    // Actions
    createPathworkingSession,
    startPathworking,
    completePathworking,
    resetPathworking,
  };
}

/**
 * Specialized hook for Tarot meditation
 */
export function useTarotMeditation() {
  const [tarotSession, setTarotSession] =
    useState<TarotMeditationResponse | null>(null);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [dailyCard, setDailyCard] = useState<{
    card: string;
    date: string;
    insights: string[];
  } | null>(null);

  const {
    generateTarotMeditation,
    startSession,
    completeSession,
    loading,
    error,
  } = useSpiritualPractices();

  // Generate Tarot meditation
  const createTarotMeditation = useCallback(
    async (
      type: 'daily' | 'journey' | 'correspondence',
      userLevel: SpiritualLevel,
      cardPreference?: string
    ) => {
      try {
        const response = await generateTarotMeditation({
          meditation_type: type,
          user_level: userLevel,
          card_preference: cardPreference,
        });

        setTarotSession(response);
        setCurrentCard(response.data?.card || null);

        // If it's a daily card, cache it
        if (type === 'daily') {
          setDailyCard({
            card: response.data?.card || '',
            date: new Date().toDateString(),
            insights: [],
          });
        }

        return response;
      } catch (err) {
        console.error('Failed to create Tarot meditation:', err);
        throw err;
      }
    },
    [generateTarotMeditation]
  );

  // Start Tarot meditation session
  const startTarotMeditation = useCallback(
    async (level: SpiritualLevel) => {
      if (!tarotSession) {
        throw new Error('No Tarot session available');
      }

      return startSession({
        practice_type: 'tarot_meditation',
        session_content: tarotSession.data || {},
        level,
        estimated_duration: tarotSession.data?.duration_minutes || 15,
      });
    },
    [tarotSession, startSession]
  );

  // Add insight to daily card
  const addDailyInsight = useCallback(
    (insight: string) => {
      if (dailyCard) {
        setDailyCard(prev =>
          prev
            ? {
                ...prev,
                insights: [...prev.insights, insight],
              }
            : null
        );
      }
    },
    [dailyCard]
  );

  // Get current daily card or generate new one
  const getDailyCard = useCallback(
    async (userLevel: SpiritualLevel) => {
      const today = new Date().toDateString();

      // Return cached card if it's from today
      if (dailyCard && dailyCard.date === today) {
        return dailyCard;
      }

      // Generate new daily card
      await createTarotMeditation('daily', userLevel);
      return dailyCard;
    },
    [dailyCard, createTarotMeditation]
  );

  return {
    // State
    tarotSession,
    currentCard,
    dailyCard,
    loading,
    error,

    // Actions
    createTarotMeditation,
    startTarotMeditation,
    getDailyCard,
    addDailyInsight,
  };
}

/**
 * Specialized hook for Hebrew letter contemplation
 */
export function useHebrewLetters() {
  const [hebrewSession, setHebrewSession] =
    useState<HebrewLetterResponse | null>(null);
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [studyProgress, setStudyProgress] = useState<{
    lettersStudied: string[];
    currentStreak: number;
    totalSessions: number;
  }>({
    lettersStudied: [],
    currentStreak: 0,
    totalSessions: 0,
  });

  const {
    generateHebrewSession,
    startSession,
    completeSession,
    getHebrewLetters,
    loading,
    error,
  } = useSpiritualPractices();

  // Generate Hebrew letter session
  const createHebrewSession = useCallback(
    async (
      letter: string,
      userLevel: SpiritualLevel,
      includeGematria = true
    ) => {
      try {
        const response = await generateHebrewSession({
          letter,
          user_level: userLevel,
          include_gematria: includeGematria,
        });

        setHebrewSession(response);
        setCurrentLetter(letter);

        return response;
      } catch (err) {
        console.error('Failed to create Hebrew session:', err);
        throw err;
      }
    },
    [generateHebrewSession]
  );

  // Start Hebrew letter session
  const startHebrewSession = useCallback(
    async (level: SpiritualLevel) => {
      if (!hebrewSession) {
        throw new Error('No Hebrew session available');
      }

      return startSession({
        practice_type: 'hebrew_contemplation',
        session_content: hebrewSession.data || {},
        level,
        estimated_duration: hebrewSession.data?.meditation_duration || 15,
      });
    },
    [hebrewSession, startSession]
  );

  // Complete Hebrew session and update progress
  const completeHebrewSession = useCallback(
    async (sessionId: string, insights: string[], letter: string) => {
      const response = await completeSession(sessionId, {
        insights,
        completion_quality: 'full',
      });

      // Update study progress
      setStudyProgress(prev => {
        const newLettersStudied = prev.lettersStudied.includes(letter)
          ? prev.lettersStudied
          : [...prev.lettersStudied, letter];

        return {
          lettersStudied: newLettersStudied,
          currentStreak: prev.currentStreak + 1,
          totalSessions: prev.totalSessions + 1,
        };
      });

      return response;
    },
    [completeSession]
  );

  // Get next recommended letter for study
  const getNextLetter = useCallback(
    async (userLevel: SpiritualLevel) => {
      const letters = await getHebrewLetters();
      const allLetters = Object.keys(letters.letters);

      // Find next unstudied letter
      const nextLetter = allLetters.find(
        letter => !studyProgress.lettersStudied.includes(letter)
      );

      return nextLetter || allLetters[0]; // Default to first letter if all studied
    },
    [getHebrewLetters, studyProgress.lettersStudied]
  );

  return {
    // State
    hebrewSession,
    currentLetter,
    studyProgress,
    loading,
    error,

    // Actions
    createHebrewSession,
    startHebrewSession,
    completeHebrewSession,
    getNextLetter,
  };
}

/**
 * Specialized hook for daily spiritual routines
 */
export function useDailyRoutine() {
  const [dailyRoutine, setDailyRoutine] = useState<DailyRoutineResponse | null>(
    null
  );
  const [todayProgress, setTodayProgress] = useState<{
    morningComplete: boolean;
    eveningComplete: boolean;
    insightsRecorded: number;
    currentStreak: number;
  }>({
    morningComplete: false,
    eveningComplete: false,
    insightsRecorded: 0,
    currentStreak: 0,
  });

  const { generateDailyRoutine, loading, error } = useSpiritualPractices();

  // Generate daily routine
  const createDailyRoutine = useCallback(
    async (
      userLevel: SpiritualLevel,
      availableTime: number,
      spiritualGoals: string[] = [],
      focusAreas: string[] = []
    ) => {
      try {
        const response = await generateDailyRoutine({
          user_level: userLevel,
          available_time: availableTime,
          spiritual_goals: spiritualGoals,
          focus_areas: focusAreas,
        });

        setDailyRoutine(response);
        return response;
      } catch (err) {
        console.error('Failed to create daily routine:', err);
        throw err;
      }
    },
    [generateDailyRoutine]
  );

  // Mark morning practice complete
  const completeMorningPractice = useCallback((insights: string[] = []) => {
    setTodayProgress(prev => ({
      ...prev,
      morningComplete: true,
      insightsRecorded: prev.insightsRecorded + insights.length,
    }));
  }, []);

  // Mark evening practice complete
  const completeEveningPractice = useCallback((insights: string[] = []) => {
    setTodayProgress(prev => {
      const bothComplete = prev.morningComplete;
      return {
        ...prev,
        eveningComplete: true,
        insightsRecorded: prev.insightsRecorded + insights.length,
        currentStreak: bothComplete
          ? prev.currentStreak + 1
          : prev.currentStreak,
      };
    });
  }, []);

  // Reset daily progress (call at start of new day)
  const resetDailyProgress = useCallback(() => {
    setTodayProgress(prev => ({
      morningComplete: false,
      eveningComplete: false,
      insightsRecorded: 0,
      currentStreak: prev.currentStreak, // Maintain streak
    }));
  }, []);

  // Get completion percentage for today
  const getDailyCompletionPercentage = useCallback(() => {
    const { morningComplete, eveningComplete, insightsRecorded } =
      todayProgress;
    let percentage = 0;

    if (morningComplete) percentage += 40;
    if (eveningComplete) percentage += 40;
    if (insightsRecorded > 0) percentage += 20;

    return percentage;
  }, [todayProgress]);

  return {
    // State
    dailyRoutine,
    todayProgress,
    loading,
    error,

    // Actions
    createDailyRoutine,
    completeMorningPractice,
    completeEveningPractice,
    resetDailyProgress,
    getDailyCompletionPercentage,
  };
}

/**
 * Specialized hook for practice safety monitoring
 */
export function usePracticeSafety() {
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatus>('cleared');
  const [safetyAlerts, setSafetyAlerts] = useState<string[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const { performSafetyCheck, loading, error } = useSpiritualPractices();

  // Perform comprehensive safety check
  const checkSafety = useCallback(
    async (
      practiceType: PracticeType,
      level: SpiritualLevel,
      currentState: {
        grounded: boolean;
        recentAdverseEffects: string[];
        sleepQuality: 'good' | 'fair' | 'poor';
        stressLevel: number;
      }
    ) => {
      try {
        const response = await performSafetyCheck({
          practice_session: {
            type: practiceType,
            level,
            duration: 20,
            preparation_complete: false,
            protection_invoked: false,
          },
          current_state: {
            grounded: currentState.grounded,
            recent_adverse_effects: currentState.recentAdverseEffects,
            sleep_quality: currentState.sleepQuality,
            stress_level: currentState.stressLevel,
          },
        });

        const result = response.data;
        if (result) {
          setSafetyStatus(result.safe_to_proceed ? 'cleared' : 'restricted');
          setSafetyAlerts(result.warnings || []);
        }

        return response;
      } catch (err) {
        console.error('Safety check failed:', err);
        setSafetyStatus('restricted');
        setSafetyAlerts(['Safety check failed - practice not recommended']);
        throw err;
      }
    },
    [performSafetyCheck]
  );

  // Trigger emergency protocols
  const triggerEmergency = useCallback((reason: string) => {
    setEmergencyMode(true);
    setSafetyStatus('emergency');
    setSafetyAlerts(prev => [...prev, `Emergency: ${reason}`]);

    // In a real app, this would trigger notifications, contacts, etc.
    console.warn('SPIRITUAL PRACTICE EMERGENCY TRIGGERED:', reason);
  }, []);

  // Clear emergency mode
  const clearEmergency = useCallback(() => {
    setEmergencyMode(false);
    setSafetyStatus('cleared');
    setSafetyAlerts([]);
  }, []);

  // Add safety alert
  const addSafetyAlert = useCallback(
    (alert: string) => {
      setSafetyAlerts(prev => [...prev, alert]);
      if (safetyStatus === 'cleared') {
        setSafetyStatus('caution');
      }
    },
    [safetyStatus]
  );

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setSafetyAlerts([]);
    if (!emergencyMode) {
      setSafetyStatus('cleared');
    }
  }, [emergencyMode]);

  return {
    // State
    safetyStatus,
    safetyAlerts,
    emergencyMode,
    loading,
    error,

    // Actions
    checkSafety,
    triggerEmergency,
    clearEmergency,
    addSafetyAlert,
    clearAlerts,
  };
}

/**
 * Auto-cleanup hook for session timeouts
 */
export function useSessionTimeout(timeoutMinutes = 60) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const startTimeout = useCallback(
    (onTimeout: () => void) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      const timeoutMs = timeoutMinutes * 60 * 1000;
      setTimeRemaining(timeoutMinutes * 60);

      timeoutRef.current = setTimeout(() => {
        onTimeout();
        setTimeRemaining(null);
      }, timeoutMs);

      // Update remaining time every minute
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 60) {
            clearInterval(interval);
            return null;
          }
          return prev - 60;
        });
      }, 60000);
    },
    [timeoutMinutes]
  );

  const clearSessionTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    setTimeRemaining(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    timeRemaining,
    startTimeout,
    clearTimeout: clearSessionTimeout,
  };
}

// Export all hooks
export { SpiritualPracticesAPI, SpiritualPracticeError };
