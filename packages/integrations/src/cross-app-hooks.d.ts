export interface Notification {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error';
    timestamp: number;
}
export interface CrossAppStore {
    addNotification: (notification: Notification) => void;
    notifications: Notification[];
    clearNotifications: () => void;
}
export declare const useCrossAppStore: () => CrossAppStore;
//# sourceMappingURL=cross-app-hooks.d.ts.map