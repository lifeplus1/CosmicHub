import { UserAction, LearningPattern, isUserAction } from './types';
import { EngagementMetrics } from './metrics';

/**
 * Core behavior tracking service that analyzes user actions and learns patterns
 */
export class UserBehaviorTracker {
  private actions: UserAction[] = [];
  private patterns: Map<string, unknown> = new Map();

  /**
   * Track a user action with type safety validation
   */
  trackAction(action: unknown): boolean {
    if (!isUserAction(action)) {
      console.error('Invalid user action format:', action);
      return false;
    }

    this.actions.push(action);
    this.updatePatterns(action);
    return true;
  }

  /**
   * Analyze user behavior patterns
   */
  private updatePatterns(action: UserAction): void {
    const userId = action.userId;

    // Track feature usage frequency
  const featureKey = `${userId}:feature:${action.context.feature}`;
  const currentCount = (this.patterns.get(featureKey) as number | undefined) ?? 0;
  this.patterns.set(featureKey, currentCount + 1);

    // Track time-based patterns
  const hour = new Date(action.timestamp).getHours();
  const timeKey = `${userId}:active_hours`;
  const hours = (this.patterns.get(timeKey) as Set<number> | undefined) ?? new Set<number>();
  hours.add(hour);
  this.patterns.set(timeKey, hours);

    // Track session patterns
    if (action.type === 'session_started' || action.type === 'session_ended') {
      this.updateSessionPatterns(action);
    }
  }

  /**
   * Update session-based learning patterns
   */
  private updateSessionPatterns(action: UserAction): void {
    const userId = action.userId;
    const sessionKey = `${userId}:sessions`;
  const sessions = (this.patterns.get(sessionKey) as Array<{ id?: string; startTime: Date; endTime?: Date; duration?: number; actions: unknown[] }> | undefined) ?? [];

    if (action.type === 'session_started') {
      sessions.push({
        id: action.sessionId,
        startTime: action.timestamp,
        actions: [],
      });
    } else if (action.type === 'session_ended') {
  const session = sessions.find((s) => s.id === action.sessionId);
      if (session) {
        session.endTime = action.timestamp;
        session.duration = action.duration;
      }
    }

    this.patterns.set(sessionKey, sessions);
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics(userId: string): EngagementMetrics {
    const userActions = this.actions.filter(a => a.userId === userId);
    const uniqueFeatures = new Set(userActions.map(a => a.context.feature))
      .size;

  const sessions = (this.patterns.get(`${userId}:sessions`) as Array<{ endTime?: Date; duration?: number }> | undefined) ?? [];
  const completedSessions = sessions.filter((s) => s.endTime);
    const avgDuration =
      completedSessions.length > 0
        ? completedSessions.reduce(
            (sum: number, s) => sum + (s.duration ?? 0),
            0
          ) / completedSessions.length
        : 0;

    const activeHours = Array.from(
  ((this.patterns.get(`${userId}:active_hours`) as Set<number> | undefined) ?? new Set<number>()).values()
    );

    // Get top 3 most used features
    const featureUsage = new Map<string, number>();
    userActions.forEach(action => {
      const feature = action.context.feature;
  featureUsage.set(feature, (featureUsage.get(feature) ?? 0) + 1);
    });

    const favoriteFeatures = Array.from(featureUsage.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([feature]) => feature);

    return {
      totalActions: userActions.length,
      uniqueFeatures,
      averageSessionDuration: avgDuration,
      peakHours: activeHours,
      favoriteFeatures,
    };
  }

  /**
   * Generate learning pattern analysis
   */
  analyzeLearningPattern(userId: string): LearningPattern {
    const metrics = this.getUserEngagementMetrics(userId);
    const userActions = this.actions.filter(a => a.userId === userId);

    // Analyze feature adoption speed
    const featureFirstUse = new Map<string, Date>();
    userActions.forEach(action => {
      const feature = action.context.feature;
      if (!featureFirstUse.has(feature)) {
        featureFirstUse.set(feature, new Date(action.timestamp));
      }
    });

    const adoptionSpeed = this.calculateAdoptionSpeed(featureFirstUse);
    const processingStyle = this.inferProcessingStyle(userActions);

    return {
      userId,
      patterns: {
        peakActivityHours: metrics.peakHours,
        sessionFrequency: this.calculateWeeklyFrequency(userId),
        featureAdoptionSpeed: adoptionSpeed,
        errorRecoveryStyle: 'methodical', // TODO: Implement error tracking
        informationProcessing: processingStyle,
      },
      adaptations: {
        recommendedComplexity: this.recommendComplexity(metrics),
        suggestedFeatures: this.suggestNextFeatures(userId),
        personalizedTutorials: [],
        adaptiveHints: metrics.uniqueFeatures < 5,
      },
      confidence: Math.min(metrics.totalActions / 100, 1), // Higher confidence with more data
      lastAnalyzed: new Date(),
    };
  }

  private calculateAdoptionSpeed(
    featureFirstUse: Map<string, Date>
  ): 'slow' | 'normal' | 'fast' {
    if (featureFirstUse.size < 2) return 'normal';

    const dates = Array.from(featureFirstUse.values()).sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const timeBetweenFeatures = [];

    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i - 1];
      const currentDate = dates[i];
      if (prevDate && currentDate) {
        timeBetweenFeatures.push(currentDate.getTime() - prevDate.getTime());
      }
    }

