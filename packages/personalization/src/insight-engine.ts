import { PersonalizedInsight, UserPreference, LearningPattern } from './types';
import { UserBehaviorTracker } from './behavior-tracker';
import { format, addDays } from 'date-fns';
import type { RichTransitData } from '@cosmichub/types';

// Enhanced astrological types for rich transit analysis
export type TransitData = RichTransitData;

export interface MetricsData {
  totalActions: number;
  uniqueFeatures: number;
  favoriteFeatures: string[];
}

export interface MilestoneData {
  threshold: number;
  title: string;
  message: string;
  type?: 'feature_mastery' | 'progress' | 'achievement';
}

export interface InsightAction {
  text: string;
  type: 'explore' | 'reflect' | 'action' | 'learn';
  link?: string;
}

/**
 * Generates personalized insights based on user behavior and preferences
 */
export class PersonalizedInsightEngine {
  private behaviorTracker: UserBehaviorTracker;

  constructor(behaviorTracker: UserBehaviorTracker) {
    this.behaviorTracker = behaviorTracker;
  }

  /**
   * Generate daily personalized insights for a user
   */
  async generateDailyInsights(
    userId: string,
    userPreferences: UserPreference,
    learningPattern: LearningPattern
  ): Promise<PersonalizedInsight[]> {
    const insights: PersonalizedInsight[] = [];
    const today = new Date();

    // Generate transit-based insights
    const transitInsight = await this.generateTransitInsight(
      userId,
      userPreferences,
      today
    );
    if (transitInsight) insights.push(transitInsight);

    // Generate learning-based insights
    const learningInsight = this.generateLearningInsight(
      userId,
      userPreferences,
      learningPattern
    );
    if (learningInsight) insights.push(learningInsight);

    // Generate feature recommendation insights
    const recommendationInsight = this.generateRecommendationInsight(
      userId,
      userPreferences,
      learningPattern
    );
    if (recommendationInsight) insights.push(recommendationInsight);

    // Generate milestone insights
    const milestoneInsight = this.generateMilestoneInsight(
      userId,
      userPreferences
    );
    if (milestoneInsight) insights.push(milestoneInsight);

    return insights.sort((a, b) =>
      b.priority === a.priority
        ? b.confidence - a.confidence
        : this.getPriorityWeight(b.priority) -
          this.getPriorityWeight(a.priority)
    );
  }

  /**
   * Generate transit-based personalized insight
   */
  private async generateTransitInsight(
    userId: string,
    preferences: UserPreference,
    date: Date
  ): Promise<PersonalizedInsight | null> {
    // Get user's current transits (would integrate with astrology service)
    const transits = await this.getCurrentTransits(userId, date);
    if (!transits || transits.length === 0) return null;

    const significantTransit = this.findMostSignificantTransit(
      transits,
      preferences
    );
    if (!significantTransit) return null;

    const content = this.generateTransitContent(
      significantTransit,
      preferences
    );
    const actionItems = this.generateTransitActionItems(
      significantTransit,
      preferences
    );

    return {
      id: `transit_${userId}_${format(date, 'yyyy-MM-dd')}`,
      userId,
      type: 'transit',
      title: `${significantTransit.planet} in ${significantTransit.sign} Transit`,
      content,
      priority: this.calculateTransitPriority(significantTransit),
      category: this.mapTransitToCategory(significantTransit),
      confidence: 0.85,
      personalizedFactors: [
        `Preferred interpretation style: ${preferences.preferences.interpretationStyle}`,
        `Interest in ${preferences.preferences.topics.join(', ')}`,
        `Complexity level: ${preferences.preferences.complexity}`,
      ],
      actionItems,
      validUntil: addDays(date, 3),
      createdAt: new Date(),
      engagedWith: false,
    };
  }

