import { UserBehaviorTracker } from './behavior-tracker';
import { PersonalizedInsightEngine } from './insight-engine';
import { AdaptiveUIManager } from './adaptive-ui';
import {
  UserPreference,
  PersonalizedInsight,
  AdaptiveUIState,
  LearningPattern,
  isUserAction,
  isUserPreference,
} from './types';

/**
 * Main personalization service that coordinates all AI-powered personalization features
 */
export class PersonalizationService {
  private behaviorTracker: UserBehaviorTracker;
  private insightEngine: PersonalizedInsightEngine;
  private adaptiveUI: AdaptiveUIManager;

  // Storage for user preferences (would be persisted to database)
  private userPreferences: Map<string, UserPreference> = new Map();
  private learningPatterns: Map<string, LearningPattern> = new Map();

  constructor() {
    this.behaviorTracker = new UserBehaviorTracker();
    this.insightEngine = new PersonalizedInsightEngine(this.behaviorTracker);
    this.adaptiveUI = new AdaptiveUIManager(this.behaviorTracker);
  }

  /**
   * Track user action and update personalization models
   */
  async trackUserAction(action: unknown): Promise<boolean> {
    if (!isUserAction(action)) {
      console.error('Invalid user action:', action);
      return false;
    }

    // Track the action
    const tracked = this.behaviorTracker.trackAction(action);
    if (!tracked) return false;

    // Update learning patterns
    await this.updateLearningPattern(action.userId);

    // Update adaptive UI state
    await this.updateAdaptiveState(action.userId);

    return true;
  }

  /**
   * Update or create user preferences
   */
  async setUserPreferences(
    userId: string,
    preferences: unknown
  ): Promise<boolean> {
    if (!isUserPreference(preferences)) {
      console.error('Invalid user preferences:', preferences);
      return false;
    }

    this.userPreferences.set(userId, preferences);

    // Update learning patterns and UI state when preferences change
    await this.updateLearningPattern(userId);
    await this.updateAdaptiveState(userId);

    return true;
  }

  /**
   * Get user preferences (with defaults if none exist)
   */
  getUserPreferences(userId: string): UserPreference {
    const existing = this.userPreferences.get(userId);
    if (existing) return existing;

    // Return default preferences
    const defaultPreferences: UserPreference = {
      userId,
      preferences: {
        interpretationStyle: 'modern',
        complexity: 'beginner',
        topics: ['birth_chart'],
        notificationFrequency: 'weekly',
        preferredTimeOfDay: 'morning',
        timezone: 'America/New_York',
        language: 'en',
      },
      learningProfile: {
        readingSpeed: 'normal',
        visualLearner: true,
        detailOriented: false,
        explorationPattern: 'intuitive',
      },
      engagementHistory: {
        totalSessions: 0,
        averageSessionDuration: 0,
        favoriteFeatures: [],
        completedGuidedTours: [],
        lastActiveDate: new Date(),
      },
    };

    this.userPreferences.set(userId, defaultPreferences);
    return defaultPreferences;
  }

  /**
   * Generate personalized daily insights for a user
   */
  async generateDailyInsights(userId: string): Promise<PersonalizedInsight[]> {
    const preferences = this.getUserPreferences(userId);
    const learningPattern = await this.getLearningPattern(userId);

    return this.insightEngine.generateDailyInsights(
      userId,
      preferences,
      learningPattern
    );
  }

  /**
   * Get adaptive UI configuration for a user
   */
  getAdaptiveUIConfig(userId: string): {
    showTooltips: boolean;
    complexityLevel: 'minimal' | 'standard' | 'detailed';
    navigationStyle: 'guided' | 'freeform' | 'expert';
    contentDepth: 'overview' | 'balanced' | 'comprehensive';
    quickActions: string[];
    preferredWidgets: string[];
    customLayout: Record<string, any>;
  } {
    return this.adaptiveUI.getUIConfiguration(userId);
  }

