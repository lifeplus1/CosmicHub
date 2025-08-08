import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './index';

// Re-export types from integrations package
export type { UserSubscription, SubscriptionPlan } from '@cosmichub/integrations';

interface SubscriptionContextType {
  subscription: any | null;
  userTier: string;
  isLoading: boolean;
  hasFeature: (feature: string, app?: 'astro' | 'healwave') => boolean;
  upgradeRequired: (feature: string) => void;
  refreshSubscription: () => Promise<void>;
  checkUsageLimit?: (limitType: string) => { allowed: boolean; current: number; limit: number };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  appType: 'astro' | 'healwave';
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ 
  children, 
  appType 
}) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({
    chartsThisMonth: 0,
    savedCharts: 0
  });

  // Use integrations package for subscription management
  const [subscriptionManager, setSubscriptionManager] = React.useState<any>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mod = await import('@cosmichub/integrations');
        if (!cancelled) setSubscriptionManager((mod as any).subscriptionManager || (mod as any).default);
      } catch (e) {
        console.error('Failed to load subscription manager', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      if (!subscriptionManager) return; // still loading
      // Check for mock users first
      const email = user.email;
      if (email?.includes('test')) {
        // Handle mock users based on app type
        const mockData = getMockSubscription(email, appType);
        setSubscription(mockData.subscription);
        setUsageData(mockData.usage);
        setIsLoading(false);
        return;
      }

      // Real API call through integrations package
      await subscriptionManager.loadUserSubscription(user);
      const currentSub = subscriptionManager.getCurrentSubscription();
      setSubscription(currentSub);
      
      // App-specific usage data handling
      if (appType === 'astro') {
        // Fetch astro-specific usage
        const usageResponse = await fetch('/api/astro/usage', {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` }
        });
        if (usageResponse.ok) {
          const usage = await usageResponse.json();
          setUsageData(usage);
        }
      }
      
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (feature: string, app?: 'astro' | 'healwave'): boolean => {
    if (!subscriptionManager) return false;
    return subscriptionManager.checkFeatureAccess(feature, app || appType).canAccess;
  };

  const upgradeRequired = (feature: string) => {
    // App-specific upgrade handling
    if (appType === 'astro') {
      // Use astro's upgrade modal system - try multiple possible paths
      const tryImportUpgradeEvents = async () => {
        const possiblePaths = [
          '../../../apps/astro/src/utils/upgradeEvents',
          '../../apps/astro/src/utils/upgradeEvents'
        ];
        
        for (const path of possiblePaths) {
          try {
            const mod = await import(/* @vite-ignore */ path);
            (mod as any).upgradeEventManager?.triggerUpgradeRequired(feature);
            return;
          } catch (e) {
            // Continue to next path
          }
        }
        
        // Fallback to custom event if direct import fails
        const event = new CustomEvent('showUpgradeModal', { 
          detail: { feature, requiredTier: 'premium' } 
        });
        window.dispatchEvent(event);
      };
      
      tryImportUpgradeEvents().catch(() => {
        console.warn('Upgrade events module not available, using fallback');
      });
    } else {
      // Use healwave's upgrade modal system
      const event = new CustomEvent('showUpgradeModal', { 
        detail: { feature, requiredTier: 'pro' } 
      });
      window.dispatchEvent(event);
    }
  };

  const checkUsageLimit = (limitType: string) => {
    if (appType !== 'astro') {
      // Only astro has usage limits currently
      return { allowed: true, current: 0, limit: 0 };
    }

    const limits = {
      chartsPerMonth: subscription?.tier === 'free' ? 3 : -1,
      chartStorage: subscription?.tier === 'free' ? 5 : -1
    };
    
    const limit = limits[limitType as keyof typeof limits];
    if (limit === -1) return { allowed: true, current: 0, limit: 0 };
    
    const current = limitType === 'chartsPerMonth' ? usageData.chartsThisMonth : usageData.savedCharts;
    return { allowed: current < limit, current, limit };
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
  subscription,
    userTier: subscription?.tier || 'free',
  isLoading: isLoading || !subscriptionManager,
    hasFeature,
    upgradeRequired,
    refreshSubscription,
    ...(appType === 'astro' && { checkUsageLimit })
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Helper function for mock data
function getMockSubscription(email: string, appType: 'astro' | 'healwave') {
  const baseData = {
    subscription: {
      status: 'active' as const,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    usage: { chartsThisMonth: 0, savedCharts: 0 }
  };

  if (email === 'free@cosmichub.test') {
    return {
      subscription: { ...baseData.subscription, tier: 'free' },
      usage: { chartsThisMonth: 2, savedCharts: 1 }
    };
  } else if (email === 'premium@cosmichub.test') {
    return {
      subscription: { ...baseData.subscription, tier: 'premium' },
      usage: { chartsThisMonth: 15, savedCharts: 25 }
    };
  } else if (email === 'elite@cosmichub.test') {
    return {
      subscription: { ...baseData.subscription, tier: 'elite' },
      usage: { chartsThisMonth: 50, savedCharts: 100 }
    };
  }

  return baseData;
}
