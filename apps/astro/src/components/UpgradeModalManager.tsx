import React, { useCallback, useEffect } from 'react';
import { UpgradeModal } from '@cosmichub/ui';
import { useUpgradeModal } from '../contexts/UpgradeModalContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { upgradeEventManager } from '../utils/upgradeEvents';

/**
 * Centralized component that manages the upgrade modal display and upgrade logic
 */
export const UpgradeModalManager: React.FC = () => {
  const { isOpen, feature, openUpgradeModal, closeUpgradeModal } = useUpgradeModal();
  const { userTier } = useSubscription();

  // Listen for upgrade required events
  useEffect(() => {
    const unsubscribe = upgradeEventManager.subscribe((event) => {
      openUpgradeModal(event.feature);
    });

    return unsubscribe;
  }, [openUpgradeModal]);

  const handleUpgrade = useCallback(async (tier: 'Basic' | 'Pro' | 'Enterprise') => {
    try {
      // TODO: Integrate with Stripe Checkout
      console.log(`Initiating upgrade from ${userTier} to ${tier}`);
      
      // For development, redirect to pricing page with preselected tier
      const pricingUrl = new URL('/pricing', window.location.origin);
      pricingUrl.searchParams.set('tier', tier);
      pricingUrl.searchParams.set('upgrade', 'true');
      
      if (feature) {
        pricingUrl.searchParams.set('feature', encodeURIComponent(feature));
      }
      
      // Close modal before redirect
      closeUpgradeModal();
      
      // Small delay to allow modal to close gracefully
      setTimeout(() => {
        window.location.href = pricingUrl.toString();
      }, 300);
      
    } catch (error) {
      console.error('Upgrade process failed:', error);
      // TODO: Show error notification to user
      // For now, we'll log the error and close the modal
      closeUpgradeModal();
    }
  }, [userTier, feature, closeUpgradeModal]);

  return (
    <UpgradeModal
      isOpen={isOpen}
      onClose={closeUpgradeModal}
      feature={feature}
      currentTier={userTier}
      onUpgrade={handleUpgrade}
    />
  );
};

export default UpgradeModalManager;
