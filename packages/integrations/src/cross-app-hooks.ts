/**
 * Enhanced Cross-App React Hooks for CosmicHub Integration
 * Complete HealWave-Astrology integration with TCM and real-time sync
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { crossAppStore, type AppState, type HealingSession, type FrequencyRecommendation, type CrossAppNotification, type TCMInsight, type MeridianWindow } from './cross-app-store';

// Enhanced logger for hooks
const logger = {
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CrossAppHooks] ${message}`, data);
    }
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[CrossAppHooks] ${message}`, data);
  },
  error: (message: string, data?: unknown) => {
    console.error(`[CrossAppHooks] ${message}`, data);
  },
};

/**
 * Main cross-app state hook
 * Provides complete app state with real-time synchronization
 */
export function useCrossAppState() {
  const [state, setState] = useState<AppState>(crossAppStore.getState());

  useEffect(() => {
    const unsubscribe = crossAppStore.subscribe('state:updated', (newState: AppState) => {
      setState(newState);
      logger.info('Cross-app state updated', { activeApp: newState.activeApp });
    });

    return unsubscribe;
  }, []);

  const updateUser = useCallback((user: AppState['user']) => {
    crossAppStore.updateUser(user);
  }, []);

  const updateChart = useCallback((chart: AppState['currentChart']) => {
    crossAppStore.updateChart(chart);
  }, []);

  const switchApp = useCallback((app: 'astro' | 'healwave') => {
    crossAppStore.setActiveApp(app);
  }, []);

  const clearState = useCallback(() => {
    crossAppStore.clear();
  }, []);

  return {
    state,
    updateUser,
    updateChart,
    switchApp,
    clearState,
  };
}

/**
 * HealWave integration hook
 * Manages healing sessions and frequency recommendations
 */
export function useHealWaveIntegration() {
  const [healwaveState, setHealwaveState] = useState(crossAppStore.getState().healwave);

  useEffect(() => {
    const unsubscribe = crossAppStore.subscribe('healwave:updated', (newState: AppState['healwave']) => {
      setHealwaveState(newState);
      logger.info('HealWave state updated', { isPlaying: newState.isPlaying });
    });

    return unsubscribe;
  }, []);

  const startSession = useCallback((session: HealingSession) => {
    crossAppStore.startHealingSession(session);
  }, []);

  const endSession = useCallback((sessionId: string, effectiveness?: number, notes?: string) => {
    crossAppStore.endHealingSession(sessionId, effectiveness, notes);
  }, []);

  const updateRecommendations = useCallback((recommendations: FrequencyRecommendation[]) => {
    crossAppStore.updateFrequencyRecommendations(recommendations);
  }, []);

  return {
    healwaveState,
    startSession,
    endSession,
    updateRecommendations,
    isPlaying: healwaveState.isPlaying,
    currentSession: healwaveState.currentSession,
    recommendations: healwaveState.recommendations,
    sessionHistory: healwaveState.sessionHistory,
  };
}

/**
 * TCM integration hook
 * Manages Traditional Chinese Medicine insights and meridian timing
 */
export function useTCMIntegration() {
  const [tcmState, setTcmState] = useState(crossAppStore.getState().tcm);

  useEffect(() => {
    const unsubscribe = crossAppStore.subscribe('tcm:updated', (newState: AppState['tcm']) => {
      setTcmState(newState);
      logger.info('TCM state updated', { hasInsights: !!newState.insights });
    });

    return unsubscribe;
  }, []);

  const updateInsights = useCallback((insights: TCMInsight) => {
    crossAppStore.updateTCMInsights(insights);
  }, []);

  const updateMeridianTiming = useCallback((timing: MeridianWindow[]) => {
    crossAppStore.updateMeridianTiming(timing);
  }, []);

  // Get current optimal meridian for healing
  const currentOptimalMeridian = useMemo(() => {
    return tcmState.meridianTiming
      .filter(meridian => meridian.currentStrength > 0.7)
      .sort((a, b) => b.currentStrength - a.currentStrength)[0] ?? null;
  }, [tcmState.meridianTiming]);

  return {
    tcmState,
    updateInsights,
    updateMeridianTiming,
    currentOptimalMeridian,
    insights: tcmState.insights,
    meridianTiming: tcmState.meridianTiming,
  };
}

/**
 * Astrology integration hook
 * Manages astrological transits and frequency correlations
 */
export function useAstrologyIntegration() {
  const [astrologyState, setAstrologyState] = useState(crossAppStore.getState().astrology);

  useEffect(() => {
    const unsubscribe = crossAppStore.subscribe('astrology:updated', (newState: AppState['astrology']) => {
      setAstrologyState(newState);
      logger.info('Astrology state updated', { transitsCount: newState.currentTransits.length });
    });

    return unsubscribe;
  }, []);

  const updateTransits = useCallback((transits: AppState['astrology']['currentTransits']) => {
    crossAppStore.updateCurrentTransits(transits);
  }, []);

  const updateRecommendations = useCallback((recommendations: FrequencyRecommendation[]) => {
    crossAppStore.updateAstrologyRecommendations(recommendations);
  }, []);

  return {
    astrologyState,
    updateTransits,
    updateRecommendations,
    currentTransits: astrologyState.currentTransits,
    recommendations: astrologyState.recommendations,
    lastCalculation: astrologyState.lastCalculation,
  };
}

/**
 * Cross-app notifications hook
 * Manages notifications between apps with actionable items
 */
