import {
  getUserTier,
  hasFeatureAccess,
  type UserSubscription,
} from './subscription-utils';

import { describe, it, expect } from 'vitest';

describe('Subscription Utils', () => {
  const TIERS = { free: {}, premium: {}, elite: {} } as const;

  describe('getUserTier', () => {
    it('returns free for null subscription', () => {
      expect(getUserTier(null)).toBe('free');
    });

    it('returns actual tier when active', () => {
      const active: UserSubscription = {
        tier: 'premium',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 3600_000),
      };
      expect(getUserTier(active)).toBe('premium');
    });

    it('falls back to free when not active', () => {
      const canceled: UserSubscription = {
        tier: 'elite',
        status: 'canceled',
        currentPeriodEnd: new Date(),
      };
      expect(getUserTier(canceled)).toBe('free');
    });
  });

  describe('hasFeatureAccess', () => {
    it('handles feature access ordering correctly', () => {
      expect(hasFeatureAccess('free', 'free', TIERS)).toBe(true);
      expect(hasFeatureAccess('premium', 'free', TIERS)).toBe(true);
      expect(hasFeatureAccess('premium', 'elite', TIERS)).toBe(false);
      expect(hasFeatureAccess('elite', 'premium', TIERS)).toBe(true);
    });
  });
});
