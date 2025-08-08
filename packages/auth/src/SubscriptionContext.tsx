import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './index';

// Base types that both apps can use
export interface UserSubscription {
  tier: 'free' | 'premium' | 'elite';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  customerId?: string;
  subscriptionId?: string;
}

export interface UsageData {
  chartsThisMonth: number;
  savedCharts: number;
}

export interface SubscriptionContextType {
  subscription: UserSubscription | null;
  userTier: string;
  isLoading: boolean;
  hasFeature: (requiredTier: string) => boolean;
  upgradeRequired: (feature: string) => void;
  refreshSubscription: () => Promise<void>;
  checkUsageLimit?: (limitType: 'chartsPerMonth' | 'chartStorage') => { allowed: boolean; current: number; limit: number };
  usageData?: UsageData;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  appType: 'astro' | 'healwave';
  apiUrl?: string;
  tiers: Record<string, any>;
  upgradeHandler?: (feature: string) => void;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ 
  children, 
  appType,
  apiUrl = process.env.VITE_BACKEND_URL || 'https://astrology-app-0emh.onrender.com',
  tiers,
  upgradeHandler
}) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState<UsageData>({
    chartsThisMonth: 0,
    savedCharts: 0
  });

  const getUserTier = (subscription: UserSubscription | null): string => {
    return subscription?.status === 'active' ? subscription.tier : 'free';
  };

  const userTier = getUserTier(subscription);

  const hasFeatureAccess = (userTier: string, requiredTier: string, tiers: Record<string, any>): boolean => {
    const tierOrder = Object.keys(tiers);
    const userIndex = tierOrder.indexOf(userTier);
    const requiredIndex = tierOrder.indexOf(requiredTier);
    return userIndex >= requiredIndex;
  };

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Check for mock users first
      const email = user.email;
      const mockSubscriptions = {
        'free@cosmichub.test': { tier: 'free' as const, usage: { chartsThisMonth: 2, savedCharts: 1 } },
        'premium@cosmichub.test': { tier: 'premium' as const, usage: { chartsThisMonth: 15, savedCharts: 25 } },
        'elite@cosmichub.test': { tier: 'elite' as const, usage: { chartsThisMonth: 50, savedCharts: 100 } },
        'free@healwave.test': { tier: 'free' as const, usage: { chartsThisMonth: 1, savedCharts: 0 } },
        'premium@healwave.test': { tier: 'premium' as const, usage: { chartsThisMonth: 8, savedCharts: 12 } }
      };

      if (email && mockSubscriptions[email as keyof typeof mockSubscriptions]) {
        const mockData = mockSubscriptions[email as keyof typeof mockSubscriptions];
        setSubscription({
          tier: mockData.tier,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customerId: `cus_mock_${mockData.tier}_user`,
          subscriptionId: `sub_mock_${mockData.tier}_123`
        });
        setUsageData(mockData.usage);
        setIsLoading(false);
        return;
      }

      // Real API call for production users
      const response = await fetch(`${apiUrl}/user/subscription`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setSubscription({
          tier: userData.subscription.tier,
          status: userData.subscription.status,
          currentPeriodEnd: new Date(userData.subscription.currentPeriodEnd),
          customerId: userData.subscription.customerId,
          subscriptionId: userData.subscription.subscriptionId
        });
        
        if (userData.usage) {
          setUsageData({
            chartsThisMonth: userData.usage.chartsThisMonth || 0,
            savedCharts: userData.usage.savedCharts || 0
          });
        }
      } else {
        // Fallback for development - elite tier
        setSubscription({
          tier: 'elite',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          customerId: `cus_dev_${appType}_user`,
          subscriptionId: `sub_dev_${appType}_123`
        });
        
        setUsageData({
          chartsThisMonth: 5,
          savedCharts: 8
        });
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (requiredTier: string): boolean => {
    return hasFeatureAccess(userTier, requiredTier, tiers);
  };

  const checkUsageLimit = (limitType: 'chartsPerMonth' | 'chartStorage') => {
    const tier = tiers[userTier];
    const limit = tier?.limits?.[limitType];
    
    if (!limit || limit === -1) {
      return { allowed: true, current: 0, limit: 0 };
    }

    const current = limitType === 'chartsPerMonth' ? usageData.chartsThisMonth : usageData.savedCharts;
    return {
      allowed: current < limit,
      current,
      limit
    };
  };

  const upgradeRequired = (feature: string) => {
    if (upgradeHandler) {
      upgradeHandler(feature);
    } else {
      // Default behavior - emit custom event
      const event = new CustomEvent('showUpgradeModal', { 
        detail: { feature, requiredTier: 'premium', appType } 
      });
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
    subscription,
    userTier,
    isLoading,
    hasFeature,
    upgradeRequired,
    refreshSubscription,
    checkUsageLimit: appType === 'astro' ? checkUsageLimit : undefined,
    usageData: appType === 'astro' ? usageData : undefined
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

export { getUserTier, hasFeatureAccess } from './subscription-utils';
