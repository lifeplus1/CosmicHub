import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from './index';
// Local lightweight logger (avoids depending on config devConsole if not exported)
const safeLogger = {
  error: (...args: unknown[]) => {
    void args.length;
  },
  warn: (...args: unknown[]) => {
    void args.length;
  },
};

// Re-export types from integrations package
export type {
  UserSubscription,
  SubscriptionPlan,
} from '@cosmichub/integrations';

// Basic shape we rely on from integrations package. (Kept intentionally minimal)
export interface BasicSubscription {
  tier: string; // e.g. 'free' | 'premium' | 'elite'
  status: string; // e.g. 'active'
  currentPeriodEnd?: Date; // Normalized to Date within provider
  [key: string]: unknown; // allow forward-compat extension
}

interface SubscriptionManagerLike {
  loadUserSubscription: (user: unknown) => Promise<void>;
  getCurrentSubscription: () => BasicSubscription | null | undefined;
  checkFeatureAccess: (
    feature: string,
    app: 'astro' | 'healwave'
  ) => { canAccess: boolean };
}

export interface SubscriptionState {
  subscription: BasicSubscription | null;
  userTier: string;
  tier: string; // Alias for userTier for backwards compatibility
  isLoading: boolean;
  hasFeature: (feature: string, app?: 'astro' | 'healwave') => boolean;
  upgradeRequired: (feature: string) => void;
  refreshSubscription: () => Promise<void>;
  checkUsageLimit?: (limitType: string) => {
    allowed: boolean;
    current: number;
    limit: number;
  };
}

type SubscriptionContextType = SubscriptionState;

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

