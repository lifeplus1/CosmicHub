/**
 * Enhanced Cross-App State Management for CosmicHub Integration
 * Complete HealWave-Astrology integration with TCM and real-time sync
 */

import type { 
  BirthData,
  ElementalBalance,
  TransitResult,
  AstrologyChart
} from '@cosmichub/types';

// Enhanced logger for cross-app integrations
const logger = {
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CrossAppStore] ${message}`, data);
    }
  },
  warn: (message: string, data?: unknown) => {
    console.warn(`[CrossAppStore] ${message}`, data);
  },
  error: (message: string, data?: unknown) => {
    console.error(`[CrossAppStore] ${message}`, data);
  },
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[CrossAppStore] ${message}`, data);
    }
  },
};

// Integration-specific types
export interface HealingSession {
  id: string;
  userId: string;
  frequency: number;
  category: 'solfeggio' | 'rife' | 'chakra' | 'planetary' | 'custom';
  duration: number; // in minutes
  volume: number; // 0-100
  binauralBeat?: number;
  startTime: Date;
  endTime?: Date;
  moodBefore?: number; // 1-10 scale
  moodAfter?: number; // 1-10 scale
  notes?: string;
  astrologyFactors?: string[];
  tcmFactors?: string[];
  effectiveness?: number; // 1-10 scale
}

export interface FrequencyRecommendation {
  id: string;
  frequency: number;
  category: string;
  name: string;
  description: string;
  reason: string;
  confidence: number; // 0-1
  astrologyFactor?: string;
  tcmFactor?: string;
  optimalTiming: Date[];
  duration: number;
  binauralBeat?: number;
}

export interface MeridianWindow {
  organ: string;
  element: keyof ElementalBalance;
  peakTime: string; // HH:mm format
  optimalFrequencies: number[];
  currentStrength: number; // 0-1
  description: string;
}

export interface TCMInsight {
  primaryElement: keyof ElementalBalance;
  elementBalance: ElementalBalance;
  constitutionalType: string;
  recommendations: string[];
  seasonalGuidance: Record<string, string>;
  meridianTiming: MeridianWindow[];
  lastUpdated: Date;
}

export interface CrossAppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'recommendation';
  title: string;
  message: string;
  timestamp: Date;
  source: 'astro' | 'healwave' | 'system';
  actionable?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
  read: boolean;
  persistent: boolean;
}

export interface SyncState {
  lastSync: Date;
  conflictResolution: 'client' | 'server' | 'merge';
  pendingChanges: AppStateChange[];
  isOnline: boolean;
}

export interface ConflictState {
  id: string;
  type: 'session' | 'preference' | 'chart' | 'tcm';
  localData: unknown;
  remoteData: unknown;
  timestamp: Date;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merge';
}

export interface IntegrationEvent<T = unknown> {
  type: string;
  payload: T;
  source: 'astro' | 'healwave' | 'system';
  timestamp: Date;
  id: string;
}

// Simple EventEmitter implementation for browser compatibility
type Listener<T = unknown> = (data: T) => void;
class SimpleEventEmitter {
  private events: Record<string, Listener[]> = {};

  on<T = unknown>(event: string, callback: Listener<T>): void {
    (this.events[event] ??= []).push(callback as Listener);
  }

  off<T = unknown>(event: string, callback: Listener<T>): void {
    const list = this.events[event];
    if (!list) return;
    this.events[event] = list.filter(cb => cb !== (callback as Listener));
  }

  emit<T = unknown>(event: string, data: T): void {
    const list = this.events[event];
    if (!list) return;
    list.forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        logger.warn('Listener error', err);
      }
    });
  }
}



export interface ChartData {
  // Chart data structure - can be extended as needed
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  birthData?: BirthData;
  preferences: UserPreferences;
  subscription: SubscriptionTier;
  clinicalAccess: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'cosmic';
  notifications: boolean;
  soundEnabled: boolean;
  visualizationsEnabled: boolean;
  preferredFrequencies: string[];
  sessionDuration: number;
  volumeLevel: number;
}

type SubscriptionTier = 'free' | 'basic' | 'pro' | 'clinical';

export interface AppState {
  // User state
  user: UserProfile | null;
  
  // Chart state
  currentChart: AstrologyChart | null;
  
