import React from 'react';
/**
 * Cross-app state management for CosmicHub monorepo
 * Enables seamless data sharing between astro and healwave apps
 */

// Simple EventEmitter implementation for browser compatibility
class SimpleEventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, data?: any): void {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }
}

export interface AppState {
  user: {
    id: string;
    subscription: string;
    preferences: Record<string, any>;
  } | null;
  currentChart: {
    id: string;
    data: any;
    name: string;
  } | null;
  theme: 'light' | 'dark' | 'cosmic';
  activeApp: 'astro' | 'healwave';
}

export interface CrossAppEvent {
  type: string;
  payload: any;
  source: string;
  timestamp: number;
}

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
    this.state.user = user;
    this.saveState();
    this.emit('user:updated', user);
    this.broadcastEvent('user:updated', user);
  }

  // Update current chart
  updateChart(chart: AppState['currentChart']): void {
    this.state.currentChart = chart;
    this.saveState();
    this.emit('chart:updated', chart);
    this.broadcastEvent('chart:updated', chart);
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
  syncChartToHealwave(chartData: any): void {
    this.broadcastEvent('chart:sync', chartData);
  }

  // Sync frequency settings from healwave to astro
  syncFrequenciesToAstro(frequencies: number[]): void {
    this.broadcastEvent('frequencies:sync', frequencies);
  }

  // Subscribe to events
  subscribe(event: string, callback: (data: any) => void): () => void {
    this.on(event, callback);
    return () => this.off(event, callback);
  }

  // Private methods
  private saveState(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save cross-app state:', error);
    }
  }

  private loadState(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load cross-app state:', error);
    }
  }

  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.storageKey && event.newValue) {
          try {
            const newState = JSON.parse(event.newValue);
            this.state = newState;
            this.emit('state:synced', newState);
          } catch (error) {
            console.warn('Failed to sync cross-app state:', error);
          }
        }
      });
    }
  }

  private broadcastEvent(type: string, payload: any): void {
    const event: CrossAppEvent = {
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
      console.warn('Failed to broadcast event:', error);
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
    this.emit('state:cleared');
  }
}

// Create singleton instance
export const crossAppStore = new CrossAppStore();

// React hook for easy integration
export const useCrossAppStore = () => {
  const [state, setState] = React.useState<AppState>(crossAppStore.getState());

  React.useEffect(() => {
    const unsubscribe = crossAppStore.subscribe('state:synced', setState);
    return unsubscribe;
  }, []);

  return {
    state,
    updateUser: crossAppStore.updateUser.bind(crossAppStore),
    updateChart: crossAppStore.updateChart.bind(crossAppStore),
    updateTheme: crossAppStore.updateTheme.bind(crossAppStore),
    setActiveApp: crossAppStore.setActiveApp.bind(crossAppStore),
    syncChartToHealwave: crossAppStore.syncChartToHealwave.bind(crossAppStore),
    syncFrequenciesToAstro: crossAppStore.syncFrequenciesToAstro.bind(crossAppStore),
    subscribe: crossAppStore.subscribe.bind(crossAppStore),
    clear: crossAppStore.clear.bind(crossAppStore)
  };
};

export default crossAppStore;