  /**
   * Generate learning-based insight
   */
  private generateLearningInsight(
    userId: string,
    preferences: UserPreference,
    learningPattern: LearningPattern
  ): PersonalizedInsight | null {
    const metrics = this.behaviorTracker.getUserEngagementMetrics(userId);

    if (metrics.totalActions < 10) {
      // New user onboarding insight
      return {
        id: `learning_onboarding_${userId}`,
        userId,
        type: 'recommendation',
        title: 'Welcome to Your Cosmic Journey',
        content: this.generateOnboardingContent(preferences, learningPattern),
        priority: 'high',
        category: 'personal_growth',
        confidence: 0.9,
        personalizedFactors: [
          `Learning style: ${learningPattern.patterns.informationProcessing}`,
          `Recommended complexity: ${learningPattern.adaptations.recommendedComplexity}`,
        ],
        actionItems: this.generateOnboardingActions(learningPattern),
        validUntil: addDays(new Date(), 7),
        createdAt: new Date(),
        engagedWith: false,
      };
    }

    // Generate progress-based insights for experienced users
    if (learningPattern.adaptations.suggestedFeatures.length > 0) {
      return {
        id: `learning_progress_${userId}`,
        userId,
        type: 'recommendation',
        title: 'Ready for Your Next Cosmic Discovery?',
        content: this.generateProgressContent(learningPattern, preferences),
        priority: 'medium',
        category: 'personal_growth',
        confidence: learningPattern.confidence,
        personalizedFactors: [
          `Feature adoption speed: ${learningPattern.patterns.featureAdoptionSpeed}`,
          `Suggested next features: ${learningPattern.adaptations.suggestedFeatures.join(', ')}`,
        ],
        actionItems: this.generateProgressActions(learningPattern),
        validUntil: addDays(new Date(), 5),
        createdAt: new Date(),
        engagedWith: false,
      };
    }

    return null;
  }

  /**
   * Generate feature recommendation insight
   */
  private generateRecommendationInsight(
    userId: string,
    preferences: UserPreference,
    _learningPattern: LearningPattern
  ): PersonalizedInsight | null {
    const metrics = this.behaviorTracker.getUserEngagementMetrics(userId);

    // Check if user has been active recently but might benefit from different features
    if (metrics.totalActions > 50 && metrics.uniqueFeatures < 5) {
      return {
        id: `recommendation_diversify_${userId}`,
        userId,
        type: 'recommendation',
        title: 'Expand Your Cosmic Toolkit',
        content: this.generateDiversificationContent(metrics, preferences),
        priority: 'medium',
        category: 'personal_growth',
        confidence: 0.75,
        personalizedFactors: [
          `Currently using ${metrics.uniqueFeatures} features regularly`,
          `Most used: ${metrics.favoriteFeatures.join(', ')}`,
          `Interests: ${preferences.preferences.topics.join(', ')}`,
        ],
        actionItems: this.generateDiversificationActions(preferences),
        validUntil: addDays(new Date(), 7),
        createdAt: new Date(),
        engagedWith: false,
      };
    }

    return null;
  }

  /**
   * Generate milestone-based insight
   */
  private generateMilestoneInsight(
    userId: string,
    preferences: UserPreference
  ): PersonalizedInsight | null {
    const metrics = this.behaviorTracker.getUserEngagementMetrics(userId);

    // Check for milestone achievements
    const milestones = [
      {
        threshold: 10,
        title: 'First Steps Complete',
        message: "You've begun your cosmic journey!",
      },
      {
        threshold: 50,
        title: 'Cosmic Explorer',
        message: "You're becoming a skilled cosmic navigator!",
      },
      {
        threshold: 100,
        title: 'Astral Adept',
        message: 'Your cosmic wisdom is growing strong!',
      },
      {
        threshold: 500,
        title: 'Stellar Sage',
        message: "You've achieved deep cosmic understanding!",
      },
    ];

    const achievedMilestone = milestones.find(
      m =>
        metrics.totalActions >= m.threshold &&
        metrics.totalActions < m.threshold + 10
    );

    if (achievedMilestone) {
      return {
        id: `milestone_${achievedMilestone.threshold}_${userId}`,
        userId,
        type: 'milestone',
        title: `🎉 ${achievedMilestone.title}`,
        content: this.generateMilestoneContent(
          achievedMilestone,
          metrics,
          preferences
        ),
        priority: 'high',
        category: 'personal_growth',
        confidence: 1.0,
        personalizedFactors: [
          `${metrics.totalActions} total interactions`,
          `${metrics.uniqueFeatures} features mastered`,
          `Favorite features: ${metrics.favoriteFeatures.join(', ')}`,
        ],
        actionItems: this.generateMilestoneActions(
          achievedMilestone,
          preferences
        ),
        validUntil: addDays(new Date(), 14),
        createdAt: new Date(),
        engagedWith: false,
      };
    }

    return null;
  }

