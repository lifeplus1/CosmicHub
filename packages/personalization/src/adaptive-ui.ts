import { AdaptiveUIState, LearningPattern, UserPreference } from './types';
import { UserBehaviorTracker } from './behavior-tracker';
import { EngagementMetrics } from './metrics';

/**
 * Manages adaptive UI state based on user behavior and preferences
 */
export class AdaptiveUIManager {
  private behaviorTracker: UserBehaviorTracker;
  private uiStates: Map<string, AdaptiveUIState> = new Map();

  constructor(behaviorTracker: UserBehaviorTracker) {
    this.behaviorTracker = behaviorTracker;
  }

  /**
   * Get or create adaptive UI state for a user
   */
  getAdaptiveState(userId: string): AdaptiveUIState {
    const existing = this.uiStates.get(userId);
    if (existing) {
      return existing;
    }

    // Create initial adaptive state
    const initialState: AdaptiveUIState = {
      userId,
      adaptations: {
        layoutComplexity: 'standard',
        navigationStyle: 'guided',
        contentDepth: 'balanced',
        visualDensity: 'normal',
        interactionStyle: 'tooltips',
      },
      customizations: {
        hiddenElements: [],
        preferredWidgets: ['daily_insight', 'birth_chart_summary'],
        dashboardLayout: this.getDefaultDashboardLayout(),
        quickActions: ['generate_chart', 'view_transits'],
      },
      learningProgress: {
        completedOnboarding: false,
        masteredFeatures: [],
        strugglingAreas: [],
        suggestedNextSteps: ['complete_birth_chart', 'explore_planets'],
      },
      lastUpdated: new Date(),
    };

    this.uiStates.set(userId, initialState);
    return initialState;
  }

  /**
   * Update adaptive state based on user behavior patterns
   */
  updateAdaptiveState(
    userId: string,
    learningPattern: LearningPattern,
    preferences: UserPreference
  ): AdaptiveUIState {
    const currentState = this.getAdaptiveState(userId);
    const metrics = this.behaviorTracker.getUserEngagementMetrics(userId);

    // Adapt layout complexity based on experience
    const layoutComplexity = this.determineLayoutComplexity(
      metrics,
      learningPattern
    );

    // Adapt navigation style based on learning patterns
    const navigationStyle = this.determineNavigationStyle(
      learningPattern,
      metrics
    );

    // Adapt content depth based on preferences and experience
    const contentDepth = this.determineContentDepth(preferences, metrics);

    // Adapt visual density based on behavior patterns
    const visualDensity = this.determineVisualDensity(learningPattern, metrics);

    // Adapt interaction style based on user behavior
    const interactionStyle = this.determineInteractionStyle(
      learningPattern,
      metrics
    );

    // Update customizations based on usage patterns
    const updatedCustomizations = this.updateCustomizations(
      currentState,
      metrics,
      preferences
    );

    // Update learning progress
    const updatedLearningProgress = this.updateLearningProgress(
      currentState,
      metrics,
      learningPattern
    );

    const updatedState: AdaptiveUIState = {
      ...currentState,
      adaptations: {
        layoutComplexity,
        navigationStyle,
        contentDepth,
        visualDensity,
        interactionStyle,
      },
      customizations: updatedCustomizations,
      learningProgress: updatedLearningProgress,
      lastUpdated: new Date(),
    };

    this.uiStates.set(userId, updatedState);
    return updatedState;
  }

  /**
   * Determine optimal layout complexity based on user experience
   */
  private determineLayoutComplexity(
    metrics: EngagementMetrics,
    learningPattern: LearningPattern
  ): 'minimal' | 'standard' | 'detailed' {
    // New users start with minimal
    if (metrics.totalActions < 20) return 'minimal';

    // Advanced users can handle detailed
    if (
      learningPattern.adaptations.recommendedComplexity === 'advanced' &&
      metrics.uniqueFeatures > 8
    )
      return 'detailed';

    // Intermediate users get standard
    if (metrics.totalActions > 50 || metrics.uniqueFeatures > 5)
      return 'standard';

    return 'minimal';
  }

  /**
   * Determine navigation style based on learning patterns
   */
  private determineNavigationStyle(
    learningPattern: LearningPattern,
    metrics: EngagementMetrics
  ): 'guided' | 'freeform' | 'expert' {
    // Sequential learners prefer guided navigation
    if (learningPattern.patterns.informationProcessing === 'sequential') {
      return metrics.totalActions > 100 ? 'expert' : 'guided';
    }

    // Experienced holistic learners prefer freeform
    if (
      learningPattern.patterns.informationProcessing === 'holistic' &&
      metrics.uniqueFeatures > 6
    ) {
      return 'freeform';
    }

    // Analytical users often prefer expert mode once experienced
    if (
      learningPattern.patterns.informationProcessing === 'analytical' &&
      metrics.totalActions > 150
    ) {
      return 'expert';
    }

    // Default progression: guided -> freeform -> expert
    if (metrics.totalActions < 30) return 'guided';
    if (metrics.totalActions < 100) return 'freeform';
    return 'expert';
  }

