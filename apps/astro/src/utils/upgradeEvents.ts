/**
 * Event system for triggering upgrade modal from anywhere in the app
 */

export interface UpgradeRequiredEvent {
  feature: string;
}

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
      } catch (error) {
        // Lazy import to avoid cyclic dependency and keep this utility lightweight
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { devConsole } = require('../config/environment');
          devConsole.error('❌ Error in upgrade event listener:', error);
        } catch {
          if (typeof console !== 'undefined') console.error('Error in upgrade event listener:', error);
        }
      }
    });
  }

  triggerUpgradeRequired(feature: string): void {
    this.emit({ feature });
  }
}

// Export singleton instance
export const upgradeEventManager = new UpgradeEventManager();