  // HealWave state
  healwave: {
    currentSession: HealingSession | null;
    sessionHistory: HealingSession[];
    isPlaying: boolean;
    lastFrequency: number | null;
    recommendations: FrequencyRecommendation[];
  };
  
  // TCM Integration state
  tcm: {
    insights: TCMInsight | null;
    meridianTiming: MeridianWindow[];
    seasonalAdjustments: SeasonalFrequency[];
  };
  
  // Astrology state
  astrology: {
    currentTransits: TransitResult[];
    recommendations: FrequencyRecommendation[];
    lastCalculation: Date | null;
  };
  
  // Cross-app state
  theme: 'light' | 'dark' | 'cosmic';
  activeApp: 'astro' | 'healwave';
  notifications: CrossAppNotification[];
  sync: SyncState;
}

export interface SeasonalFrequency {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  element: keyof ElementalBalance;
  baseFrequency: number;
  modifier: number;
  description: string;
  optimalTimes: string[]; // HH:mm format
}

interface CrossAppEvent<P = unknown> {
  type: string;
  payload: P;
  source: string;
  timestamp: number;
}

interface AppStateChange {
  id: string;
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

class CrossAppStore extends SimpleEventEmitter {
  private storageKey = 'cosmichub-cross-app-state';
  private state: AppState = {
    user: null,
    currentChart: null,
    healwave: {
      currentSession: null,
      sessionHistory: [],
      isPlaying: false,
      lastFrequency: null,
      recommendations: [],
    },
    tcm: {
      insights: null,
      meridianTiming: [],
      seasonalAdjustments: [],
    },
    astrology: {
      currentTransits: [],
      recommendations: [],
      lastCalculation: null,
    },
    theme: 'cosmic',
    activeApp: 'astro',
    notifications: [],
    sync: {
      lastSync: new Date(),
      conflictResolution: 'merge',
      pendingChanges: [],
      isOnline: navigator?.onLine ?? true,
    },
  };

  constructor() {
    super();
    this.loadState();
    this.setupStorageListener();
  }

  // Get current state
  getState(): AppState {
    return { ...this.state };
  }

  // Update user data
  updateUser(user: AppState['user']): void {
    this.state.user = user ?? null;
    this.saveState();
    this.emit('user:updated', this.state.user);
    this.broadcastEvent('user:updated', this.state.user);
  }

  // Update current chart
  updateChart(chart: AppState['currentChart']): void {
    this.state.currentChart = chart ?? null;
    this.saveState();
    this.emit('chart:updated', this.state.currentChart);
    this.broadcastEvent('chart:updated', this.state.currentChart);
  }

  // Update theme
  updateTheme(theme: AppState['theme']): void {
    this.state.theme = theme;
    this.saveState();
    this.emit('theme:updated', theme);
    this.broadcastEvent('theme:updated', theme);
  }

  // Set active app
  setActiveApp(app: AppState['activeApp']): void {
    this.state.activeApp = app;
    this.saveState();
    this.emit('app:changed', app);
    this.broadcastEvent('app:changed', app);
  }

  // Sync chart data from astro to healwave
  syncChartToHealwave(chartData: ChartData | null): void {
    this.broadcastEvent('chart:sync', chartData);
  }

  // Sync frequency settings from healwave to astro
  syncFrequenciesToAstro(frequencies: number[]): void {
    this.broadcastEvent('frequencies:sync', frequencies);
  }

  // Subscribe to events
  subscribe<T = unknown>(event: string, callback: Listener<T>): () => void {
    this.on(event, callback);
    return () => this.off(event, callback);
  }

