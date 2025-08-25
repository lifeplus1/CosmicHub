/**
 * Cross-app state management for CosmicHub monorepo
 * Enables seamless data sharing between astro and healwave apps
 */

// Simple logger for integrations package
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
  }
};

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
      try { callback(data); } catch (err) { logger.warn('Listener error', err); }
    });
  }
}

export interface UserPreferences { [key: string]: unknown }
export interface ChartData { id: string; data: Record<string, unknown> | null; name: string }
export interface UserState { id: string; subscription: string; preferences: UserPreferences }
export interface AppState {
  user: UserState | null;
  currentChart: ChartData | null;
  theme: 'light' | 'dark' | 'cosmic';
  activeApp: 'astro' | 'healwave';
}

export interface CrossAppEvent<P = unknown> { type: string; payload: P; source: string; timestamp: number }

class CrossAppStore extends SimpleEventEmitter {
  private state: AppState = {
    user: null,
    currentChart: null,
    theme: 'cosmic',
    activeApp: 'astro'
  };

  private storageKey = 'cosmichub-cross-app-state';

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
  window.addEventListener('storage', (event) => {
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
      timestamp: Date.now()
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

  // Clear all state
  clear(): void {
    this.state = {
      user: null,
      currentChart: null,
      theme: 'cosmic',
      activeApp: 'astro'
    };
    this.saveState();
  this.emit('state:cleared', this.state);
  }
}

// Create singleton instance
export const crossAppStore = new CrossAppStore();

export default crossAppStore;