  // Helper methods for content generation
  private async getCurrentTransits(_userId: string, _date: Date): Promise<TransitData[]> {
    // This would integrate with the astrology calculation service
    // Enhanced mock data with rich astrological metadata
    return [
      {
        planet: 'mars',
        sign: 'aries',
        house: 1,
        degree: 15.5,
        aspect: 'conjunction',
        isSignificant: true,
        natalPlanet: 'sun',
        strength: 0.9,
        type: 'major',
        orb: 2.5,
        exact: false,
        applying: true,
        element: 'fire',
        modality: 'cardinal',
        dignity: 'domicile',
      },
      {
        planet: 'venus',
        sign: 'taurus',
        house: 2,
        degree: 22.3,
        aspect: 'trine',
        isSignificant: true,
        natalPlanet: 'moon',
        strength: 0.7,
        type: 'major',
        orb: 3.1,
        exact: false,
        applying: false,
        element: 'earth',
        modality: 'fixed',
        dignity: 'domicile',
      },
    ];
  }

  private findMostSignificantTransit(
    transits: TransitData[],
    preferences: UserPreference
  ): TransitData | null {
    // Filter transits based on user's interests
    const relevantTransits = transits.filter(transit => {
      if (
        preferences.preferences.topics.includes('career') &&
        ['Saturn', 'Jupiter', 'Mars'].includes(transit.planet)
      )
        return true;
      if (
        preferences.preferences.topics.includes('relationships') &&
        ['Venus', 'Mars'].includes(transit.planet)
      )
        return true;
      if (
        preferences.preferences.topics.includes('spirituality') &&
        ['Neptune', 'Pluto', 'Jupiter'].includes(transit.planet)
      )
        return true;
      return (transit.strength ?? 0) > 0.7;
    });

    return relevantTransits.length > 0
      ? relevantTransits.sort((a, b) => (b.strength ?? 0) - (a.strength ?? 0))[0] ?? null
      : transits[0] ?? null;
  }

  private generateTransitContent(
    transit: TransitData,
    preferences: UserPreference
  ): string {
    const style = preferences.preferences.interpretationStyle;
    const complexity = preferences.preferences.complexity;

    let content = `${transit.planet} is currently transiting through ${transit.sign}, `;

    if (style === 'traditional') {
      content += `bringing the classical energies of `;
    } else if (style === 'psychological') {
      content += `activating psychological patterns related to `;
    } else if (style === 'spiritual') {
      content += `opening spiritual pathways connected to `;
    } else {
      content += `influencing areas of life associated with `;
    }

    if (complexity === 'beginner') {
      content += `${this.getSimpleTransitMeaning(transit)}. This is a good time to focus on ${this.getBasicGuidance(transit)}.`;
    } else if (complexity === 'advanced') {
      content += `${this.getDetailedTransitMeaning(transit)}. Consider the deeper implications of ${this.getAdvancedGuidance(transit)}.`;
    } else {
      content += `${this.getIntermediateTransitMeaning(transit)}. You might want to ${this.getIntermediateGuidance(transit)}.`;
    }

    return content;
  }

  private generateTransitActionItems(
    transit: TransitData,
    preferences: UserPreference
  ): InsightAction[] {
    const actions = [];

    if (preferences.preferences.topics.includes('career')) {
      actions.push({
        text: `Explore how this ${transit.planet} transit affects your career path`,
        type: 'explore' as const,
        link: '/transits/career',
      });
    }

    actions.push({
      text: `Reflect on how ${transit.planet} energy manifests in your life`,
      type: 'reflect' as const,
    });

    if (preferences.preferences.complexity !== 'beginner') {
      actions.push({
        text: `Study the deeper meanings of ${transit.planet} in ${transit.sign}`,
        type: 'learn' as const,
        link: '/learn/planets',
      });
    }

    return actions;
  }

  private generateOnboardingContent(
    _preferences: UserPreference,
    learningPattern: LearningPattern
  ): string {
    const style = learningPattern.patterns.informationProcessing;

    if (style === 'sequential') {
      return "Your learning style suggests you prefer a structured approach. Let's start with the fundamentals of your birth chart and work through each element systematically.";
    } else if (style === 'analytical') {
      return 'You seem to enjoy diving deep into details. Your birth chart contains layers of meaning waiting to be explored and analyzed.';
    } else {
      return 'You appear to learn through exploration and discovery. Your cosmic map is full of interconnected insights ready to be uncovered.';
    }
  }