  /**
   * Get learning pattern for a user
   */
  async getLearningPattern(userId: string): Promise<LearningPattern> {
    const existing = this.learningPatterns.get(userId);
    if (existing && this.isPatternRecent(existing)) {
      return existing;
    }

    // Generate new learning pattern
    const pattern = this.behaviorTracker.analyzeLearningPattern(userId);
    this.learningPatterns.set(userId, pattern);
    return pattern;
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics(userId: string): {
    totalActions: number;
    uniqueFeatures: number;
    averageSessionDuration: number;
    peakHours: number[];
    favoriteFeatures: string[];
    learningProgress: {
      completedOnboarding: boolean;
      masteredFeatures: string[];
      strugglingAreas: string[];
      suggestedNextSteps: string[];
    };
  } {
    const metrics = this.behaviorTracker.getUserEngagementMetrics(userId);
    const adaptiveState = this.adaptiveUI.getAdaptiveState(userId);

    return {
      ...metrics,
      learningProgress: adaptiveState.learningProgress,
    };
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userId: string): Promise<{
    features: string[];
    content: string[];
    nextSteps: string[];
    adaptiveHints: boolean;
  }> {
    const learningPattern = await this.getLearningPattern(userId);
    const preferences = this.getUserPreferences(userId);
    const metrics = this.getUserEngagementMetrics(userId);

    return {
      features: learningPattern.adaptations.suggestedFeatures,
      content: this.generateContentRecommendations(preferences, metrics),
      nextSteps: metrics.learningProgress.suggestedNextSteps,
      adaptiveHints: learningPattern.adaptations.adaptiveHints,
    };
  }

  /**
   * Update notification preferences based on user behavior
   */
  async optimizeNotificationTiming(userId: string): Promise<{
    optimalTime: string;
    frequency: 'none' | 'daily' | 'weekly' | 'monthly';
    confidence: number;
  }> {
    const metrics = this.getUserEngagementMetrics(userId);
    const preferences = this.getUserPreferences(userId);

    // Analyze peak activity hours to suggest optimal notification time
    const peakHour =
      metrics.peakHours.length > 0
        ? Math.max(
            ...metrics.peakHours
              .map(h => ({ hour: h, count: 1 }))
              .reduce(
                (acc, curr) => {
                  const existing = acc.find(item => item.hour === curr.hour);
                  if (existing) existing.count++;
                  else acc.push(curr);
                  return acc;
                },
                [] as { hour: number; count: number }[]
              )
              .map(item => item.count)
          )
        : 9;

    // Convert hour to time string
    const optimalTime = this.formatOptimalTime(peakHour);

    // Suggest frequency based on engagement level
    let frequency = preferences.preferences.notificationFrequency;
    if (metrics.totalActions > 100 && frequency === 'weekly') {
      frequency = 'daily';
    } else if (metrics.totalActions < 20 && frequency === 'daily') {
      frequency = 'weekly';
    }

    return {
      optimalTime,
      frequency,
      confidence: Math.min(metrics.totalActions / 50, 1),
    };
  }

  /**
   * Export user's personalization data (for data portability)
   */
  exportPersonalizationData(userId: string): {
    preferences: UserPreference | null;
    learningPattern: LearningPattern | null;
    adaptiveState: AdaptiveUIState;
    metrics: {
      totalActions: number;
      uniqueFeatures: number;
      averageSessionDuration: number;
      peakHours: number[];
      favoriteFeatures: string[];
      learningProgress: {
        completedOnboarding: boolean;
        masteredFeatures: string[];
        strugglingAreas: string[];
        suggestedNextSteps: string[];
      };
    };
  } {
    return {
      preferences: this.userPreferences.get(userId) || null,
      learningPattern: this.learningPatterns.get(userId) || null,
      adaptiveState: this.adaptiveUI.getAdaptiveState(userId),
      metrics: this.getUserEngagementMetrics(userId),
    };
  }

  /**
   * Reset personalization data for a user (GDPR compliance)
   */
  resetPersonalizationData(userId: string): boolean {
    try {
      this.userPreferences.delete(userId);
      this.learningPatterns.delete(userId);
      // Note: In production, this would also clear the behavior tracker data
      return true;
    } catch (error) {
      console.error('Error resetting personalization data:', error);
      return false;
    }
  }

  // Private helper methods
  private async updateLearningPattern(userId: string): Promise<void> {
    const pattern = this.behaviorTracker.analyzeLearningPattern(userId);
    this.learningPatterns.set(userId, pattern);
  }

  private async updateAdaptiveState(userId: string): Promise<void> {
    const learningPattern = await this.getLearningPattern(userId);
    const preferences = this.getUserPreferences(userId);
    this.adaptiveUI.updateAdaptiveState(userId, learningPattern, preferences);
  }

  private isPatternRecent(pattern: LearningPattern): boolean {
    const hoursSinceAnalysis =
      (Date.now() - pattern.lastAnalyzed.getTime()) / (1000 * 60 * 60);
    return hoursSinceAnalysis < 24; // Refresh pattern every 24 hours
  }

  private generateContentRecommendations(
    preferences: UserPreference,
    metrics: ReturnType<typeof this.getUserEngagementMetrics>
  ): string[] {
    const recommendations: string[] = [];

    // Recommend based on interests and mastered features
    if (
      preferences.preferences.topics.includes('transits') &&
      !metrics.learningProgress.masteredFeatures.includes('transit_analysis')
    ) {
      recommendations.push('Understanding Planetary Transits');
    }

    if (
      preferences.preferences.topics.includes('synastry') &&
      metrics.learningProgress.masteredFeatures.includes('basic_chart_reading')
    ) {
      recommendations.push('Relationship Astrology Guide');
    }

    if (
      preferences.preferences.complexity === 'advanced' &&
      metrics.uniqueFeatures > 5
    ) {
      recommendations.push('Advanced Astrological Techniques');
    }

    return recommendations;
  }

  private formatOptimalTime(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  }
}

// Export singleton instance
export const personalizationService = new PersonalizationService();