interface SubscriptionProviderProps {
  children: ReactNode;
  appType: 'astro' | 'healwave';
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
  appType,
}) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<BasicSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [usageData, setUsageData] = useState({
    chartsThisMonth: 0,
    savedCharts: 0,
  });

  // Use integrations package for subscription management (runtime loaded)
  const [subscriptionManager, setSubscriptionManager] =
    React.useState<SubscriptionManagerLike | null>(null);

  // Lazy-load subscription manager from integrations package; avoid holding on to stale ref
  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const mod = await import('@cosmichub/integrations');
        if (!cancelled) {
          const candidate =
            (mod as Record<string, unknown>).subscriptionManager ??
            (mod as Record<string, unknown>).default;
          if (isSubscriptionManager(candidate)) {
            setSubscriptionManager(candidate);
          } else {
            safeLogger.error(
              'Loaded subscription manager does not match expected interface'
            );
          }
        }
      } catch (e) {
        safeLogger.error('Failed to load subscription manager', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshSubscription = useCallback(async () => {
    if (user === null || user === undefined) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (subscriptionManager === null) return; // still loading
      const email: string =
        typeof (user as { email?: unknown }).email === 'string'
          ? (user as { email: string }).email
          : '';
      if (email.includes('test')) {
        const mockData = getMockSubscription(email, appType);
        setSubscription(normalizeSubscription(mockData.subscription));
        setUsageData(mockData.usage);
        return;
      }
      await subscriptionManager.loadUserSubscription(user);
      const currentSub = subscriptionManager.getCurrentSubscription();
      if (currentSub !== null && currentSub !== undefined) {
        setSubscription(normalizeSubscription(currentSub));
      } else {
        setSubscription(null);
      }
      if (appType === 'astro') {
        const usageResponse = await fetch('/api/astro/usage', {
          headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        });
        if (usageResponse.ok) {
          const usage: unknown = await usageResponse.json();
          if (isAstroUsage(usage)) setUsageData(usage);
        }
      }
    } catch (error) {
      safeLogger.error('Failed to fetch subscription:', error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, subscriptionManager, appType]);

  const hasFeature = useCallback(
    (feature: string, app?: 'astro' | 'healwave'): boolean => {
      if (subscriptionManager === null) return false;
      const targetApp: 'astro' | 'healwave' = app ?? appType;
      const accessResult = subscriptionManager.checkFeatureAccess(
        feature,
        targetApp
      );
      return accessResult?.canAccess === true;
    },
    [subscriptionManager, appType]
  );

  const upgradeRequired = useCallback(
    (feature: string) => {
      // App-specific upgrade handling
      if (appType === 'astro') {
        // Use astro's upgrade modal system - try multiple possible paths
        const tryImportUpgradeEvents = async () => {
          const possiblePaths = [
            '../../../apps/astro/src/utils/upgradeEvents',
            '../../apps/astro/src/utils/upgradeEvents',
          ];

          for (const path of possiblePaths) {
            try {
              const mod: unknown = await import(/* @vite-ignore */ path);
              const manager = (mod as Record<string, unknown>)
                .upgradeEventManager as
                | { triggerUpgradeRequired?: (f: string) => void }
                | undefined;
              if (typeof manager?.triggerUpgradeRequired === 'function') {
                manager.triggerUpgradeRequired(feature);
              }
              return;
            } catch {
              // Continue to next path
            }
          }

          // Fallback to custom event if direct import fails
          const event = new CustomEvent('showUpgradeModal', {
            detail: { feature, requiredTier: 'premium' },
          });
          window.dispatchEvent(event);
        };

        tryImportUpgradeEvents().catch(() => {
          safeLogger.warn(
            'Upgrade events module not available, using fallback'
          );
        });
      } else {
        // Use healwave's upgrade modal system
        const event = new CustomEvent('showUpgradeModal', {
          detail: { feature, requiredTier: 'pro' },
        });
        window.dispatchEvent(event);
      }
    },
    [appType]
  );

  const checkUsageLimit = (limitType: string) => {
    if (appType !== 'astro') {
      // Only astro has usage limits currently
      return { allowed: true, current: 0, limit: 0 };
    }

    const limits = {
      chartsPerMonth: subscription?.tier === 'free' ? 3 : -1,
      chartStorage: subscription?.tier === 'free' ? 5 : -1,
    };

    const limit = limits[limitType as keyof typeof limits];
    if (limit === -1) return { allowed: true, current: 0, limit: 0 };

    const current =
      limitType === 'chartsPerMonth'
        ? usageData.chartsThisMonth
        : usageData.savedCharts;
    return { allowed: current < limit, current, limit };
  };

  // Refresh when user or manager becomes available.
  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  const value: SubscriptionContextType = {
    subscription,
    userTier: subscription?.tier ?? 'free',
    tier: subscription?.tier ?? 'free', // Alias for backwards compatibility
    isLoading: isLoading === true || subscriptionManager === null,
    hasFeature,
    upgradeRequired,
    refreshSubscription,
    ...(appType === 'astro' && { checkUsageLimit }),
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionState => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscription must be used within a SubscriptionProvider'
    );
  }
  return context;
};

// Helper function for mock data
function getMockSubscription(email: string, _appType: 'astro' | 'healwave') {
  // appType reserved for future branching
  void _appType; // reference param to avoid unused warning
  const baseData = {
    subscription: {
      status: 'active' as const,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    usage: { chartsThisMonth: 0, savedCharts: 0 },
  };

  if (email === 'free@cosmichub.test') {
    return {
      subscription: { ...baseData.subscription, tier: 'free' },
      usage: { chartsThisMonth: 2, savedCharts: 1 },
    };
  } else if (email === 'premium@cosmichub.test') {
    return {
      subscription: { ...baseData.subscription, tier: 'premium' },
      usage: { chartsThisMonth: 15, savedCharts: 25 },
    };
  } else if (email === 'elite@cosmichub.test') {
    return {
      subscription: { ...baseData.subscription, tier: 'elite' },
      usage: { chartsThisMonth: 50, savedCharts: 100 },
    };
  }

  return baseData;
}

// --- Helpers / Type Guards ---
function isSubscriptionManager(
  value: unknown
): value is SubscriptionManagerLike {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.loadUserSubscription === 'function' &&
    typeof v.getCurrentSubscription === 'function' &&
    typeof v.checkFeatureAccess === 'function'
  );
}

function normalizeSubscription(sub: unknown): BasicSubscription | null {
  if (sub === null || typeof sub !== 'object') return null;
  const s = sub as Record<string, unknown>;
  const tier = typeof s.tier === 'string' ? s.tier : 'free';
  const status = typeof s.status === 'string' ? s.status : 'inactive';
  let currentPeriodEnd: Date | undefined;
  if (s.currentPeriodEnd instanceof Date) currentPeriodEnd = s.currentPeriodEnd;
  else if (typeof s.currentPeriodEnd === 'string') {
    const d = new Date(s.currentPeriodEnd);
    if (!Number.isNaN(d.getTime())) currentPeriodEnd = d;
  }
  return { tier, status, currentPeriodEnd };
}

interface AstroUsageShape {
  chartsThisMonth: number;
  savedCharts: number;
}
function isAstroUsage(value: unknown): value is AstroUsageShape {
  if (value === null || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.chartsThisMonth === 'number' && typeof v.savedCharts === 'number'
  );
}
