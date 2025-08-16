/**
 * Cross-app state management for CosmicHub monorepo
 * Enables seamless data sharing between astro and healwave apps
 */
declare class SimpleEventEmitter {
    private events;
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
    emit(event: string, data?: any): void;
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
declare class CrossAppStore extends SimpleEventEmitter {
    private state;
    private storageKey;
    constructor();
    getState(): AppState;
    updateUser(user: AppState['user']): void;
    updateChart(chart: AppState['currentChart']): void;
    updateTheme(theme: AppState['theme']): void;
    setActiveApp(app: AppState['activeApp']): void;
    syncChartToHealwave(chartData: any): void;
    syncFrequenciesToAstro(frequencies: number[]): void;
    subscribe(event: string, callback: (data: any) => void): () => void;
    private saveState;
    private loadState;
    private setupStorageListener;
    private broadcastEvent;
    clear(): void;
}
export declare const crossAppStore: CrossAppStore;
export default crossAppStore;
//# sourceMappingURL=cross-app-store.d.ts.map