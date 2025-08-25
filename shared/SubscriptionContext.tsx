
// Simple logger for structured logging
const logger = {
  info: (msg, data) => logger.info(`[INFO] ${msg}`, data),
  warn: (msg, data) => logger.warn(`[WARN] ${msg}`, data),
  error: (msg, data) => logger.error(`[ERROR] ${msg}`, data),
  debug: (msg, data) => logger.debug(`[DEBUG] ${msg}`, data)
};
/**
 * DEPRECATED (August 2025)
 * Replaced by SubscriptionProvider in `@cosmichub/auth` which integrates with the unified
 * subscription manager in `@cosmichub/integrations`.
 * No runtime imports in app code should reference this file anymore.
 * Will be deleted after confirmation that no production builds rely on it.
 */
/**
 * DEPRECATED (August 2025)
 * Replaced by SubscriptionProvider in `@cosmichub/auth`.
 * Will be removed once no imports remain.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUserTier, hasFeatureAccess, COSMICHUB_TIERS, HEALWAVE_TIERS } from '@cosmichub/subscriptions';

// Minimal local type alias (legacy) – prefer types from auth package elsewhere
interface UserSubscription { tier: string; status: string; currentPeriodEnd?: string | number | Date; }

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
        throw new Error(`Failed to fetch subscription: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      // Improved error logging with additional context
      logger.error('Error fetching subscription:', {
        error,
        userId: user?.uid,
        endpoint: `${import.meta.env.VITE_BACKEND_URL}/stripe/subscription-status`
      });
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (requiredTier: string): boolean => {
    // Import the appropriate tier configuration based on app type
  const tiers = appType === 'healwave' ? HEALWAVE_TIERS : COSMICHUB_TIERS;
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
