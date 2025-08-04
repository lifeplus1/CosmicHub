import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { UserSubscription, getUserTier, hasFeatureAccess } from '../shared/subscription-types';

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
  appType: 'healwave' | 'cosmichub';
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ 
  children, 
  appType 
}) => {
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
      // TODO: Replace with actual API call to your backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/subscription`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        // User not found or no subscription
        setSubscription(null);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (requiredTier: string): boolean => {
    // Import the appropriate tier configuration based on app type
    const tiers = appType === 'healwave' 
      ? require('../shared/subscription-types').HEALWAVE_TIERS
      : require('../shared/subscription-types').COSMICHUB_TIERS;
    
    return hasFeatureAccess(userTier, requiredTier, tiers);
  };

  const upgradeRequired = (feature: string) => {
    // TODO: Show upgrade modal or redirect to pricing page
    console.log(`Upgrade required for feature: ${feature}`);
    // You can implement a toast notification or modal here
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