    const avgTime =
      timeBetweenFeatures.reduce((sum, time) => sum + time, 0) /
      timeBetweenFeatures.length;
    const avgDays = avgTime / (1000 * 60 * 60 * 24);

    if (avgDays < 1) return 'fast';
    if (avgDays > 7) return 'slow';
    return 'normal';
  }

  private inferProcessingStyle(
    userActions: UserAction[]
  ): 'sequential' | 'holistic' | 'analytical' {
    // Analyze navigation patterns to infer processing style
    const navigationActions = userActions.filter(
      a => a.type === 'feature_used'
    );

    // Sequential: tends to go through features in order
    // Holistic: jumps around different areas
    // Analytical: spends long time on interpretation features

    const interpretationActions = navigationActions.filter(
      a =>
        a.context.feature.includes('interpretation') ||
        a.context.feature.includes('analysis')
    );

    const interpretationRatio =
      interpretationActions.length / navigationActions.length;

    if (interpretationRatio > 0.4) return 'analytical';

    // TODO: Implement more sophisticated pattern analysis
    return 'holistic';
  }

  private recommendComplexity(
    metrics: EngagementMetrics
  ): 'beginner' | 'intermediate' | 'advanced' {
    if (metrics.uniqueFeatures < 3 || metrics.totalActions < 20)
      return 'beginner';
    if (metrics.uniqueFeatures < 8 || metrics.totalActions < 100)
      return 'intermediate';
    return 'advanced';
  }

  private suggestNextFeatures(userId: string): string[] {
    const userActions = this.actions.filter(a => a.userId === userId);
    const usedFeatures = new Set(userActions.map(a => a.context.feature));

    // Define feature progression paths
    const progressionPaths = {
      birth_chart: ['transits', 'progressions'],
      transits: ['synastry', 'solar_return'],
      synastry: ['composite_chart', 'relationship_analysis'],
      basic_interpretation: ['advanced_interpretation', 'synthesis'],
    };

    const suggestions: string[] = [];

    usedFeatures.forEach(feature => {
      const nextFeatures =
        progressionPaths[feature as keyof typeof progressionPaths];
      if (nextFeatures) {
        nextFeatures.forEach(next => {
          if (!usedFeatures.has(next) && !suggestions.includes(next)) {
            suggestions.push(next);
          }
        });
      }
    });

    return suggestions.slice(0, 3);
  }

  private calculateWeeklyFrequency(userId: string): number {
    const userActions = this.actions.filter(a => a.userId === userId);
    if (userActions.length === 0) return 0;
  const sessions = (this.patterns.get(`${userId}:sessions`) as Array<{ startTime: Date }> | undefined) ?? [];
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(
      (s) => new Date(s.startTime) > oneWeekAgo
    );

    return recentSessions.length;
  }
}
