import React from 'react';
import { useSubscription } from '@cosmichub/auth';
import { useNavigate } from 'react-router-dom';

export const PremiumFeaturesDashboard: React.FC = () => {
  const { userTier } = useSubscription();
  const navigate = useNavigate();

  if (userTier === 'elite') return null; // Elite users don't need to see this

  return (
    <div className='flex flex-row items-center justify-between bg-purple-500/10 backdrop-blur-xl border border-purple-400 rounded-2xl p-4 max-w-2xl w-full mx-auto mb-4'>
      <div className='flex items-center gap-3'>
        <span className='text-sm text-white/80 font-medium'>
          {userTier === 'premium' ? '🌟 Premium User' : '✨ Unlock Premium'}
        </span>
        <span className='text-xs bg-purple-500 text-white px-2 py-1 rounded-full'>
          {userTier === 'premium' ? 'Active' : 'Available'}
        </span>
      </div>

      {userTier !== 'premium' && (
        <button
          className='bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-lg transition-colors'
          onClick={() => navigate('/upgrade-demo')}
        >
          Upgrade
        </button>
      )}
    </div>
  );
};
