import type {
  SpiritualUserProfile,
  LearningPath,
  PersonalizedCurriculum,
  PersonalizedLesson,
  AdaptiveUIConfig,
  PatternAnalysis,
  PracticeReadiness,
  SpiritualAIResponse,
  LearningStage,
  SpiritualLevel,
} from './types/spiritual-types';

/**
 * PersonalizationBridge - Connects frontend to existing spiritual AI systems (Phase 6C)
 *
 * This service bridges the React/TypeScript frontend to the existing Python spiritual AI systems:
 * - spiritual_ai_enhanced.py (508 lines)
 * - spiritual_educational_system.py (715 lines)
 * - spiritual_safety_protocols.py (624 lines)
 * - ai_service.py (825 lines)
 */
export class PersonalizationBridge {
  private baseUrl: string;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(baseUrl = '/api/spiritual-ai') {
    this.baseUrl = baseUrl;
  }

  // ===========================================
  // SPIRITUAL USER PROFILE MANAGEMENT
  // ===========================================

  /**
   * Get or create spiritual user profile
   * Bridges to: spiritual_schema.py create_spiritual_user_profile()
   */
  async getSpiritualProfile(userId: string): Promise<SpiritualUserProfile> {
    const cacheKey = `profile_${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/profile/${userId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch spiritual profile: ${response.statusText}`
        );
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching spiritual profile:', error);
      throw error;
    }
  }

  /**
   * Update spiritual user profile
   * Bridges to: spiritual_safety_protocols.py _assess_spiritual_level()
   */
  async updateSpiritualProfile(
    userId: string,
    profile: Partial<SpiritualUserProfile>
  ): Promise<SpiritualUserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update spiritual profile: ${response.statusText}`
        );
      }

      const updatedProfile = await response.json();
      this.clearCache(`profile_${userId}`);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating spiritual profile:', error);
      throw error;
    }
  }

  // ===========================================
  // LEARNING PATH GENERATION
  // ===========================================

  /**
   * Generate personalized learning path
   * Bridges to: spiritual_ai_enhanced.py progressive_learning_path()
   */
  async generateLearningPath(
    userId: string,
    currentKnowledge?: Record<string, any>
  ): Promise<LearningPath> {
    const cacheKey = `learning_path_${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/learning-path/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentKnowledge: currentKnowledge || {} }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate learning path: ${response.statusText}`
        );
      }

      const learningPath = await response.json();
      this.setCache(cacheKey, learningPath);
      return learningPath;
    } catch (error) {
      console.error('Error generating learning path:', error);
      throw error;
    }
  }

  // ===========================================
  // PERSONALIZED CURRICULUM
  // ===========================================

  /**
   * Create personalized curriculum
   * Bridges to: spiritual_educational_system.py create_personalized_curriculum()
   */
  async getPersonalizedCurriculum(
    userId: string
  ): Promise<PersonalizedCurriculum> {
    const cacheKey = `curriculum_${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/curriculum/${userId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch personalized curriculum: ${response.statusText}`
        );
      }

      const curriculum = await response.json();
      this.setCache(cacheKey, curriculum);
      return curriculum;
    } catch (error) {
      console.error('Error fetching personalized curriculum:', error);
      throw error;
    }
  }

  /**
   * Generate daily lesson
   * Bridges to: spiritual_educational_system.py generate_daily_lesson()
   */
  async getDailyLesson(
    userId: string,
    stage: LearningStage,
    dayNumber: number
  ): Promise<PersonalizedLesson> {
    try {
      const response = await fetch(`${this.baseUrl}/daily-lesson/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, dayNumber }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate daily lesson: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating daily lesson:', error);
      throw error;
    }
  }

  // ===========================================
  // ADAPTIVE UI CONFIGURATION
  // ===========================================

  /**
   * Get adaptive UI configuration based on spiritual level
   * Bridges to: spiritual_safety_protocols.py _assess_spiritual_level()
   */
  async getAdaptiveUIConfig(userId: string): Promise<AdaptiveUIConfig> {
    const cacheKey = `ui_config_${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/adaptive-ui/${userId}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch adaptive UI config: ${response.statusText}`
        );
      }

      const config = await response.json();
      this.setCache(cacheKey, config);
      return config;
    } catch (error) {
      console.error('Error fetching adaptive UI config:', error);
      throw error;
    }
  }

  // ===========================================
  // PRACTICE SAFETY & READINESS
  // ===========================================

  /**
   * Assess readiness for spiritual practice
   * Bridges to: spiritual_safety_protocols.py assess_readiness_for_practice()
   */
  async assessPracticeReadiness(
    userId: string,
    practiceType: string
  ): Promise<PracticeReadiness> {
    try {
      const response = await fetch(
        `${this.baseUrl}/practice-readiness/${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ practiceType }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to assess practice readiness: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing practice readiness:', error);
      throw error;
    }
  }

  /**
   * Generate safe daily practice
   * Bridges to: spiritual_safety_protocols.py generate_daily_spiritual_practice()
   */
  async generateDailyPractice(
    userId: string,
    availableTime: number
  ): Promise<SpiritualAIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/daily-practice/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availableTime }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate daily practice: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating daily practice:', error);
      throw error;
    }
  }

  // ===========================================
  // PATTERN ANALYSIS & INSIGHTS
  // ===========================================

  /**
   * Analyze spiritual development patterns
   * Bridges to: spiritual_ai_enhanced.py analyze_development_patterns()
   */
  async analyzePatterns(
    userId: string,
    timeframe?: { from: Date; to: Date }
  ): Promise<PatternAnalysis> {
    try {
      const response = await fetch(
        `${this.baseUrl}/pattern-analysis/${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeframe }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to analyze patterns: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing patterns:', error);
      throw error;
    }
  }

  /**
   * Cross-system synthesis
   * Bridges to: spiritual_ai_enhanced.py cross_system_theme_synthesis()
   */
  async synthesizeThemes(
    userId: string,
    systems: string[]
  ): Promise<SpiritualAIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/synthesis/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systems }),
      });

      if (!response.ok) {
        throw new Error(`Failed to synthesize themes: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error synthesizing themes:', error);
      throw error;
    }
  }

  // ===========================================
  // ASSESSMENT & PROGRESSION
  // ===========================================

  /**
   * Assess spiritual understanding
   * Bridges to: spiritual_educational_system.py assess_spiritual_understanding()
   */
  async assessUnderstanding(
    userId: string,
    responses: Record<string, any>,
    practiceLogs: Array<Record<string, any>>
  ): Promise<SpiritualAIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/assessment/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, practiceLogs }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to assess understanding: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error assessing understanding:', error);
      throw error;
    }
  }

  // ===========================================
  // CACHE MANAGEMENT
  // ===========================================

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.cacheTimeout,
    });
  }

  private clearCache(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached data for a user
   */
  clearUserCache(userId: string): void {
    const userKeys = Array.from(this.cache.keys()).filter(key =>
      key.includes(userId)
    );
    userKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Health check for spiritual AI services
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const spiritualAIBridge = new PersonalizationBridge();