export function useCrossAppNotifications() {
  const [notifications, setNotifications] = useState<CrossAppNotification[]>(
    crossAppStore.getState().notifications
  );

  useEffect(() => {
    const unsubscribe = crossAppStore.subscribe('notifications:updated', (newNotifications: CrossAppNotification[]) => {
      setNotifications(newNotifications);
      logger.info('Notifications updated', { count: newNotifications.length });
    });

    return unsubscribe;
  }, []);

  const addNotification = useCallback((notification: Omit<CrossAppNotification, 'id' | 'timestamp' | 'read'>) => {
    crossAppStore.addNotification({
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    });
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    crossAppStore.markNotificationAsRead(notificationId);
  }, []);

  const clearNotifications = useCallback(() => {
    crossAppStore.clearNotifications();
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const latestRecommendation = useMemo(() => {
    return notifications
      .filter(n => n.type === 'recommendation' && !n.read)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] ?? null;
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    latestRecommendation,
    addNotification,
    markAsRead,
    clearNotifications,
  };
}

/**
 * Intelligent frequency recommendations hook
 * Combines astrology, TCM, and session history for personalized suggestions
 */
export function useFrequencyRecommendations() {
  const { tcmState } = useTCMIntegration();
  const { astrologyState } = useAstrologyIntegration();

  // Generate intelligent recommendations based on multiple factors
  const recommendations = useMemo(() => {
    const combined: FrequencyRecommendation[] = [];

    // Add astrology-based recommendations
    astrologyState.recommendations.forEach(rec => {
      combined.push({
        ...rec,
        reason: `Astrological guidance: ${rec.reason}`,
        confidence: rec.confidence * 0.8, // Weight astrology
      });
    });

    // Add TCM-based recommendations
    if (tcmState.insights) {
      // Add TCM-derived frequency suggestions based on elemental balance
      const elements = Object.entries(tcmState.insights.elementBalance);
      elements.forEach(([element, balance]) => {
        if (balance < 0.3) { // Deficient element
          const frequencies = getElementFrequencies(element as keyof typeof tcmState.insights.elementBalance);
          frequencies.forEach(freq => {
            combined.push({
              id: `tcm-${element}-${freq}`,
              frequency: freq,
              category: 'tcm-healing',
              name: `${element} Element Balancing`,
              description: `Restore ${element} element balance`,
              reason: `TCM analysis shows ${element} deficiency (${Math.round(balance * 100)}%)`,
              confidence: 0.9,
              optimalTiming: getTCMOptimalTiming(element),
              duration: 15,
            });
          });
        }
      });
    }

    // Sort by confidence and relevance
    return combined
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Top 5 recommendations
  }, [tcmState.insights, astrologyState.recommendations]);

  return {
    recommendations,
    hasRecommendations: recommendations.length > 0,
    topRecommendation: recommendations[0] ?? null,
  };
}

/**
 * Real-time sync status hook
 * Monitors cross-app synchronization and conflict resolution
 */
export function useSyncStatus() {
  const [syncState, setSyncState] = useState(crossAppStore.getState().sync);

  useEffect(() => {
    const unsubscribe = crossAppStore.subscribe('sync:updated', (newSyncState: AppState['sync']) => {
      setSyncState(newSyncState);
    });

    return unsubscribe;
  }, []);

  const forceSync = useCallback(() => {
    crossAppStore.syncData();
  }, []);

  const isOnline = syncState.isOnline;
  const hasConflicts = syncState.pendingChanges.length > 0;
  const lastSyncAgo = useMemo(() => {
    const diff = Date.now() - syncState.lastSync.getTime();
    return Math.round(diff / 1000 / 60); // Minutes ago
  }, [syncState.lastSync]);

  return {
    syncState,
    isOnline,
    hasConflicts,
    lastSyncAgo,
    forceSync,
  };
}

// Helper functions for TCM frequency mapping
function getElementFrequencies(element: string): number[] {
  const elementFrequencies: Record<string, number[]> = {
    wood: [141.27, 282.54], // Liver/Gallbladder frequencies
    fire: [341.3, 682.6], // Heart frequencies
    earth: [126.22, 252.44], // Spleen/Stomach frequencies
    metal: [221.23, 442.46], // Lung/Large Intestine frequencies
    water: [194.18, 388.36], // Kidney/Bladder frequencies
  };

  return elementFrequencies[element] ?? [528]; // Default to 528 Hz
}

function getTCMOptimalTiming(element: string): Date[] {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // TCM organ clock timing
  const elementTimes: Record<string, number[]> = {
    wood: [1, 3], // 1-3 AM Liver, 5-7 AM Gallbladder
    fire: [11, 13], // 11 AM-1 PM Heart
    earth: [9, 11], // 9-11 AM Spleen
    metal: [3, 5], // 3-5 AM Lung
    water: [17, 19], // 5-7 PM Kidney
  };

  const times = elementTimes[element] ?? [12];
  return times.map(hour => {
    const optimalTime = new Date(tomorrow);
    optimalTime.setHours(hour, 0, 0, 0);
    return optimalTime;
  });
}

// Legacy hook for backward compatibility
export const useCrossAppStore = () => {
  const { notifications, addNotification, clearNotifications } = useCrossAppNotifications();
  
  return {
    notifications: notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      timestamp: n.timestamp.getTime(),
    })),
    addNotification: (notification: { title?: string; message: string; type: 'info' | 'success' | 'warning' | 'error'; timestamp?: number }) => {
      addNotification({
        title: notification.title ?? '',
        message: notification.message,
        type: notification.type,
        source: 'astro',
        actionable: false,
        persistent: false,
      });
    },
    clearNotifications,
  };
};