  private generateOnboardingActions(
    learningPattern: LearningPattern
  ): InsightAction[] {
    const actions: InsightAction[] = [
      {
        text: 'Explore your birth chart basics',
        type: 'explore' as const,
        link: '/chart/birth',
      },
    ];

    if (learningPattern.patterns.informationProcessing === 'sequential') {
      actions.push({
        text: 'Take the guided tour of chart elements',
        type: 'learn' as const,
        link: '/tour/elements',
      });
    } else {
      actions.push({
        text: 'Discover your most prominent planetary influences',
        type: 'explore' as const,
        link: '/chart/planets',
      });
    }

    return actions;
  }

  private generateProgressContent(
    learningPattern: LearningPattern,
    _preferences: UserPreference
  ): string {
    const nextFeature = learningPattern.adaptations.suggestedFeatures[0];
    const complexity = learningPattern.adaptations.recommendedComplexity;

    return `Based on your ${complexity} level understanding and exploration patterns, you're ready to explore ${nextFeature}. This next step will deepen your cosmic insight and expand your astrological knowledge.`;
  }

  private generateProgressActions(
    learningPattern: LearningPattern
  ): InsightAction[] {
    return learningPattern.adaptations.suggestedFeatures
      .slice(0, 2)
      .map(feature => ({
        text: `Explore ${feature.replace('_', ' ')}`,
        type: 'explore' as const,
        link: `/features/${feature}`,
      }));
  }

  // Additional helper methods
  private calculateTransitPriority(
    transit: TransitData
  ): 'low' | 'medium' | 'high' | 'urgent' {
    const strength = transit.strength ?? 0.5;
    if (strength > 0.8) return 'high';
    if (strength > 0.6) return 'medium';
    return 'low';
  }

  private mapTransitToCategory(
    transit: TransitData
  ):
    | 'career'
    | 'relationships'
    | 'personal_growth'
    | 'spirituality'
    | 'health'
    | 'finance' {
    const careerPlanets = ['Saturn', 'Jupiter', 'Mars'];
    const relationshipPlanets = ['Venus', 'Mars'];
    const spiritualPlanets = ['Neptune', 'Pluto', 'Jupiter'];

    if (careerPlanets.includes(transit.planet)) return 'career';
    if (relationshipPlanets.includes(transit.planet)) return 'relationships';
    if (spiritualPlanets.includes(transit.planet)) return 'spirituality';
    return 'personal_growth';
  }

  private getPriorityWeight(priority: string): number {
    const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
    return weights[priority as keyof typeof weights] || 1;
  }

  private getSimpleTransitMeaning(transit: TransitData): string {
    const elementMeaning = {
      fire: 'passionate energy and initiative',
      earth: 'practical grounding and manifestation',
      air: 'mental clarity and communication',
      water: 'emotional depth and intuition',
    };

    const aspectMeaning = {
      conjunction: 'powerful new beginnings',
      trine: 'harmonious flow and ease',
      square: 'dynamic challenge and growth',
      sextile: 'opportunity and positive potential',
      opposition: 'balance and integration',
    };

    const element = transit.element || 'air';
    const aspectKey = transit.aspect as keyof typeof aspectMeaning;
    
    return `${elementMeaning[element]} through ${aspectMeaning[aspectKey] || 'transformative energy'}`;
  }

  private getDetailedTransitMeaning(transit: TransitData): string {
    const dignityContext = transit.dignity ? 
      (transit.dignity === 'domicile' || transit.dignity === 'exaltation' ? 
        'This planet is in its power, amplifying its positive qualities.' :
        'This planet faces challenges, requiring conscious integration.') : 
      'This planetary energy seeks balanced expression.';

    const modalityPattern = {
      cardinal: 'initiating new cycles and pioneering ventures',
      fixed: 'stabilizing current patterns and deepening commitment', 
      mutable: 'adapting to change and integrating diverse influences',
    };

    const modality = transit.modality || 'mutable';
    
    return `complex archetypal patterns involving ${modalityPattern[modality]}. ${dignityContext}`;
  }

