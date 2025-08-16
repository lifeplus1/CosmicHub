import { AppState } from './cross-app-store';
export declare const useCrossAppStore: () => {
    state: AppState;
    updateUser: (user: AppState["user"]) => void;
    updateChart: (chart: AppState["currentChart"]) => void;
    updateTheme: (theme: AppState["theme"]) => void;
    setActiveApp: (app: AppState["activeApp"]) => void;
    syncChartToHealwave: (chartData: any) => void;
    syncFrequenciesToAstro: (frequencies: number[]) => void;
    subscribe: (event: string, callback: (data: any) => void) => () => void;
    clear: () => void;
};
//# sourceMappingURL=useCrossAppStore.d.ts.map