  /**
   * Determine content depth based on preferences and experience
   */
  private determineContentDepth(
    preferences: UserPreference,
    metrics: EngagementMetrics
  ): 'overview' | 'balanced' | 'comprehensive' {
    // Respect user's complexity preference
    if (preferences.preferences.complexity === 'beginner') return 'overview';
    if (preferences.preferences.complexity === 'advanced')
      return 'comprehensive';

    // For intermediate, base on experience
    if (metrics.totalActions < 40) return 'overview';
    if (metrics.totalActions > 120) return 'comprehensive';
    return 'balanced';
  }

  /**
   * Determine visual density based on behavior patterns
   */
  private determineVisualDensity(
    learningPattern: LearningPattern,
    metrics: EngagementMetrics
  ): 'spacious' | 'normal' | 'compact' {
    // Fast feature adoption suggests comfort with density
    if (
      learningPattern.patterns.featureAdoptionSpeed === 'fast' &&
      metrics.uniqueFeatures > 7
    ) {
      return 'compact';
    }

    // Slow adoption prefers spacious layout
    if (learningPattern.patterns.featureAdoptionSpeed === 'slow') {
      return 'spacious';
    }

    // Visual learners might prefer spacious layouts
    // Note: This would be determined from user profile data
    return 'normal';
  }

  /**
   * Determine interaction style based on user behavior
   */
  private determineInteractionStyle(
    learningPattern: LearningPattern,
    metrics: EngagementMetrics
  ): 'tooltips' | 'inline' | 'discovery' {
    // New users need tooltips
    if (metrics.totalActions < 25) return 'tooltips';

    // Experienced users might prefer discovery mode
    if (
      metrics.totalActions > 200 &&
      learningPattern.patterns.featureAdoptionSpeed === 'fast'
    ) {
      return 'discovery';
    }

    // Analytical users often prefer inline information
    if (learningPattern.patterns.informationProcessing === 'analytical') {
      return 'inline';
    }

    return 'tooltips';
  }

  /**
   * Update customizations based on usage patterns
   */
  private updateCustomizations(
    currentState: AdaptiveUIState,
    metrics: EngagementMetrics,
    preferences: UserPreference
  ): AdaptiveUIState['customizations'] {
    const { customizations } = currentState;

    // Update preferred widgets based on usage
    const updatedWidgets = this.updatePreferredWidgets(metrics, preferences);

    // Update quick actions based on most used features
    const updatedQuickActions = this.updateQuickActions(metrics);

    // Keep existing dashboard layout unless major changes needed
    const updatedDashboardLayout = this.updateDashboardLayout(
      customizations.dashboardLayout,
      metrics,
      preferences
    );

    return {
      ...customizations,
      preferredWidgets: updatedWidgets,
      quickActions: updatedQuickActions,
      dashboardLayout: updatedDashboardLayout,
    };
  }

  /**
   * Update learning progress tracking
   */
  private updateLearningProgress(
    currentState: AdaptiveUIState,
    metrics: EngagementMetrics,
    learningPattern: LearningPattern
  ): AdaptiveUIState['learningProgress'] {
    const { learningProgress } = currentState;

    // Mark onboarding complete if user has explored enough
    const completedOnboarding =
      learningProgress.completedOnboarding ||
      (metrics.totalActions > 15 && metrics.uniqueFeatures > 3);

    // Update mastered features based on usage frequency
    const masteredFeatures = this.identifyMasteredFeatures(metrics);

    // Identify struggling areas (features with low engagement)
    const strugglingAreas = this.identifyStrugglingAreas(
      metrics,
      learningPattern
    );

    // Update next steps suggestions
    const suggestedNextSteps = this.generateNextSteps(
      metrics,
      learningPattern,
      masteredFeatures
    );

    return {
      completedOnboarding,
      masteredFeatures,
      strugglingAreas,
      suggestedNextSteps,
    };
  }

  // Helper methods for customization updates
  private updatePreferredWidgets(
    metrics: EngagementMetrics,
    preferences: UserPreference
  ): string[] {
    const widgets = ['daily_insight'];

    // Add widgets based on user interests
    if (preferences.preferences.topics.includes('transits')) {
      widgets.push('current_transits');
    }
    if (preferences.preferences.topics.includes('birth_chart')) {
      widgets.push('birth_chart_summary');
    }
    if (preferences.preferences.topics.includes('synastry')) {
      widgets.push('relationship_insights');
    }

    // Add widgets based on usage patterns
    if (metrics.favoriteFeatures.includes('chart_generation')) {
      widgets.push('quick_chart_generator');
    }

    return [...new Set(widgets)]; // Remove duplicates
  }

