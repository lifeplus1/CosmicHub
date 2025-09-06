/**
 * AI Interaction Events Tracking
 * Specialized analytics for AI feature usage
 */

import { getAnalytics } from '../AnalyticsService';
import type { AIInteractionEvent } from '../types/index';

export const trackAIInteraction = (data: AIInteractionEvent): void => {
  const analytics = getAnalytics();
  if (!analytics) {
    console.debug('Analytics not initialized - AI interaction not tracked');
    return;
  }

  analytics.track({
    event: 'ai_interaction',
    properties: {
      feature: data.feature,
      input_type: data.input_type,
      response_time_ms: data.response_time_ms,
      user_satisfaction: data.user_satisfaction ?? null,
      tokens_used: data.tokens_used ?? null,
      model_version: data.model_version ?? null,
    },
  });
};

export const trackAIQuestion = (data: {
  question_type: 'general' | 'chart_specific' | 'predictive' | 'compatibility';
  question_length: number;
  response_time_ms: number;
  user_id?: string;
  chart_context?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'ai_question_asked',
    user_id: data.user_id,
    properties: {
      question_type: data.question_type,
      question_length: data.question_length,
      response_time_ms: data.response_time_ms,
      chart_context: data.chart_context ?? null,
    },
  });
};

export const trackAIPredictiveTransit = (data: {
  transit_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  planets_involved: string[];
  accuracy_feedback?: 1 | 2 | 3 | 4 | 5;
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'ai_predictive_transit',
    user_id: data.user_id,
    properties: {
      transit_type: data.transit_type,
      planets_involved: data.planets_involved.join(','),
      accuracy_feedback: data.accuracy_feedback ?? null,
    },
  });
};

export const trackAIGrowthCoaching = (data: {
  coaching_type:
    | 'career'
    | 'relationships'
    | 'personal_development'
    | 'spiritual';
  session_duration_ms: number;
  recommendations_count: number;
  user_satisfaction?: 1 | 2 | 3 | 4 | 5;
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'ai_growth_coaching',
    user_id: data.user_id,
    properties: {
      coaching_type: data.coaching_type,
      session_duration_ms: data.session_duration_ms,
      recommendations_count: data.recommendations_count,
      user_satisfaction: data.user_satisfaction ?? null,
    },
  });
};

export const trackAIPatternRecognition = (data: {
  pattern_type:
    | 'personality'
    | 'life_cycles'
    | 'relationship_patterns'
    | 'karmic_lessons';
  patterns_found: number;
  confidence_score: number;
  user_feedback?: 'helpful' | 'somewhat_helpful' | 'not_helpful';
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'ai_pattern_recognition',
    user_id: data.user_id,
    properties: {
      pattern_type: data.pattern_type,
      patterns_found: data.patterns_found,
      confidence_score: data.confidence_score,
      user_feedback: data.user_feedback ?? null,
    },
  });
};

export const trackAIMultiSystemSynthesis = (data: {
  systems_compared: string[];
  synthesis_complexity: 'simple' | 'moderate' | 'complex';
  user_understanding?: 1 | 2 | 3 | 4 | 5;
  user_id?: string;
}): void => {
  const analytics = getAnalytics();
  if (!analytics) return;

  analytics.track({
    event: 'ai_multi_system_synthesis',
    user_id: data.user_id,
    properties: {
      systems_compared: data.systems_compared.join(','),
      synthesis_complexity: data.synthesis_complexity,
      user_understanding: data.user_understanding ?? null,
    },
  });
};
