// Migrated from packages/shared/src/hooks/useSpiritualEducation.tsx
// TEMPORARY DUPLICATION: Original remains for backward compatibility. Prefer importing from '@cosmichub/hooks'.
import React, { useState, useEffect, useCallback, createContext } from 'react';
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
  SpiritualEducationContextValue,
  BirthChartData,
  PracticeLogMap,
  RecentPracticeData,
} from '@cosmichub/types';

const SPIRITUAL_EDUCATION_API_BASE = '/api/spiritual-education';

class SpiritualEducationAPI {
  constructor(private readonly baseUrl: string = SPIRITUAL_EDUCATION_API_BASE) {}
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<SpiritualEducationResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) }, ...options });
    if (!response.ok) throw new Error(`Spiritual education API error: ${response.status}`);
    return (await response.json()) as SpiritualEducationResponse<T>;
  }
  async assessLevel(userData: UserAssessmentData): Promise<SpiritualAssessmentResult> { return (await this.request<SpiritualAssessmentResult>('/assess-level', { method: 'POST', body: JSON.stringify(userData) })).data!; }
  async generateCurriculum(assessment: SpiritualAssessmentResult, birthChartData?: BirthChartData): Promise<PersonalizedCurriculum> { return (await this.request<PersonalizedCurriculum>('/generate-curriculum', { method: 'POST', body: JSON.stringify({ assessment, birth_chart_data: birthChartData }) })).data!; }
  async getLesson(pathway: SpiritualLevel, week: number, lesson: number) { return (await this.request<{ lesson: SpiritualLesson; week_theme: string; learning_objectives: string[] }>(`/get-lesson/${pathway}/${week}/${lesson}`)).data!; }
  async submitLessonCompletion(userId: string, lessonId: string, userResponse: LessonResponse) { return (await this.request<LessonEvaluation>('/submit-lesson', { method: 'POST', body: JSON.stringify({ user_id: userId, lesson_id: lessonId, user_response: userResponse }) })).data!; }
  async getProgress(userId: string) { return (await this.request<ProgressAnalytics>(`/progress/${userId}`)).data!; }
  async getDailyMobileLesson(userLevel: SpiritualLevel, availableMinutes: number) { return (await this.request<MobileLesson>('/mobile/daily-lesson', { method: 'POST', body: JSON.stringify({ user_level: userLevel, available_minutes: availableMinutes }) })).data!; }
  async performSafetyCheck(userId: string, recentResponses: LessonResponse[], practiceLog: PracticeLogMap) { return (await this.request<SafetyAssessment>('/safety-check', { method: 'POST', body: JSON.stringify({ user_id: userId, recent_responses: recentResponses, practice_log: practiceLog }) })).data!; }
  async getPathways() { return (await this.request<PathwaysResponse>('/pathways')).data!; }
  async getWeekOverview(pathway: SpiritualLevel, week: number) { return (await this.request<WeekOverview>(`/week-overview/${pathway}/${week}`)).data!; }
  async getHealthStatus() { return (await this.request<HealthStatus>('/health')).data!; }
}

const SpiritualEducationContext = createContext<SpiritualEducationContextValue | null>(null);

export const SpiritualEducationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = new SpiritualEducationAPI();
  const [pathways, setPathways] = useState<PathwaysResponse['pathways'] | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const spiritualEducation = useSpiritualEducation(api);
  const getPathwayInfo = useCallback(async () => { try { const pathwayData = await api.getPathways(); setPathways(pathwayData.pathways); } catch (error) { console.error('Failed to fetch pathway info:', error); } }, [api]);
  const checkHealth = useCallback(async () => { try { setHealthStatus(await api.getHealthStatus()); } catch (error) { console.error('Failed to check health:', error); } }, [api]);
  const resetProgress = useCallback(() => { /* stub */ }, [spiritualEducation]);
  useEffect(() => { void getPathwayInfo(); void checkHealth(); }, [getPathwayInfo, checkHealth]);
  const contextValue: SpiritualEducationContextValue = { ...spiritualEducation, pathways, healthStatus, metadata: { total_weeks: 52, pathways: { beginner: { weeks: [1,4], focus: 'foundational_learning' }, intermediate: { weeks: [5,12], focus: 'depth_building' }, advanced: { weeks: [13,26], focus: 'synthesis_mastery' }, master: { weeks: [27,52], focus: 'teaching_preparation' } }, traditional_sources: ['Golden Dawn','Hermetic Kabbalah','Rider-Waite-Smith Tarot'], safety_requirements: ['Ethical grounding','Meditation experience','Mentor support'], ai_features: ['Personalized assessment','Progress tracking','Safety monitoring'], mobile_optimizations: ['Micro-lessons','Voice guidance','Haptic feedback'] }, getPathwayInfo, checkHealth, resetProgress };
  return <SpiritualEducationContext.Provider value={contextValue}>{children}</SpiritualEducationContext.Provider>;
};

