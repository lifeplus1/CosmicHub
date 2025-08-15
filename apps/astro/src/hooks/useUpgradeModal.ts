import { useState, useCallback } from 'react';
import { useSubscription } from '@cosmichub/auth';
import { useAuth } from '@cosmichub/auth';
import { stripeService, StripeSession } from '@cosmichub/integrations';

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
export const useUpgradeModal = (): UseUpgradeModalReturn => {
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
      console.error('User not authenticated');
      closeUpgradeModal();
      return;
    }

    if (!stripeService) {
      console.error('Stripe service not available');
      closeUpgradeModal();
      return;
    }

    try {
      // Map UI tier names to Stripe tier names
      const stripeTier = tier === 'Basic' ? 'premium' : tier === 'Pro' ? 'premium' : 'elite';
      
      const successUrl = `${window.location.origin}/pricing/success?tier=${stripeTier}`;
      const cancelUrl = `${window.location.origin}/pricing/cancel`;

      const session: StripeSession = await stripeService.createCheckoutSession({
        tier: stripeTier,
        userId: user.uid,
        isAnnual: true, // Default to annual, can be made configurable
        successUrl,
        cancelUrl,
        feature: requiredFeature,
        metadata: {
          sourceComponent: 'useUpgradeModal',
          originalTier: userTier
        }
      });

      // Update user subscription in Firestore after successful checkout initiation
      await stripeService.updateUserSubscription(user.uid, stripeTier, true);
    } catch (error) {
      console.error('Upgrade failed:', error);
      closeUpgradeModal();
    }
  }, [user, userTier, requiredFeature, closeUpgradeModal]);

  return {
    isUpgradeModalOpen,
    requiredFeature,
    openUpgradeModal,
    closeUpgradeModal,
    handleUpgrade
  };
};
