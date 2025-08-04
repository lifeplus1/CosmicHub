import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { UserSubscription } from '../types/subscription';
import { getUserTier, hasFeatureAccess, COSMICHUB_TIERS } from '../types/subscription';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  userTier: string;
  isLoading: boolean;
  hasFeature: (requiredTier: string) => boolean;
  upgradeRequired: (feature: string) => void;
  refreshSubscription: () => Promise<void>;
  checkUsageLimit: (limitType: 'chartsPerMonth' | 'chartStorage') => { allowed: boolean; current: number; limit: number };
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({
    chartsThisMonth: 0,
    savedCharts: 0
  });

  const userTier = getUserTier(subscription);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Check if this is a mock user for testing
      const email = user.email;
      let mockSubscription = null;
      
      if (email === 'free@cosmichub.test') {
        mockSubscription = {
          tier: 'free' as const,
          status: 'active' as const,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customerId: 'cus_mock_free_user',
          subscriptionId: 'sub_mock_free_123'
        };
        setUsageData({
          chartsThisMonth: 2,
          savedCharts: 1
        });
      } else if (email === 'premium@cosmichub.test') {
        mockSubscription = {
          tier: 'premium' as const,
          status: 'active' as const,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customerId: 'cus_mock_premium_user',
          subscriptionId: 'sub_mock_premium_123'
        };
        setUsageData({
          chartsThisMonth: 15,
          savedCharts: 25
        });
      } else if (email === 'elite@cosmichub.test') {
        mockSubscription = {
          tier: 'elite' as const,
          status: 'active' as const,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customerId: 'cus_mock_elite_user',
          subscriptionId: 'sub_mock_elite_123'
        };
        setUsageData({
          chartsThisMonth: 50,
          savedCharts: 100
        });
      }

      // If it's a mock user, use mock data
      if (mockSubscription) {
        setSubscription(mockSubscription);
        setIsLoading(false);
        return;
      }

      // FOR DEVELOPMENT: Fetch user data from backend for real users
      const response = await fetch('/api/user/subscription', {
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
        
        setUsageData({
          chartsThisMonth: userData.usage.chartsThisMonth,
          savedCharts: userData.usage.savedCharts
        });
      } else {
        // Fallback to elite for development (non-mock users)
        setSubscription({
          tier: 'elite',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          customerId: 'cus_dev_elite_user',
          subscriptionId: 'sub_dev_elite_123'
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
    return hasFeatureAccess(userTier, requiredTier, COSMICHUB_TIERS);
  };

  const checkUsageLimit = (limitType: 'chartsPerMonth' | 'chartStorage') => {
    const tier = COSMICHUB_TIERS[userTier];
    const limit = tier?.limits[limitType];
    
    if (!limit) {
      // No limit for this tier
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
    // Show upgrade notification
    console.log(`Upgrade to CosmicHub Pro required for: ${feature}`);
    // TODO: Show upgrade modal or redirect to pricing page
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
    checkUsageLimit
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
