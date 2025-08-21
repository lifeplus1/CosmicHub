/**
 * Event system for triggering upgrade modal from anywhere in the app
 */

export interface UpgradeRequiredEvent {
  feature: string;
}

import { devConsole } from '../config/environment';

class UpgradeEventManager {
  private listeners: Array<(event: UpgradeRequiredEvent) => void> = [];

  subscribe(listener: (event: UpgradeRequiredEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(event: UpgradeRequiredEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error: unknown) {
        devConsole.error?.('❌ Error in upgrade event listener:', error);
      }
    });
  }

  triggerUpgradeRequired(feature: string): void {
    this.emit({ feature });
  }
}

// Export singleton instance
export const upgradeEventManager = new UpgradeEventManager();
