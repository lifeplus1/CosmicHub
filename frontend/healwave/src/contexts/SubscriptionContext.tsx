import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { UserSubscription, getUserTier, hasFeatureAccess, HEALWAVE_TIERS } from '../types/subscription';

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  userTier: string;
  isLoading: boolean;
  hasFeature: (requiredTier: string) => boolean;
  upgradeRequired: (feature: string) => void;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userTier = getUserTier(subscription);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // For now, simulate free tier for all users
      // TODO: Replace with actual API call to check Stripe subscription
      setSubscription(null); // null = free tier
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (requiredTier: string): boolean => {
    return hasFeatureAccess(userTier, requiredTier, HEALWAVE_TIERS);
  };

  const upgradeRequired = (feature: string) => {
    // Show upgrade notification
    console.log(`Upgrade to HealWave Pro required for: ${feature}`);
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
    refreshSubscription
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