  private updateQuickActions(metrics: EngagementMetrics): string[] {
    const baseActions = ['generate_chart'];

    // Add most-used features as quick actions
    metrics.favoriteFeatures.slice(0, 2).forEach((feature: string) => {
      const actionMap: Record<string, string> = {
        transit_analysis: 'view_transits',
        synastry_calculation: 'create_synastry',
        interpretation_reading: 'get_interpretation',
      };

      const action = actionMap[feature];
      if (action && !baseActions.includes(action)) {
        baseActions.push(action);
      }
    });

    return baseActions;
  }

  private updateDashboardLayout(
    currentLayout: Record<string, unknown>,
    metrics: EngagementMetrics,
    preferences: UserPreference
  ): Record<string, unknown> {
    // Start with current layout or default
    const layout = { ...currentLayout };

    // Adjust widget order based on preferences
    if (
      preferences.preferences.topics.includes('transits') &&
      !layout.primaryWidget
    ) {
      layout.primaryWidget = 'current_transits';
    }

    // Adjust layout density based on experience
    if (metrics.totalActions > 100) {
      layout.density = 'compact';
    }

    return layout;
  }

  private identifyMasteredFeatures(metrics: EngagementMetrics): string[] {
    const mastered: string[] = [];

    // Features used frequently are considered mastered
    metrics.favoriteFeatures.forEach((feature: string) => {
      if (!mastered.includes(feature)) {
        mastered.push(feature);
      }
    });

    // Additional logic for mastery based on usage patterns
    if (metrics.totalActions > 50) {
      mastered.push('basic_chart_reading');
    }
    if (metrics.uniqueFeatures > 8) {
      mastered.push('feature_navigation');
    }

    return mastered;
  }

  private identifyStrugglingAreas(
    metrics: EngagementMetrics,
    learningPattern: LearningPattern
  ): string[] {
    const struggling: string[] = [];

    // If user has low feature adoption despite time, they might be struggling
    if (metrics.totalActions > 30 && metrics.uniqueFeatures < 4) {
      struggling.push('feature_discovery');
    }

    // If learning pattern suggests analytical but low interpretation usage
    if (
      learningPattern.patterns.informationProcessing === 'analytical' &&
      !metrics.favoriteFeatures.some((f: string) =>
        f.includes('interpretation')
      )
    ) {
      struggling.push('interpretation_understanding');
    }

    return struggling;
  }

  private generateNextSteps(
    metrics: EngagementMetrics,
    learningPattern: LearningPattern,
    masteredFeatures: string[]
  ): string[] {
    const nextSteps: string[] = [];

    // Suggest based on mastered features
    if (
      masteredFeatures.includes('basic_chart_reading') &&
      !masteredFeatures.includes('transit_analysis')
    ) {
      nextSteps.push('explore_current_transits');
    }

    // Suggest based on learning pattern
    if (
      learningPattern.patterns.informationProcessing === 'sequential' &&
      metrics.uniqueFeatures < 5
    ) {
      nextSteps.push('complete_guided_tour');
    }

    // Suggest based on feature adoption speed
    if (
      learningPattern.patterns.featureAdoptionSpeed === 'fast' &&
      !nextSteps.length
    ) {
      nextSteps.push('try_advanced_features');
    }

    return nextSteps.length ? nextSteps : ['explore_personalized_insights'];
  }

  private getDefaultDashboardLayout(): Record<string, any> {
    return {
      primaryWidget: 'birth_chart_summary',
      secondaryWidgets: ['daily_insight', 'current_transits'],
      layout: 'grid',
      density: 'normal',
    };
  }

  /**
   * Get adaptive UI configuration for React components
   */
  getUIConfiguration(userId: string): {
    showTooltips: boolean;
    complexityLevel: 'minimal' | 'standard' | 'detailed';
    navigationStyle: 'guided' | 'freeform' | 'expert';
    contentDepth: 'overview' | 'balanced' | 'comprehensive';
    quickActions: string[];
    preferredWidgets: string[];
    customLayout: Record<string, any>;
  } {
    const state = this.getAdaptiveState(userId);

    return {
      showTooltips: state.adaptations.interactionStyle === 'tooltips',
      complexityLevel: state.adaptations.layoutComplexity,
      navigationStyle: state.adaptations.navigationStyle,
      contentDepth: state.adaptations.contentDepth,
      quickActions: state.customizations.quickActions,
      preferredWidgets: state.customizations.preferredWidgets,
      customLayout: state.customizations.dashboardLayout,
    };
  }
}
