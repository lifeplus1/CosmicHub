/**
 * Cross-app state management for CosmicHub monorepo
 * Enables seamless data sharing between astro and healwave apps
 */
// Simple EventEmitter implementation for browser compatibility
class SimpleEventEmitter {
    events = {};
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    off(event, callback) {
        if (!this.events[event])
            return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    emit(event, data) {
        if (!this.events[event])
            return;
        this.events[event].forEach(callback => callback(data));
    }
}
class CrossAppStore extends SimpleEventEmitter {
    state = {
        user: null,
        currentChart: null,
        theme: 'cosmic',
        activeApp: 'astro'
    };
    storageKey = 'cosmichub-cross-app-state';
    constructor() {
        super();
        this.loadState();
        this.setupStorageListener();
    }
    // Get current state
    getState() {
        return { ...this.state };
    }
    // Update user data
    updateUser(user) {
        this.state.user = user;
        this.saveState();
        this.emit('user:updated', user);
        this.broadcastEvent('user:updated', user);
    }
    // Update current chart
    updateChart(chart) {
        this.state.currentChart = chart;
        this.saveState();
        this.emit('chart:updated', chart);
        this.broadcastEvent('chart:updated', chart);
    }
    // Update theme
    updateTheme(theme) {
        this.state.theme = theme;
        this.saveState();
        this.emit('theme:updated', theme);
        this.broadcastEvent('theme:updated', theme);
    }
    // Set active app
    setActiveApp(app) {
        this.state.activeApp = app;
        this.saveState();
        this.emit('app:changed', app);
        this.broadcastEvent('app:changed', app);
    }
    // Sync chart data from astro to healwave
    syncChartToHealwave(chartData) {
        this.broadcastEvent('chart:sync', chartData);
    }
    // Sync frequency settings from healwave to astro
    syncFrequenciesToAstro(frequencies) {
        this.broadcastEvent('frequencies:sync', frequencies);
    }
    // Subscribe to events
    subscribe(event, callback) {
        this.on(event, callback);
        return () => this.off(event, callback);
    }
    // Private methods
    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        }
        catch (error) {
            console.warn('Failed to save cross-app state:', error);
        }
    }
    loadState() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        }
        catch (error) {
            console.warn('Failed to load cross-app state:', error);
        }
    }
    setupStorageListener() {
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event) => {
                if (event.key === this.storageKey && event.newValue) {
                    try {
                        const newState = JSON.parse(event.newValue);
                        this.state = newState;
                        this.emit('state:synced', newState);
                    }
                    catch (error) {
                        console.warn('Failed to sync cross-app state:', error);
                    }
                }
            });
        }
    }
    broadcastEvent(type, payload) {
        const event = {
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
        }
        catch (error) {
            console.warn('Failed to broadcast event:', error);
        }
    }
    // Clear all state
    clear() {
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
export default crossAppStore;
//# sourceMappingURL=cross-app-store.js.map