  private getIntermediateTransitMeaning(transit: TransitData): string {
    const strengthContext = (transit.strength ?? 0.5) > 0.8 ? 'powerful' : 
                           (transit.strength ?? 0.5) > 0.5 ? 'moderate' : 'subtle';
    
    const timingContext = transit.applying ? 'building toward peak influence' : 
                         'releasing and integrating its lessons';
    
    return `${strengthContext} transformative energy that is ${timingContext}`;
  }

  private getBasicGuidance(transit: TransitData): string {
    const planetGuidance = {
      Mars: 'taking bold action and asserting yourself',
      Venus: 'nurturing relationships and embracing beauty',
      Mercury: 'communicating clearly and learning new things',
      Jupiter: 'expanding your horizons and seeking wisdom',
      Saturn: 'building structure and taking responsibility',
      Uranus: 'embracing innovation and authentic change',
      Neptune: 'connecting with your spirituality and creativity',
      Pluto: 'transforming deep patterns and reclaiming power',
    };

    const planet = transit.planet as keyof typeof planetGuidance;
    return planetGuidance[planet] || 'aligning with your authentic path';
  }

  private getAdvancedGuidance(transit: TransitData): string {
    const exactnessBonus = transit.exact ? 'This is a pivotal moment of exact alignment. ' : '';
    
    const orbContext = transit.orb && transit.orb < 1 ? 
      'The influence is highly focused and precise.' :
      'The influence offers a window of opportunity for integration.';
    
    return `${exactnessBonus}${orbContext} Consider how this archetypal energy can serve your evolutionary path.`;
  }

  private getIntermediateGuidance(transit: TransitData): string {
    const elementAction = {
      fire: 'channel this energy through creative action and leadership',
      earth: 'ground this energy through practical steps and tangible results', 
      air: 'work with this energy through learning and communication',
      water: 'honor this energy through emotional processing and intuitive insights',
    };

    const element = transit.element || 'air';
    return elementAction[element];
  }

  private generateDiversificationContent(
    metrics: MetricsData,
    preferences: UserPreference
  ): string {
    return `You've mastered your favorite features (${metrics.favoriteFeatures.join(', ')}), but there's so much more to discover! Based on your interests in ${preferences.preferences.topics.join(' and ')}, I recommend exploring some new areas of cosmic wisdom.`;
  }

  private generateDiversificationActions(
    preferences: UserPreference
  ): InsightAction[] {
    const actions = [];

    if (preferences.preferences.topics.includes('synastry')) {
      actions.push({
        text: 'Try relationship synastry analysis',
        type: 'explore' as const,
        link: '/synastry',
      });
    }

    if (preferences.preferences.topics.includes('transits')) {
      actions.push({
        text: 'Explore current transit influences',
        type: 'explore' as const,
        link: '/transits',
      });
    }

    return actions;
  }

  private generateMilestoneContent(
    milestone: MilestoneData,
    metrics: MetricsData,
    preferences: UserPreference
  ): string {
    return `${milestone.message} You've engaged with ${metrics.totalActions} cosmic insights and mastered ${metrics.uniqueFeatures} different features. Your dedication to ${preferences.preferences.topics.join(' and ')} shows your growing cosmic wisdom.`;
  }

  private generateMilestoneActions(
    milestone: MilestoneData,
    preferences: UserPreference
  ): InsightAction[] {
    const actions: Array<{
      text: string;
      type: 'explore' | 'reflect' | 'action' | 'learn';
      link?: string;
    }> = [
      {
        text: 'Share your cosmic milestone with friends',
        type: 'action' as const,
        link: '/share/milestone',
      },
    ];

    // Add personalized actions based on milestone type and preferences
    if (milestone.type === 'feature_mastery') {
      actions.push({
        text: 'Explore advanced features in your favorite areas',
        type: 'explore' as const,
        link: `/explore/${preferences.preferences.topics[0]}`,
      });
    }

    if (preferences.preferences.topics.includes('spirituality')) {
      actions.push({
        text: 'Reflect on your cosmic journey and spiritual growth',
        type: 'reflect' as const,
      });
    } else {
      actions.push({
        text: 'Reflect on your cosmic journey so far',
        type: 'reflect' as const,
      });
    }

    return actions;
  }
}
