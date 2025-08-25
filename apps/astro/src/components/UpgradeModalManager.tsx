import React, { useCallback, useEffect } from 'react';
import { UpgradeModal } from '@cosmichub/ui';
import { useUpgradeModal } from '../contexts/UpgradeModalContext';
import { useSubscription, useAuth } from '@cosmichub/auth';
import { getStripeService } from '@cosmichub/integrations';
import { upgradeEventManager } from '../utils/upgradeEvents';
import { useToast } from './ToastProvider';
import { devConsole } from '../config/environment';

/**
 * Centralized component that manages the upgrade modal display and upgrade logic
 */
export const UpgradeModalManager: React.FC = () => {
  const { isOpen, feature, openUpgradeModal, closeUpgradeModal } =
    useUpgradeModal();
  const { userTier } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();

  // Listen for upgrade required events
  useEffect(() => {
    const unsubscribe = upgradeEventManager.subscribe(event => {
      openUpgradeModal(event.feature);
    });

    return unsubscribe;
  }, [openUpgradeModal]);

  const handleUpgrade = useCallback(
    async (tier: 'Basic' | 'Pro' | 'Enterprise') => {
      if (user === null || user === undefined) {
        devConsole.error('User not authenticated');
        closeUpgradeModal();
        return;
      }

      try {
        const stripeService = getStripeService();
        if (!stripeService) {
          throw new Error('Stripe service is not available');
        }
        // Map UI tier names to Stripe tier names
        const stripeTier =
          tier === 'Basic' ? 'premium' : tier === 'Pro' ? 'premium' : 'elite';

        const successUrl = `${window.location.origin}/pricing/success?tier=${stripeTier}`;
        const cancelUrl = `${window.location.origin}/pricing/cancel`;

        await stripeService.createCheckoutSession({
          tier: stripeTier,
          userId: user.uid,
          isAnnual: true, // Default to annual, can be made configurable
          successUrl,
          cancelUrl,
          feature,
          metadata: {
            sourceComponent: 'UpgradeModalManager',
            originalTier: userTier,
          },
        });

        // Update user subscription in Firestore
        await stripeService.updateUserSubscription(user.uid, stripeTier, true);

        // Close modal after successful initiation
        closeUpgradeModal();
      } catch (error) {
        devConsole.error('Upgrade process failed:', error);

        // Show error notification to user
        toast({
          title: 'Upgrade Failed',
          description:
            'We encountered an issue while processing your upgrade. Please try again or contact support if the problem persists.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });

        closeUpgradeModal();
      }
    },
    [user, userTier, feature, closeUpgradeModal, toast]
  );

  return (
    <UpgradeModal
      isOpen={isOpen}
      onClose={closeUpgradeModal}
      feature={feature}
      currentTier={userTier as 'Free' | 'Basic' | 'Pro' | 'Enterprise'}
      onUpgrade={(tier: 'Basic' | 'Pro' | 'Enterprise') => {
        void handleUpgrade(tier);
      }}
    />
  );
};

export default UpgradeModalManager;
