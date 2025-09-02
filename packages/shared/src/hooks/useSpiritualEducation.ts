/**
 * SPIRITUAL EDUCATION HOOKS - Grok Response #3 Implementation
 * ==========================================================
 * 
 * React hooks for comprehensive spiritual education system
 * following traditional Golden Dawn progression with AI-powered personalization.
 * 
 * Author: CosmicHub Development Team
 * Date: September 2, 2025
 * Integration: SPIRITUAL-001 Week 2 Educational Framework
 */

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import type {
  SpiritualLevel,
  SpiritualAssessmentResult,
  UserAssessmentData,
  PersonalizedCurriculum,
  SpiritualLesson,
  LessonResponse,
  LessonEvaluation,
  ProgressAnalytics,
  MobileLesson,
  SafetyAssessment,
  PathwaysResponse,
  WeekOverview,
  HealthStatus,
  SpiritualEducationResponse,
  UseSpiritualEducation,
  SpiritualEducationContextValue
} from '../types/spiritual-education';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const SPIRITUAL_EDUCATION_API_BASE = '/api/spiritual-education';

class SpiritualEducationAPI {
  private baseUrl: string;

  constructor(baseUrl: string = SPIRITUAL_EDUCATION_API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<SpiritualEducationResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Spiritual education API error: ${response.status}`);
    }

    return response.json();
  }

  // Assessment methods
  async assessLevel(userData: UserAssessmentData): Promise<SpiritualAssessmentResult> {
    const response = await this.request<SpiritualAssessmentResult>('/assess-level', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data!;
  }

  async generateCurriculum(
    assessment: SpiritualAssessmentResult,
    birthChartData?: any
  ): Promise<PersonalizedCurriculum> {
    const response = await this.request<PersonalizedCurriculum>('/generate-curriculum', {
      method: 'POST',
      body: JSON.stringify({
        assessment,
        birth_chart_data: birthChartData,
      }),
    });
    return response.data!;
  }

  // Lesson methods
  async getLesson(
    pathway: SpiritualLevel,
    week: number,
    lesson: number
  ): Promise<{ lesson: SpiritualLesson; week_theme: string; learning_objectives: string[] }> {
    const response = await this.request(`/get-lesson/${pathway}/${week}/${lesson}`);
    return response.data!;
  }

  async submitLessonCompletion(
    userId: string,
    lessonId: string,
    userResponse: LessonResponse
  ): Promise<LessonEvaluation> {
    const response = await this.request<LessonEvaluation>('/submit-lesson', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        lesson_id: lessonId,
        user_response: userResponse,
      }),
    });
    return response.data!;
  }

  // Progress methods
  async getProgress(userId: string): Promise<ProgressAnalytics> {
    const response = await this.request<ProgressAnalytics>(`/progress/${userId}`);
    return response.data!;
  }

  // Mobile methods
  async getDailyMobileLesson(
    userLevel: SpiritualLevel,
    availableMinutes: number
  ): Promise<MobileLesson> {
    const response = await this.request<MobileLesson>('/mobile/daily-lesson', {
      method: 'POST',
      body: JSON.stringify({
        user_level: userLevel,
        available_minutes: availableMinutes,
      }),
    });
    return response.data!;
  }

  // Safety methods
  async performSafetyCheck(
    userId: string,
    recentResponses: any[],
    practiceLog: any
  ): Promise<SafetyAssessment> {
    const response = await this.request<SafetyAssessment>('/safety-check', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        recent_responses: recentResponses,
        practice_log: practiceLog,
      }),
    });
    return response.data!;
  }

  // Metadata methods
  async getPathways(): Promise<PathwaysResponse> {
    const response = await this.request<PathwaysResponse>('/pathways');
    return response.data!;
  }

  async getWeekOverview(pathway: SpiritualLevel, week: number): Promise<WeekOverview> {
    const response = await this.request<WeekOverview>(`/week-overview/${pathway}/${week}`);
    return response.data!;
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const response = await this.request<HealthStatus>('/health');
    return response.data!;
  }
}

// ============================================================================
// CONTEXT FOR SPIRITUAL EDUCATION
// ============================================================================

const SpiritualEducationContext = createContext<SpiritualEducationContextValue | null>(null);

export const SpiritualEducationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const api = new SpiritualEducationAPI();
  
  // State for all spiritual education features
  const [pathways, setPathways] = useState<Record<string, any> | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  
  // Use the main hook
  const spiritualEducation = useSpiritualEducation(api);

  // Context-specific methods
  const getPathwayInfo = useCallback(async () => {
    try {
      const pathwayData = await api.getPathways();
      setPathways(pathwayData.pathways);
    } catch (error) {
      console.error('Failed to fetch pathway info:', error);
    }
  }, [api]);

  const checkHealth = useCallback(async () => {
    try {
      const health = await api.getHealthStatus();
      setHealthStatus(health);
    } catch (error) {
      console.error('Failed to check health:', error);
    }
  }, [api]);

  const resetProgress = useCallback(() => {
    // Reset all progress data
    spiritualEducation.assessLevel.data = null;
    spiritualEducation.curriculum.data = null;
    spiritualEducation.lessons.currentLesson = null;
    spiritualEducation.progress.data = null;
    spiritualEducation.mobile.dailyLesson = null;
    spiritualEducation.safety.assessment = null;
  }, [spiritualEducation]);

  // Load initial data
  useEffect(() => {
    getPathwayInfo();
    checkHealth();
  }, [getPathwayInfo, checkHealth]);

  const contextValue: SpiritualEducationContextValue = {
    ...spiritualEducation,
    pathways,
    healthStatus,
    metadata: {
      total_weeks: 52,
      pathways: {
        beginner: { weeks: [1, 4], focus: 'foundational_learning' },
        intermediate: { weeks: [5, 12], focus: 'depth_building' },
        advanced: { weeks: [13, 26], focus: 'synthesis_mastery' },
        master: { weeks: [27, 52], focus: 'teaching_preparation' },
      },
      traditional_sources: ['Golden Dawn', 'Hermetic Kabbalah', 'Rider-Waite-Smith Tarot'],
      safety_requirements: ['Ethical grounding', 'Meditation experience', 'Mentor support'],
      ai_features: ['Personalized assessment', 'Progress tracking', 'Safety monitoring'],
      mobile_optimizations: ['Micro-lessons', 'Voice guidance', 'Haptic feedback'],
    },
    getPathwayInfo,
    checkHealth,
    resetProgress,
  };

  return (
    <SpiritualEducationContext.Provider value={contextValue}>
      {children}
    </SpiritualEducationContext.Provider>
  );
};

// ============================================================================
// MAIN SPIRITUAL EDUCATION HOOK
// ============================================================================

export function useSpiritualEducation(api?: SpiritualEducationAPI): UseSpiritualEducation {
  const apiInstance = api || new SpiritualEducationAPI();

  // Assessment state
  const [assessmentData, setAssessmentData] = useState<SpiritualAssessmentResult | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  // Curriculum state
  const [curriculumData, setCurriculumData] = useState<PersonalizedCurriculum | null>(null);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumError, setCurriculumError] = useState<string | null>(null);

  // Lesson state
  const [currentLesson, setCurrentLesson] = useState<SpiritualLesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Progress state
  const [progressData, setProgressData] = useState<ProgressAnalytics | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Mobile state
  const [dailyLesson, setDailyLesson] = useState<MobileLesson | null>(null);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);

  // Safety state
  const [safetyAssessment, setSafetyAssessment] = useState<SafetyAssessment | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);

  // Assessment methods
  const assess = useCallback(async (userData: UserAssessmentData) => {
    setAssessmentLoading(true);
    setAssessmentError(null);
    
    try {
      const result = await apiInstance.assessLevel(userData);
      setAssessmentData(result);
    } catch (error) {
      setAssessmentError(error instanceof Error ? error.message : 'Assessment failed');
    } finally {
      setAssessmentLoading(false);
    }
  }, [apiInstance]);

  // Curriculum methods
  const generateCurriculum = useCallback(async (
    assessment: SpiritualAssessmentResult,
    birthChart?: any
  ) => {
    setCurriculumLoading(true);
    setCurriculumError(null);
    
    try {
      const result = await apiInstance.generateCurriculum(assessment, birthChart);
      setCurriculumData(result);
    } catch (error) {
      setCurriculumError(error instanceof Error ? error.message : 'Curriculum generation failed');
    } finally {
      setCurriculumLoading(false);
    }
  }, [apiInstance]);

  // Lesson methods
  const getLesson = useCallback(async (
    pathway: SpiritualLevel,
    week: number,
    lesson: number
  ) => {
    setLessonLoading(true);
    setLessonError(null);
    
    try {
      const result = await apiInstance.getLesson(pathway, week, lesson);
      setCurrentLesson(result.lesson);
    } catch (error) {
      setLessonError(error instanceof Error ? error.message : 'Failed to get lesson');
    } finally {
      setLessonLoading(false);
    }
  }, [apiInstance]);

  const submitCompletion = useCallback(async (
    lessonId: string,
    response: LessonResponse
  ): Promise<LessonEvaluation> => {
    // This would need a user ID - in practice, get from auth context
    const userId = 'current-user'; // Placeholder
    
    try {
      const evaluation = await apiInstance.submitLessonCompletion(userId, lessonId, response);
      return evaluation;
    } catch (error) {
      throw error;
    }
  }, [apiInstance]);

  // Progress methods
  const refreshProgress = useCallback(async (userId: string) => {
    setProgressLoading(true);
    setProgressError(null);
    
    try {
      const result = await apiInstance.getProgress(userId);
      setProgressData(result);
    } catch (error) {
      setProgressError(error instanceof Error ? error.message : 'Failed to get progress');
    } finally {
      setProgressLoading(false);
    }
  }, [apiInstance]);

  // Mobile methods
  const generateDaily = useCallback(async (
    userLevel: SpiritualLevel,
    minutes: number
  ) => {
    setMobileLoading(true);
    setMobileError(null);
    
    try {
      const result = await apiInstance.getDailyMobileLesson(userLevel, minutes);
      setDailyLesson(result);
    } catch (error) {
      setMobileError(error instanceof Error ? error.message : 'Failed to generate daily lesson');
    } finally {
      setMobileLoading(false);
    }
  }, [apiInstance]);

  // Safety methods
  const checkSafety = useCallback(async (userId: string, recentData: any) => {
    setSafetyLoading(true);
    setSafetyError(null);
    
    try {
      const result = await apiInstance.performSafetyCheck(
        userId,
        recentData.responses || [],
        recentData.practiceLog || {}
      );
      setSafetyAssessment(result);
    } catch (error) {
      setSafetyError(error instanceof Error ? error.message : 'Safety check failed');
    } finally {
      setSafetyLoading(false);
    }
  }, [apiInstance]);

  return {
    assessLevel: {
      data: assessmentData,
      loading: assessmentLoading,
      error: assessmentError,
      assess,
    },
    curriculum: {
      data: curriculumData,
      loading: curriculumLoading,
      error: curriculumError,
      generate: generateCurriculum,
    },
    lessons: {
      currentLesson,
      loading: lessonLoading,
      error: lessonError,
      getLesson,
      submitCompletion,
    },
    progress: {
      data: progressData,
      loading: progressLoading,
      error: progressError,
      refresh: refreshProgress,
    },
    mobile: {
      dailyLesson,
      loading: mobileLoading,
      error: mobileError,
      generateDaily,
    },
    safety: {
      assessment: safetyAssessment,
      loading: safetyLoading,
      error: safetyError,
      checkSafety,
    },
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

export function useSpiritualAssessment() {
  const context = useContext(SpiritualEducationContext);
  if (!context) {
    throw new Error('useSpiritualAssessment must be used within SpiritualEducationProvider');
  }
  
  return {
    assessment: context.assessLevel.data,
    loading: context.assessLevel.loading,
    error: context.assessLevel.error,
    assess: context.assessLevel.assess,
    isComplete: context.assessLevel.data !== null,
    level: context.assessLevel.data?.current_level || 'beginner',
    safetyCleared: context.assessLevel.data?.safety_clearance || false,
  };
}

export function useSpiritualCurriculum() {
  const context = useContext(SpiritualEducationContext);
  if (!context) {
    throw new Error('useSpiritualCurriculum must be used within SpiritualEducationProvider');
  }
  
  return {
    curriculum: context.curriculum.data,
    loading: context.curriculum.loading,
    error: context.curriculum.error,
    generate: context.curriculum.generate,
    pathways: context.pathways,
    currentPathway: context.curriculum.data?.base_pathway?.level || 'beginner',
    personalization: context.curriculum.data?.personalization,
  };
}

export function useSpiritualProgress() {
  const context = useContext(SpiritualEducationContext);
  if (!context) {
    throw new Error('useSpiritualProgress must be used within SpiritualEducationProvider');
  }
  
  return {
    progress: context.progress.data,
    loading: context.progress.loading,
    error: context.progress.error,
    refresh: context.progress.refresh,
    
    // Computed properties
    completionPercentage: context.progress.data?.overall_progress.mastery_percentage || 0,
    currentWeek: context.progress.data?.overall_progress.weeks_completed || 0,
    nextMilestone: context.progress.data?.overall_progress.next_milestone,
    recommendations: context.progress.data?.personalized_recommendations || [],
  };
}

export function useSpiritualSafety() {
  const context = useContext(SpiritualEducationContext);
  if (!context) {
    throw new Error('useSpiritualSafety must be used within SpiritualEducationProvider');
  }
  
  return {
    assessment: context.safety.assessment,
    loading: context.safety.loading,
    error: context.safety.error,
    checkSafety: context.safety.checkSafety,
    
    // Computed safety properties
    safetyScore: context.safety.assessment?.safety_score || 0,
    clearanceLevel: context.safety.assessment?.clearance_level || 'basic',
    warnings: context.safety.assessment?.warning_signs || [],
    recommendations: context.safety.assessment?.recommendations || [],
    isCleared: (context.safety.assessment?.safety_score || 0) >= 0.8,
  };
}

export function useMobileSpiritualLearning() {
  const context = useContext(SpiritualEducationContext);
  if (!context) {
    throw new Error('useMobileSpiritualLearning must be used within SpiritualEducationProvider');
  }
  
  return {
    dailyLesson: context.mobile.dailyLesson,
    loading: context.mobile.loading,
    error: context.mobile.error,
    generateDaily: context.mobile.generateDaily,
    
    // Mobile-specific helpers
    generateQuickLesson: (minutes: number) => {
      const level = context.assessLevel.data?.current_level || 'beginner';
      return context.mobile.generateDaily(level, minutes);
    },
    
    hasDailyLesson: context.mobile.dailyLesson !== null,
    lessonDuration: context.mobile.dailyLesson?.duration || 0,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useSpiritualEducationContext() {
  const context = useContext(SpiritualEducationContext);
  if (!context) {
    throw new Error('useSpiritualEducationContext must be used within SpiritualEducationProvider');
  }
  return context;
}

export function useSpiritualHealthCheck() {
  const context = useContext(SpiritualEducationContext);
  if (!context) {
    throw new Error('useSpiritualHealthCheck must be used within SpiritualEducationProvider');
  }
  
  return {
    health: context.healthStatus,
    checkHealth: context.checkHealth,
    isHealthy: context.healthStatus?.education_engine === 'operational' &&
               context.healthStatus?.safety_protocols === 'active',
    traditionalCompliance: context.healthStatus?.traditional_authenticity === 'golden_dawn_compliant',
  };
}

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export {
  SpiritualEducationContext,
  SpiritualEducationProvider,
  useSpiritualEducation as default,
};
