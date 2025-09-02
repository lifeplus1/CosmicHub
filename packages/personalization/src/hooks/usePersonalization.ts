import { useState, useEffect, useCallback } from 'react';
import { personalizationService } from '../personalization-service';
import { UserPreference, PersonalizedInsight } from '../types';

/**
 * Main hook for accessing personalization features
 */
export function usePersonalization(userId: string) {
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [insights, setInsights] = useState<PersonalizedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userPrefs = personalizationService.getUserPreferences(userId);
        const dailyInsights =
          await personalizationService.generateDailyInsights(userId);

        setPreferences(userPrefs);
        setInsights(dailyInsights);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load personalization data'
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);

  // Track user action
  const trackAction = useCallback(async (action: unknown) => {
    try {
      await personalizationService.trackUserAction(action);
    } catch (err) {
      console.error('Failed to track action:', err);
    }
  }, []);

  // Update user preferences
  const updatePreferences = useCallback(
    async (newPreferences: unknown) => {
      try {
        const success = await personalizationService.setUserPreferences(
          userId,
          newPreferences
        );
        if (success) {
          const updatedPrefs =
            personalizationService.getUserPreferences(userId);
          setPreferences(updatedPrefs);

          // Regenerate insights with new preferences
          const newInsights =
            await personalizationService.generateDailyInsights(userId);
          setInsights(newInsights);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update preferences'
        );
      }
    },
    [userId]
  );

  // Get recommendations
  const getRecommendations = useCallback(async () => {
    try {
      return await personalizationService.getPersonalizedRecommendations(
        userId
      );
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      return null;
    }
  }, [userId]);

  // Get engagement metrics
  const getMetrics = useCallback(() => {
    return personalizationService.getUserEngagementMetrics(userId);
  }, [userId]);

  return {
    preferences,
    insights,
    loading,
    error,
    trackAction,
    updatePreferences,
    getRecommendations,
    getMetrics,
  };
}
