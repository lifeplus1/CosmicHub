import {
  getUserTier,
  hasFeatureAccess,
  type UserSubscription,
} from './subscription-utils';

// Lightweight self-contained test harness (no external globals) purely for type-check validation
(() => {
  const TIERS = { free: {}, premium: {}, elite: {} } as const;

  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(msg);
  };

  // returns free for null subscription
  assert(getUserTier(null) === 'free', 'null subscription should yield free');

  // returns actual tier when active
  const active: UserSubscription = {
    tier: 'premium',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 3600_000),
  };
  assert(
    getUserTier(active) === 'premium',
    'active premium should yield premium'
  );

  // falls back to free when not active
  const canceled: UserSubscription = {
    tier: 'elite',
    status: 'canceled',
    currentPeriodEnd: new Date(),
  };
  assert(getUserTier(canceled) === 'free', 'canceled elite should yield free');

  // feature access ordering
  assert(hasFeatureAccess('free', 'free', TIERS) === true, 'free >= free');
  assert(
    hasFeatureAccess('premium', 'free', TIERS) === true,
    'premium >= free'
  );
  assert(
    hasFeatureAccess('premium', 'elite', TIERS) === false,
    'premium < elite'
  );
  assert(
    hasFeatureAccess('elite', 'premium', TIERS) === true,
    'elite >= premium'
  );
})();
