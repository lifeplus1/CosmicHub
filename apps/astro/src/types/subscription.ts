/**
 * DEPRECATED local subscription types (migrated to @cosmichub/config)
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
  type AstroSubscriptionTier as SubscriptionTier,
} from '@cosmichub/config';
