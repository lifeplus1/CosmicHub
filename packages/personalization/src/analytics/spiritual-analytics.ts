/**
 * Analytics integration for spiritual AI interactions
 * Bridges to existing @cosmichub/analytics package for tracking spiritual AI usage
 */

import type { LearningStage, SpiritualLevel } from '../types/spiritual-types';

// Define analytics event interfaces specific to spiritual AI
interface SpiritualAIInteractionEvent {
  feature:
    | 'spiritual_profile'
    | 'learning_path'
    | 'daily_lesson'
    | 'practice_assessment'
    | 'pattern_analysis'
    | 'curriculum_access';
  action: 'view' | 'update' | 'generate' | 'complete' | 'assess';
  spiritual_level: SpiritualLevel;
  learning_stage: LearningStage;
  user_id: string;
  session_duration_ms?: number;
  content_type?: string;
  completion_status?: 'started' | 'in_progress' | 'completed' | 'abandoned';
}

interface SpiritualProgressEvent {
  event_type:
    | 'stage_advancement'
    | 'level_progression'
    | 'practice_milestone'
    | 'assessment_completion';
  from_stage?: LearningStage;
  to_stage?: LearningStage;
  from_level?: SpiritualLevel;
  to_level?: SpiritualLevel;
  user_id: string;
  time_to_progress_days?: number;
  assessment_score?: number;
}

interface SpiritualSafetyEvent {
  event_type:
    | 'readiness_check'
    | 'warning_triggered'
    | 'safety_guidance_viewed'
    | 'practice_restricted';
  practice_type: string;
  readiness_status: 'ready' | 'not_ready' | 'caution_required';
  warnings_count: number;
  user_id: string;
  spiritual_level: SpiritualLevel;
}

// Mock analytics service - in production this would import from @cosmichub/analytics
class MockAnalyticsService {
  track(event: string, properties: Record<string, any>): void {
    console.log(`Analytics: ${event}`, properties);
  }
}

// Use mock for now - replace with real analytics service
const analytics = new MockAnalyticsService();

/**
 * Track spiritual AI feature interactions
 */
export function trackSpiritualAIInteraction(
  data: SpiritualAIInteractionEvent
): void {
  analytics.track('spiritual_ai_interaction', {
    feature: data.feature,
    action: data.action,
    spiritual_level: data.spiritual_level,
    learning_stage: data.learning_stage,
    user_id: data.user_id,
    session_duration_ms: data.session_duration_ms,
    content_type: data.content_type,
    completion_status: data.completion_status,
    timestamp: Date.now(),
  });
}

/**
 * Track spiritual progress events (level/stage advancement)
 */
export function trackSpiritualProgress(data: SpiritualProgressEvent): void {
  analytics.track('spiritual_progress', {
    event_type: data.event_type,
    from_stage: data.from_stage,
    to_stage: data.to_stage,
    from_level: data.from_level,
    to_level: data.to_level,
    user_id: data.user_id,
    time_to_progress_days: data.time_to_progress_days,
    assessment_score: data.assessment_score,
    timestamp: Date.now(),
  });
}

/**
 * Track spiritual safety and readiness assessments
 */
export function trackSpiritualSafety(data: SpiritualSafetyEvent): void {
  analytics.track('spiritual_safety', {
    event_type: data.event_type,
    practice_type: data.practice_type,
    readiness_status: data.readiness_status,
    warnings_count: data.warnings_count,
    user_id: data.user_id,
    spiritual_level: data.spiritual_level,
    timestamp: Date.now(),
  });
}

/**
 * Track daily lesson engagement
 */
export function trackDailyLessonEngagement(data: {
  user_id: string;
  lesson_id: string;
  stage: LearningStage;
  action: 'started' | 'completed' | 'skipped';
  time_spent_minutes?: number;
  activities_completed?: number;
  total_activities?: number;
}): void {
  analytics.track('daily_lesson_engagement', {
    user_id: data.user_id,
    lesson_id: data.lesson_id,
    stage: data.stage,
    action: data.action,
    time_spent_minutes: data.time_spent_minutes,
    activities_completed: data.activities_completed,
    total_activities: data.total_activities,
    completion_rate:
      data.activities_completed && data.total_activities
        ? data.activities_completed / data.total_activities
        : null,
    timestamp: Date.now(),
  });
}

