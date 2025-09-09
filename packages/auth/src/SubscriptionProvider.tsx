import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { z } from 'zod';
import { useAuth } from './index';

// Enhanced logger with structured logging
// Enhanced logger with structured logging
const logger = {
  error: (message: string, context?: Record<string, unknown>) => {
    console.error(`[SubscriptionProvider] ${message}`, context);
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[SubscriptionProvider] ${message}`, context);
  },
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[SubscriptionProvider] ${message}`, context);
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[SubscriptionProvider] ${message}`, context);
    }
  },
};

// Zod schemas for runtime validation
const BasicSubscriptionSchema = z.object({
  tier: z.string().min(1),
  status: z.string().min(1),
  currentPeriodEnd: z.date().optional(),
}).catchall(z.unknown()); // Allow additional properties

const SubscriptionManagerSchema = z.object({
  loadUserSubscription: z.function(),
  getCurrentSubscription: z.function(),
  checkFeatureAccess: z.function(),
});

const AstroUsageSchema = z.object({
  chartsThisMonth: z.number().int().min(0),
  savedCharts: z.number().int().min(0),
});

const SubscriptionStateSchema = z.object({
  userTier: z.string(),
  tier: z.string(),
  isLoading: z.boolean(),
  hasFeature: z.function(),
  upgradeRequired: z.function(),
  refreshSubscription: z.function(),
  checkUsageLimit: z.function().optional(),
});

// Re-export types from integrations package
export type {
  UserSubscription,
  SubscriptionPlan,
} from '@cosmichub/integrations';

// Type-safe interfaces with Zod validation
type BasicSubscription = z.infer<typeof BasicSubscriptionSchema>;
type SubscriptionManagerLike = z.infer<typeof SubscriptionManagerSchema>;
type AstroUsage = z.infer<typeof AstroUsageSchema>;
type SubscriptionState = z.infer<typeof SubscriptionStateSchema>;

// Enhanced error types
class SubscriptionError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

// Loading states with accessibility
type LoadingState = 'idle' | 'loading' | 'success' | 'error' | 'timeout';

interface SubscriptionProviderState {
  subscription: BasicSubscription | null;
  loadingState: LoadingState;
  error: SubscriptionError | null;
  usageData: AstroUsage;
  retryCount: number;
}

const SubscriptionContext = createContext<SubscriptionState | undefined>(
  undefined
);

// Constants for configuration
const SUBSCRIPTION_LOAD_TIMEOUT = 10000; // 10 seconds
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Error boundary component for subscription errors
interface SubscriptionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const SubscriptionErrorBoundary: React.FC<SubscriptionErrorBoundaryProps> = ({
  children,
  fallback,
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && typeof event.error === 'object' && 'name' in event.error && (event.error as Error).name === 'SubscriptionError') {
        setError(event.error as Error);
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError && error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div
        role="alert"
        aria-live="assertive"
        className="p-4 bg-red-50 border border-red-200 rounded-md"
      >
        <h3 className="text-sm font-medium text-red-800">
          Subscription Error
        </h3>
        <p className="mt-2 text-sm text-red-700">
          {error.message}
        </p>
        <button
          onClick={() => {
            setHasError(false);
            setError(null);
            window.location.reload();
          }}
          className="mt-3 px-3 py-2 text-sm font-medium text-red-800 bg-red-100 hover:bg-red-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

interface SubscriptionProviderProps {
  children: ReactNode;
  appType: 'astro' | 'healwave';
  enableErrorBoundary?: boolean;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = React.memo(({
  children,
  appType,
  enableErrorBoundary = true,
}) => {
  const { user } = useAuth();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const [state, setState] = useState<SubscriptionProviderState>({
    subscription: null,
    loadingState: 'idle',
    error: null,
    usageData: { chartsThisMonth: 0, savedCharts: 0 },
    retryCount: 0,
  });

  // Subscription manager with validation
  const [subscriptionManager, setSubscriptionManager] = useState<SubscriptionManagerLike | null>(null);
  const [managerLoadState, setManagerLoadState] = useState<LoadingState>('idle');

  // Enhanced subscription manager loading with timeout and retry
  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;

    const loadSubscriptionManager = async (): Promise<void> => {
      if (cancelled) return;

      setManagerLoadState('loading');

      try {
        // Create timeout promise
        const _timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new SubscriptionError(
              'Subscription manager load timeout',
              'LOAD_TIMEOUT',
              { timeout: SUBSCRIPTION_LOAD_TIMEOUT }
            ));
          }, SUBSCRIPTION_LOAD_TIMEOUT);
        });

        // Load module with timeout
        const loadPromise = import('@cosmichub/integrations');

        const mod = await Promise.race([loadPromise, _timeoutPromise]);

        if (cancelled) return;

        // Clear timeout on success
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const candidate = (mod as { subscriptionManager?: unknown }).subscriptionManager ?? (mod as { default?: unknown }).default;

        // Validate with Zod
        const validationResult = SubscriptionManagerSchema.safeParse(candidate);

        if (!validationResult.success) {
          throw new SubscriptionError(
            'Invalid subscription manager interface',
            'INVALID_INTERFACE',
            { errors: validationResult.error.issues }
          );
        }

        setSubscriptionManager(validationResult.data);
        setManagerLoadState('success');

        logger.info('Subscription manager loaded successfully', {
          appType,
          hasLoadUserSubscription: typeof validationResult.data.loadUserSubscription === 'function',
          hasGetCurrentSubscription: typeof validationResult.data.getCurrentSubscription === 'function',
          hasCheckFeatureAccess: typeof validationResult.data.checkFeatureAccess === 'function',
        });

      } catch (error) {
        if (cancelled) return;

        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const subscriptionError = error instanceof SubscriptionError
          ? error
          : new SubscriptionError(
              'Failed to load subscription manager',
              'LOAD_FAILED',
              { originalError: error }
            );

        logger.error(subscriptionError.message, subscriptionError.context);

        // Retry logic
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          retryCount++;
          logger.info(`Retrying subscription manager load (attempt ${retryCount})`);

          retryTimeoutRef.current = setTimeout(() => {
            if (!cancelled) {
              void loadSubscriptionManager();
            }
          }, RETRY_DELAY_MS * retryCount);

          return;
        }

        // Final failure - set fallback state
        setManagerLoadState('error');
        setState(prev => ({
          ...prev,
          loadingState: 'error',
          error: subscriptionError,
        }));
      }
    };

    void loadSubscriptionManager();

    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Enhanced refresh subscription with proper error handling
  const refreshSubscription = useCallback(async (): Promise<void> => {
    if (!user) {
      setState(prev => ({
        ...prev,
        subscription: null,
        loadingState: 'success',
        error: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, loadingState: 'loading', error: null }));

    try {
      // If manager failed to load, use fallback
      if (managerLoadState === 'error' || !subscriptionManager) {
        logger.warn('Using fallback subscription due to manager load failure');
        const fallbackSubscription = getFallbackSubscription(user, appType);
        setState(prev => ({
          ...prev,
          subscription: fallbackSubscription,
          loadingState: 'success',
        }));
        return;
      }

      const email = typeof (user as { email?: unknown }).email === 'string'
        ? (user as { email: string }).email
        : '';

      // Handle test/mock users
      if (email.includes('test') || email.includes('cosmichub.test')) {
        const mockData = getValidatedMockSubscription(email, appType);
        setState(prev => ({
          ...prev,
          subscription: mockData.subscription,
          usageData: mockData.usage,
          loadingState: 'success',
        }));
        return;
      }

      // Load real subscription
      await (subscriptionManager.loadUserSubscription as (user: unknown) => Promise<void>)(user);
      const currentSub = (subscriptionManager.getCurrentSubscription as () => BasicSubscription | null | undefined)();

      // Validate subscription data
      const validatedSubscription = currentSub
        ? BasicSubscriptionSchema.parse(currentSub)
        : null;

      setState(prev => ({
        ...prev,
        subscription: validatedSubscription,
        loadingState: 'success',
      }));

      // Load usage data for astro
      if (appType === 'astro') {
        await loadUsageData(user, appType);
      }

    } catch (error) {
      const subscriptionError = error instanceof SubscriptionError
        ? error
        : new SubscriptionError(
            'Failed to refresh subscription',
            'REFRESH_FAILED',
            { originalError: error }
          );

      logger.error(subscriptionError.message, subscriptionError.context);

      // Fallback to free tier on error
      const fallbackSubscription = getFallbackSubscription(user, appType);
      setState(prev => ({
        ...prev,
        subscription: fallbackSubscription,
        loadingState: 'error',
        error: subscriptionError,
      }));
    }
  }, [user, subscriptionManager, managerLoadState, appType]);

  // Load usage data with validation
  const loadUsageData = useCallback(async (user: unknown, appType: 'astro' | 'healwave'): Promise<void> => {
    if (appType !== 'astro') return;

    try {
      const token = await (user as { getIdToken: () => Promise<string> }).getIdToken();
      const response = await fetch('/api/astro/usage', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new SubscriptionError(
          'Failed to fetch usage data',
          'USAGE_FETCH_FAILED',
          { status: response.status }
        );
      }

      const data = await response.json() as unknown;
      const validatedUsage = AstroUsageSchema.parse(data);

      setState(prev => ({
        ...prev,
        usageData: validatedUsage,
      }));

    } catch (error) {
      logger.warn('Failed to load usage data, using defaults', { error });
      // Keep default usage data on error
    }
  }, []);

  // Feature access checking with validation
  const hasFeature = useCallback(
    (feature: string, app?: 'astro' | 'healwave'): boolean => {
      if (!subscriptionManager || managerLoadState !== 'success') {
        // Fallback logic for when manager isn't available
        return getFallbackFeatureAccess(feature, app ?? appType, state.subscription);
      }

      try {
        const targetApp = app ?? appType;
        const accessResult = (subscriptionManager as unknown as { checkFeatureAccess: (feature: string, app: 'astro' | 'healwave') => { canAccess: boolean } }).checkFeatureAccess(feature, targetApp);
        return accessResult.canAccess;
      } catch (error) {
        logger.warn('Feature access check failed, using fallback', { feature, error });
        return getFallbackFeatureAccess(feature, app ?? appType, state.subscription);
      }
    },
    [subscriptionManager, managerLoadState, appType, state.subscription]
  );

  // Upgrade required with enhanced error handling
  const upgradeRequired = useCallback(
    (feature: string) => {
      logger.info('Upgrade required triggered', { feature, appType });

      if (appType === 'astro') {
        triggerAstroUpgrade(feature);
      } else {
        triggerHealwaveUpgrade(feature);
      }
    },
    [appType]
  );

  // Usage limit checking with validation
  const checkUsageLimit = useCallback((limitType: string) => {
    if (appType !== 'astro') {
      return { allowed: true, current: 0, limit: 0 };
    }

    const limits: Record<string, number> = {
      chartsPerMonth: state.subscription?.tier === 'free' ? 3 : -1,
      chartStorage: state.subscription?.tier === 'free' ? 5 : -1,
    };

    const limit = limits[limitType];
    if (limit === undefined || limit === -1) return { allowed: true, current: 0, limit: 0 };

    const current = limitType === 'chartsPerMonth'
      ? state.usageData.chartsThisMonth
      : state.usageData.savedCharts;

    return {
      allowed: current < limit,
      current,
      limit
    };
  }, [appType, state.subscription, state.usageData]);

  // Refresh when dependencies change
  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  // Memoized context value with validation
  const contextValue = useMemo<SubscriptionState>(() => {
    const baseValue = {
      subscription: state.subscription,
      userTier: state.subscription?.tier ?? 'free',
      tier: state.subscription?.tier ?? 'free',
      isLoading: state.loadingState === 'loading' || managerLoadState === 'loading',
      hasFeature,
      upgradeRequired,
      refreshSubscription,
      ...(appType === 'astro' && { checkUsageLimit }),
    };

    // Validate context value in development
    if (process.env.NODE_ENV === 'development') {
      const validation = SubscriptionStateSchema.safeParse(baseValue);
      if (!validation.success) {
        logger.error('Invalid context value', { errors: validation.error.issues });
      }
    }

    return baseValue;
  }, [
    state.subscription,
    state.loadingState,
    managerLoadState,
    hasFeature,
    upgradeRequired,
    refreshSubscription,
    appType,
    checkUsageLimit,
  ]);

  const providerContent = (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );

  // Wrap with error boundary if enabled
  if (enableErrorBoundary) {
    return (
      <SubscriptionErrorBoundary>
        {providerContent}
      </SubscriptionErrorBoundary>
    );
  }

  return providerContent;
});

SubscriptionProvider.displayName = 'SubscriptionProvider';

// Enhanced hook with error handling
export const useSubscription = (): SubscriptionState => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new SubscriptionError(
      'useSubscription must be used within a SubscriptionProvider',
      'CONTEXT_MISSING'
    );
  }
  return context;
};

// Helper functions with validation

function getValidatedMockSubscription(email: string, _appType: 'astro' | 'healwave') {
  const baseData = {
    subscription: BasicSubscriptionSchema.parse({
      status: 'active' as const,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      tier: 'free' as const,
    }),
    usage: AstroUsageSchema.parse({ chartsThisMonth: 0, savedCharts: 0 }),
  };

  const tierMap: Record<string, string> = {
    'free@cosmichub.test': 'free',
    'premium@cosmichub.test': 'premium',
    'elite@cosmichub.test': 'elite',
  };

  const tier = tierMap[email] ?? 'free';

  return {
    subscription: { ...baseData.subscription, tier },
    usage: tier === 'free'
      ? { chartsThisMonth: 2, savedCharts: 1 }
      : tier === 'premium'
        ? { chartsThisMonth: 15, savedCharts: 25 }
        : { chartsThisMonth: 50, savedCharts: 100 },
  };
}

function getFallbackSubscription(_user: unknown, appType: 'astro' | 'healwave'): BasicSubscription {
  logger.info('Using fallback subscription', { appType });

  return BasicSubscriptionSchema.parse({
    tier: 'free',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
}

function getFallbackFeatureAccess(
  feature: string,
  _appType: 'astro' | 'healwave',
  subscription: BasicSubscription | null
): boolean {
  // Basic fallback logic - free tier gets limited access
  const freeFeatures = ['basic-charts', 'basic-audio'];
  const isFreeTier = subscription?.tier === 'free';

  if (isFreeTier) {
    return freeFeatures.includes(feature);
  }

  // Premium+ gets access to most features
  return true;
}

function triggerAstroUpgrade(feature: string): void {
  const tryImportUpgradeEvents = async () => {
    const possiblePaths = [
      '../../../apps/astro/src/utils/upgradeEvents',
      '../../apps/astro/src/utils/upgradeEvents',
    ];

    for (const path of possiblePaths) {
      try {
        const mod = await import(/* @vite-ignore */ path) as { upgradeEventManager?: { triggerUpgradeRequired?: (f: string) => void } };
        const manager = mod?.upgradeEventManager;
        if (typeof manager?.triggerUpgradeRequired === 'function') {
          manager.triggerUpgradeRequired(feature);
          return;
        }
      } catch {
        // Continue to next path
      }
    }

    // Fallback to custom event
    const event = new CustomEvent('showUpgradeModal', {
      detail: { feature, requiredTier: 'premium' },
    });
    window.dispatchEvent(event);
  };

  tryImportUpgradeEvents().catch(() => {
    logger.warn('Upgrade events module not available, using fallback');
  });
}

function triggerHealwaveUpgrade(feature: string): void {
  const event = new CustomEvent('showUpgradeModal', {
    detail: { feature, requiredTier: 'pro' },
  });
  window.dispatchEvent(event);
}

// Type guards with Zod validation - kept for future use
// function _isSubscriptionManager(value: unknown): value is SubscriptionManagerLike {
//   return SubscriptionManagerSchema.safeParse(value).success;
// }

// function _normalizeSubscription(sub: unknown): BasicSubscription | null {
//   if (sub === null || typeof sub !== 'object') return null;

//   try {
//     return BasicSubscriptionSchema.parse(sub);
//   } catch (error) {
//     logger.warn('Failed to normalize subscription', { error, sub });
//     return null;
//   }
// }

// function _isAstroUsage(value: unknown): value is AstroUsage {
//   return AstroUsageSchema.safeParse(value).success;
// }
