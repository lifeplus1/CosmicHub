import { useState, useCallback } from 'react';
import { useSubscription } from '@cosmichub/auth';

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

  const openUpgradeModal = useCallback((feature?: string) => {
    setRequiredFeature(feature);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setRequiredFeature(undefined);
  }, []);

  const handleUpgrade = useCallback(async (tier: 'Basic' | 'Pro' | 'Enterprise') => {
    try {
      // TODO: Integrate with Stripe Checkout
      console.log(`Upgrading to ${tier} from ${userTier}`);
      
      // For now, redirect to pricing page with preselected tier
      const pricingUrl = new URL('/pricing', window.location.origin);
      pricingUrl.searchParams.set('tier', tier);
      if (requiredFeature) {
        pricingUrl.searchParams.set('feature', requiredFeature);
      }
      
      window.location.href = pricingUrl.toString();
    } catch (error) {
      console.error('Upgrade failed:', error);
      // TODO: Show error notification
    }
  }, [userTier, requiredFeature]);

  return {
    isUpgradeModalOpen,
    requiredFeature,
    openUpgradeModal,
    closeUpgradeModal,
    handleUpgrade
  };
};
