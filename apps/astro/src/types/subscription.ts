/**
 * DEPRECATED local subscription types (migrated to @cosmichub/subscriptions)
 * This file now re-exports symbols from the centralized package to avoid large diff.
 * Remove after all imports updated.
 */
export {
  COSMICHUB_TIERS,
  FEATURE_TOOLTIPS,
  calculateYearlySavings,
  getUserTier,
  hasFeatureAccess,
  getTierLimits,
  type AstroSubscriptionTier as SubscriptionTier
} from '@cosmichub/subscriptions';

export type SubscriptionTierType = 'free' | 'premium' | 'elite';
export type UsageLimitType = 'chartsPerMonth' | 'chartStorage' | 'synastryAnalyses' | 'aiQueries';