export function useSpiritualEducation(api?: SpiritualEducationAPI): UseSpiritualEducation {
  const apiInstance = api ?? new SpiritualEducationAPI();
  const [assessmentData, setAssessmentData] = useState<SpiritualAssessmentResult | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [curriculumData, setCurriculumData] = useState<PersonalizedCurriculum | null>(null);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumError, setCurriculumError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<SpiritualLesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressAnalytics | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [dailyLesson, setDailyLesson] = useState<MobileLesson | null>(null);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [safetyAssessment, setSafetyAssessment] = useState<SafetyAssessment | null>(null);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const assess = useCallback(async (userData: UserAssessmentData) => { setAssessmentLoading(true); setAssessmentError(null); try { setAssessmentData(await apiInstance.assessLevel(userData)); } catch (e) { setAssessmentError(e instanceof Error ? e.message : 'Assessment failed'); } finally { setAssessmentLoading(false); } }, [apiInstance]);
  const generateCurriculum = useCallback(async (assessment: SpiritualAssessmentResult, birthChart?: BirthChartData) => { setCurriculumLoading(true); setCurriculumError(null); try { setCurriculumData(await apiInstance.generateCurriculum(assessment, birthChart)); } catch (e) { setCurriculumError(e instanceof Error ? e.message : 'Curriculum generation failed'); } finally { setCurriculumLoading(false); } }, [apiInstance]);
  const getLesson = useCallback(async (pathway: SpiritualLevel, week: number, lesson: number) => { setLessonLoading(true); setLessonError(null); try { const result = await apiInstance.getLesson(pathway, week, lesson); setCurrentLesson(result.lesson); } catch (e) { setLessonError(e instanceof Error ? e.message : 'Failed to get lesson'); } finally { setLessonLoading(false); } }, [apiInstance]);
  const submitCompletion = useCallback(async (lessonId: string, response: LessonResponse): Promise<LessonEvaluation> => apiInstance.submitLessonCompletion('current-user', lessonId, response), [apiInstance]);
  const refreshProgress = useCallback(async (userId: string) => { setProgressLoading(true); setProgressError(null); try { setProgressData(await apiInstance.getProgress(userId)); } catch (e) { setProgressError(e instanceof Error ? e.message : 'Failed to get progress'); } finally { setProgressLoading(false); } }, [apiInstance]);
  const generateDaily = useCallback(async (userLevel: SpiritualLevel, minutes: number) => { setMobileLoading(true); setMobileError(null); try { setDailyLesson(await apiInstance.getDailyMobileLesson(userLevel, minutes)); } catch (e) { setMobileError(e instanceof Error ? e.message : 'Failed to generate daily lesson'); } finally { setMobileLoading(false); } }, [apiInstance]);
  const checkSafety = useCallback(async (userId: string, recentData: RecentPracticeData) => { setSafetyLoading(true); setSafetyError(null); try { setSafetyAssessment(await apiInstance.performSafetyCheck(userId, recentData.lastPractices.map(p => ({ practice_log: {}, written_response: p.type })) as LessonResponse[], {} as PracticeLogMap)); } catch (e) { setSafetyError(e instanceof Error ? e.message : 'Safety check failed'); } finally { setSafetyLoading(false); } }, [apiInstance]);
  return { assessLevel: { data: assessmentData, loading: assessmentLoading, error: assessmentError, assess }, curriculum: { data: curriculumData, loading: curriculumLoading, error: curriculumError, generate: generateCurriculum }, lessons: { currentLesson, loading: lessonLoading, error: lessonError, getLesson, submitCompletion }, progress: { data: progressData, loading: progressLoading, error: progressError, refresh: refreshProgress }, mobile: { dailyLesson, loading: mobileLoading, error: mobileError, generateDaily }, safety: { assessment: safetyAssessment, loading: safetyLoading, error: safetyError, checkSafety } };
}

export { SpiritualEducationContext };
