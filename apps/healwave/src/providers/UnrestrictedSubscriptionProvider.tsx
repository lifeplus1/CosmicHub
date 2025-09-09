import React, { createContext, useCallback } from 'react';
import { devConsole } from '../config/devConsole';
import { UnrestrictedSubscriptionContextType } from './unrestrictedSubscription.types';

/**
 * Unrestricted Subscription Provider for AB Testing
 * Bypasses all subscription checks and provides full access to all features
 */

const UnrestrictedSubscriptionContext = createContext<UnrestrictedSubscriptionContextType | null>(null);

interface UnrestrictedSubscriptionProviderProps {
  children: React.ReactNode;
  appType: 'astro' | 'healwave';
}

export const UnrestrictedSubscriptionProvider: React.FC<UnrestrictedSubscriptionProviderProps> = ({
  children,
  appType: _appType
}) => {
  // Always return premium access for AB testing
  const hasFeature = useCallback((_feature: string, _app?: 'astro' | 'healwave'): boolean => {
    return true; // All features always available
  }, []);

  const upgradeRequired = useCallback((_feature: string) => {
    // No upgrade ever required in AB test mode
    devConsole.info('🧪 AB Test: Upgrade bypassed - all features available');
  }, []);

  const checkUsageLimit = useCallback((_limitType: string) => {
    return { allowed: true, current: 0, limit: -1 }; // Unlimited usage
  }, []);

  const contextValue: UnrestrictedSubscriptionContextType = {
    userTier: 'premium', // Always premium for AB testing
    hasFeature,
    upgradeRequired,
    checkUsageLimit,
    subscription: {
      tier: 'premium',
      status: 'active',
      features: ['*'], // All features
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Mock 30 days from now
    },
    usageData: {
      chartsGenerated: 0,
      apiCallsUsed: 0,
      storageUsed: 0
    }
  };

  return (
    <UnrestrictedSubscriptionContext.Provider value={contextValue}>
      {children}
    </UnrestrictedSubscriptionContext.Provider>
  );
};

// Export context for hook
export { UnrestrictedSubscriptionContext };
