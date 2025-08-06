import React from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { cn, badgeVariants, buttonVariants } from '../shared/utils';

export const PremiumFeaturesDashboard: React.FC = () => {
  const { userTier } = useSubscription();
  const navigate = useNavigate();
  
  if (userTier === 'elite') return null; // Elite users don't need to see this

  return (
    <div className="flex flex-row items-center justify-between bg-purple-500/10 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-4 max-w-2xl w-full mx-auto mb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/80 font-medium">
          {userTier === 'premium' ? '🌟 Premium User' : '✨ Unlock Premium'}
        </span>
        <span className={cn(badgeVariants({ variant: 'purple' }), "text-xs")}>
          {userTier === 'premium' ? 'Active' : 'Available'}
        </span>
      </div>
      
      {userTier !== 'premium' && (
        <button
          className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 
            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          )}
          onClick={() => navigate('/premium')}
        >
          Upgrade
        </button>
      )}
    </div>
  );
};
