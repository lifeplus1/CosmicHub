import { useState, useCallback } from 'react';
import { useSubscription, useAuth } from '@cosmichub/auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { stripeService, type StripeSession } from '@cosmichub/integrations';

export interface UseUpgradeModalReturn {
  isUpgradeModalOpen: boolean;
  requiredFeature: string | undefined;
  openUpgradeModal: (feature?: string) => void;
  closeUpgradeModal: () => void;
  handleUpgrade: (tier: 'Basic' | 'Pro' | 'Enterprise') => Promise<void>;
}

/**
 * Hook for managing upgrade modal state and subscription upgrades
 */
interface UpgradeModalOptions {
  onError?: (message: string, error?: unknown) => void;
  onSuccess?: (tier: string) => void;
}

export const useUpgradeModal = (options: UpgradeModalOptions = {}): UseUpgradeModalReturn => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [requiredFeature, setRequiredFeature] = useState<string | undefined>();
  const { userTier } = useSubscription();
  const { user } = useAuth();

  const openUpgradeModal = useCallback((feature?: string) => {
    setRequiredFeature(feature);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setRequiredFeature(undefined);
  }, []);

  const handleUpgrade = useCallback(async (tier: 'Basic' | 'Pro' | 'Enterprise') => {
    if (!user) {
      options.onError?.('User not authenticated');
      closeUpgradeModal();
      return;
    }
    if (!stripeService) {
      options.onError?.('Stripe service not available');
      closeUpgradeModal();
      return;
    }
    try {
      const stripeTier = tier === 'Basic' ? 'premium' : tier === 'Pro' ? 'premium' : 'elite';
      const successUrl = `${window.location.origin}/pricing/success?tier=${stripeTier}`;
      const cancelUrl = `${window.location.origin}/pricing/cancel`;
      await stripeService.createCheckoutSession({
        tier: stripeTier,
        userId: user.uid,
        isAnnual: true,
        successUrl,
        cancelUrl,
        feature: requiredFeature,
        metadata: { sourceComponent: 'useUpgradeModal', originalTier: userTier }
      });
      await stripeService.updateUserSubscription(user.uid, stripeTier, true);
      options.onSuccess?.(stripeTier);
    } catch (err) {
      options.onError?.('Upgrade failed', err);
      closeUpgradeModal();
    }
  }, [user, userTier, requiredFeature, closeUpgradeModal, options]);

  return {
    isUpgradeModalOpen,
    requiredFeature,
    openUpgradeModal,
    closeUpgradeModal,
    handleUpgrade
  };
};