/**
 * Track learning path generation and usage
 */
export function trackLearningPathUsage(data: {
  user_id: string;
  path_generated: boolean;
  modules_count: number;
  estimated_duration_days: number;
  user_level: SpiritualLevel;
  action: 'generated' | 'viewed' | 'started' | 'module_completed';
  module_name?: string;
}): void {
  analytics.track('learning_path_usage', {
    user_id: data.user_id,
    path_generated: data.path_generated,
    modules_count: data.modules_count,
    estimated_duration_days: data.estimated_duration_days,
    user_level: data.user_level,
    action: data.action,
    module_name: data.module_name,
    timestamp: Date.now(),
  });
}

/**
 * Track curriculum personalization effectiveness
 */
export function trackCurriculumPersonalization(data: {
  user_id: string;
  personalization_factors: string[];
  curriculum_adaptations: number;
  user_satisfaction?: 1 | 2 | 3 | 4 | 5;
  time_to_completion_days?: number;
  stage: LearningStage;
}): void {
  analytics.track('curriculum_personalization', {
    user_id: data.user_id,
    personalization_factors: data.personalization_factors.join(','),
    curriculum_adaptations: data.curriculum_adaptations,
    user_satisfaction: data.user_satisfaction,
    time_to_completion_days: data.time_to_completion_days,
    stage: data.stage,
    timestamp: Date.now(),
  });
}

/**
 * Track adaptive UI effectiveness
 */
export function trackAdaptiveUIUsage(data: {
  user_id: string;
  ui_complexity: 'minimal' | 'standard' | 'detailed';
  guidance_level: 'full' | 'minimal' | 'none';
  features_used: string[];
  time_spent_minutes: number;
  user_satisfaction?: 1 | 2 | 3 | 4 | 5;
  spiritual_level: SpiritualLevel;
}): void {
  analytics.track('adaptive_ui_usage', {
    user_id: data.user_id,
    ui_complexity: data.ui_complexity,
    guidance_level: data.guidance_level,
    features_used: data.features_used.join(','),
    features_count: data.features_used.length,
    time_spent_minutes: data.time_spent_minutes,
    user_satisfaction: data.user_satisfaction,
    spiritual_level: data.spiritual_level,
    timestamp: Date.now(),
  });
}

/**
 * Track pattern analysis insights and user engagement
 */
export function trackPatternAnalysis(data: {
  user_id: string;
  patterns_identified: number;
  pattern_types: string[];
  confidence_score: number;
  user_feedback?: 'helpful' | 'somewhat_helpful' | 'not_helpful';
  action_taken?: 'saved' | 'shared' | 'dismissed';
  spiritual_level: SpiritualLevel;
}): void {
  analytics.track('pattern_analysis', {
    user_id: data.user_id,
    patterns_identified: data.patterns_identified,
    pattern_types: data.pattern_types.join(','),
    confidence_score: data.confidence_score,
    user_feedback: data.user_feedback,
    action_taken: data.action_taken,
    spiritual_level: data.spiritual_level,
    timestamp: Date.now(),
  });
}

/**
 * Track mobile-specific spiritual AI usage
 */
export function trackMobileSpiritualAI(data: {
  user_id: string;
  feature: string;
  device_type: 'phone' | 'tablet';
  session_duration_ms: number;
  offline_usage: boolean;
  notification_triggered?: boolean;
  notification_type?: 'daily_lesson' | 'practice_reminder' | 'progress_update';
}): void {
  analytics.track('mobile_spiritual_ai', {
    user_id: data.user_id,
    feature: data.feature,
    device_type: data.device_type,
    session_duration_ms: data.session_duration_ms,
    offline_usage: data.offline_usage,
    notification_triggered: data.notification_triggered,
    notification_type: data.notification_type,
    timestamp: Date.now(),
  });
}
