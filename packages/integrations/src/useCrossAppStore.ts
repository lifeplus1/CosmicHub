import React from 'react';
import { crossAppStore, AppState } from './cross-app-store';

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
    syncFrequenciesToAstro:
      crossAppStore.syncFrequenciesToAstro.bind(crossAppStore),
    subscribe: crossAppStore.subscribe.bind(crossAppStore),
    clear: crossAppStore.clear.bind(crossAppStore),
  };
};
