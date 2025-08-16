import React, { useCallback, useEffect } from 'react';
import { UpgradeModal } from '@cosmichub/ui';
import { useUpgradeModal } from '../contexts/UpgradeModalContext';
import { useSubscription } from '@cosmichub/auth';
import { useAuth } from '@cosmichub/auth';
import { stripeService, StripeSession } from '@cosmichub/integrations';
import { upgradeEventManager } from '../utils/upgradeEvents';
import { useToast } from './ToastProvider';

/**
 * Centralized component that manages the upgrade modal display and upgrade logic
 */
export const UpgradeModalManager: React.FC = () => {
  const { isOpen, feature, openUpgradeModal, closeUpgradeModal } = useUpgradeModal();
  const { userTier } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();

  // Listen for upgrade required events
  useEffect(() => {
    const unsubscribe = upgradeEventManager.subscribe((event) => {
      openUpgradeModal(event.feature);
    });

    return unsubscribe;
  }, [openUpgradeModal]);

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
        feature,
        metadata: {
          sourceComponent: 'UpgradeModalManager',
          originalTier: userTier
        }
      });

      // Update user subscription in Firestore
      await stripeService.updateUserSubscription(user.uid, stripeTier, true);
      
      // Close modal after successful initiation
      closeUpgradeModal();
    } catch (error) {
      console.error('Upgrade process failed:', error);
      
      // Show error notification to user
      toast({
        title: 'Upgrade Failed',
        description: 'We encountered an issue while processing your upgrade. Please try again or contact support if the problem persists.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      
      closeUpgradeModal();
    }
  }, [user, userTier, feature, closeUpgradeModal]);

  return (
    <UpgradeModal
      isOpen={isOpen}
      onClose={closeUpgradeModal}
      feature={feature}
      currentTier={userTier as 'Free' | 'Basic' | 'Pro' | 'Enterprise'}
      onUpgrade={handleUpgrade}
    />
  );
};

export default UpgradeModalManager;