  // Private methods
  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      logger.warn('Failed to save cross-app state:', error);
    }
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<AppState>;
        this.state = { ...this.state, ...parsed };
      }
    } catch (error) {
      logger.warn('Failed to load cross-app state:', error);
    }
  }

  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', event => {
        if (event.key === this.storageKey && event.newValue) {
          try {
            const newState = JSON.parse(event.newValue) as Partial<AppState>;
            this.state = { ...this.state, ...newState };
            this.emit('state:synced', this.state);
          } catch (error) {
            logger.warn('Failed to sync cross-app state:', error);
          }
        }
      });
    }
  }

  private broadcastEvent<P = unknown>(type: string, payload: P): void {
    const event: CrossAppEvent<P> = {
      type,
      payload,
      source: this.state.activeApp,
      timestamp: Date.now(),
    };

    // Broadcast via localStorage for cross-tab communication
    try {
      const eventKey = `cosmichub-event-${Date.now()}`;
      localStorage.setItem(eventKey, JSON.stringify(event));

      // Clean up old events
      setTimeout(() => {
        localStorage.removeItem(eventKey);
      }, 5000);
    } catch (error) {
      logger.warn('Failed to broadcast event:', error);
    }
  }

  // Healing session methods
  startHealingSession(session: HealingSession): void {
    this.state.healwave.currentSession = session;
    this.state.healwave.isPlaying = true;
    this.emit('healwave:updated', this.state.healwave);
    this.emit('state:updated', this.state);
    logger.info('Healing session started', { sessionId: session.id });
  }

  endHealingSession(sessionId: string, effectiveness?: number, notes?: string): void {
    const session = this.state.healwave.currentSession;
    if (session && session.id === sessionId) {
      const completedSession = {
        ...session,
        endTime: new Date(),
        effectiveness,
        notes,
      };
      this.state.healwave.sessionHistory.push(completedSession);
      this.state.healwave.currentSession = null;
      this.state.healwave.isPlaying = false;
      this.emit('healwave:updated', this.state.healwave);
      this.emit('state:updated', this.state);
      logger.info('Healing session ended', { sessionId, effectiveness });
    }
  }

  updateFrequencyRecommendations(recommendations: FrequencyRecommendation[]): void {
    this.state.healwave.recommendations = recommendations;
    this.emit('healwave:updated', this.state.healwave);
    this.emit('state:updated', this.state);
  }

  // TCM methods
  updateTCMInsights(insights: TCMInsight): void {
    this.state.tcm.insights = insights;
    this.emit('tcm:updated', this.state.tcm);
    this.emit('state:updated', this.state);
  }

  updateMeridianTiming(timing: MeridianWindow[]): void {
    this.state.tcm.meridianTiming = timing;
    this.emit('tcm:updated', this.state.tcm);
    this.emit('state:updated', this.state);
  }

  // Astrology methods
  updateCurrentTransits(transits: AppState['astrology']['currentTransits']): void {
    this.state.astrology.currentTransits = transits;
    this.state.astrology.lastCalculation = new Date();
    this.emit('astrology:updated', this.state.astrology);
    this.emit('state:updated', this.state);
  }

  updateAstrologyRecommendations(recommendations: FrequencyRecommendation[]): void {
    this.state.astrology.recommendations = recommendations;
    this.emit('astrology:updated', this.state.astrology);
    this.emit('state:updated', this.state);
  }

  // Notification methods
  addNotification(notification: CrossAppNotification): void {
    this.state.notifications.push(notification);
    this.emit('notifications:updated', this.state.notifications);
    this.emit('state:updated', this.state);
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.state.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notifications:updated', this.state.notifications);
      this.emit('state:updated', this.state);
    }
  }

  clearNotifications(): void {
    this.state.notifications = [];
    this.emit('notifications:updated', this.state.notifications);
    this.emit('state:updated', this.state);
  }

  // Sync methods
  syncData(): void {
    this.state.sync.lastSync = new Date();
    this.state.sync.pendingChanges = [];
    this.emit('sync:updated', this.state.sync);
    this.emit('state:updated', this.state);
    logger.info('Data synchronized');
  }

  // Clear all state
  clear(): void {
    this.state = {
      user: null,
      currentChart: null,
      healwave: {
        currentSession: null,
        sessionHistory: [],
        isPlaying: false,
        lastFrequency: null,
        recommendations: [],
      },
      tcm: {
        insights: null,
        meridianTiming: [],
        seasonalAdjustments: [],
      },
      astrology: {
        currentTransits: [],
        recommendations: [],
        lastCalculation: null,
      },
      theme: 'cosmic',
      activeApp: 'astro',
      notifications: [],
      sync: {
        lastSync: new Date(),
        conflictResolution: 'merge',
        pendingChanges: [],
        isOnline: navigator?.onLine ?? true,
      },
    };
    this.saveState();
    this.emit('state:cleared', this.state);
  }
}

// Create singleton instance
export const crossAppStore = new CrossAppStore();

export default crossAppStore;
