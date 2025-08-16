import React from 'react';
import { useSubscription } from '@cosmichub/auth';
import { FaStar, FaCheck } from 'react-icons/fa';
import { COSMICHUB_TIERS } from '@cosmichub/subscriptions';

export const SubscriptionStatus: React.FC = React.memo(() => {
  const { userTier, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="bg-cosmic-blue/30 rounded-xl px-4 py-2 border border-cosmic-silver/20 max-w-[320px]">
        <p className="text-sm text-cosmic-silver">Loading subscription...</p>
      </div>
    );
  }

  const tierInfo = COSMICHUB_TIERS[userTier];
  const isElite = userTier === 'elite';
  const isPremium = userTier === 'premium';

  return (
    <div className="bg-cosmic-blue/30 rounded-xl px-4 py-2 border border-cosmic-silver/20 max-w-[320px]">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2">
          {isElite ? <FaStar className="text-gold-400" /> : <FaCheck className="text-cosmic-purple" />}
          <p className="text-sm font-semibold text-cosmic-silver">{tierInfo.name}</p>
        </div>
        <span className="px-2 py-1 text-xs uppercase rounded bg-cosmic-purple/20 text-cosmic-purple">
          {userTier.toUpperCase()}
        </span>
      </div>
    </div>
  );
});

SubscriptionStatus.displayName = 'SubscriptionStatus';

export default SubscriptionStatus;