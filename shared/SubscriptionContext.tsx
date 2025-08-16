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
      // Use actual backend API endpoint for subscription status
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/stripe/subscription-status`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else if (response.status === 404) {
        // User not found or no subscription
        setSubscription(null);
      } else {
        throw new Error(`Failed to fetch subscription: ${response.status}`);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
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
    // Trigger upgrade modal using existing event system or direct navigation
    if (typeof window !== 'undefined') {
      // Try to use the upgrade event system if available (Astro app)
      if ((window as any).upgradeEventManager) {
        (window as any).upgradeEventManager.triggerUpgradeRequired(feature);
      } else {
        // Fallback: redirect to pricing page
        window.location.href = '/pricing';
      }
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
