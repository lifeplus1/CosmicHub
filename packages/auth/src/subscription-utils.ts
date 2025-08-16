export interface UserSubscription {
  tier: 'free' | 'premium' | 'elite';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date;
  customerId?: string;
  subscriptionId?: string;
}

export const getUserTier = (subscription: UserSubscription | null): string => {
  return subscription?.status === 'active' ? subscription.tier : 'free';
};

export const hasFeatureAccess = (userTier: string, requiredTier: string, tiers: Record<string, any>): boolean => {
  const tierOrder = Object.keys(tiers);
  const userIndex = tierOrder.indexOf(userTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  return userIndex >= requiredIndex;
};

// Astro app tier configuration
// DEPRECATED local tier constants removed – use centralized subscriptions package instead.
export { COSMICHUB_TIERS as ASTRO_TIERS, HEALWAVE_TIERS } from '@cosmichub/subscriptions';
