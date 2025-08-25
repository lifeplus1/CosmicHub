import React, { useCallback } from 'react';
import { devConsole } from '../config/environment';
import * as Dialog from '@radix-ui/react-dialog';
import { FaCheck } from 'react-icons/fa';
import { COSMICHUB_TIERS } from '@cosmichub/subscriptions';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  requiredTier: 'premium' | 'elite';
  trigger?: 'usage_limit' | 'feature_access';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = React.memo(
  ({ isOpen, onClose, feature, requiredTier, trigger = 'feature_access' }) => {
    const tier = COSMICHUB_TIERS[requiredTier];
    const tierSafe =
      tier ??
      ({
        name: requiredTier,
        features: [],
        price: { monthly: 0, yearly: 0 },
        description: '',
      } as const);

    const handleUpgrade = useCallback(() => {
      devConsole.log(`Upgrading to ${tierSafe.name}`);
      onClose();
    }, [tierSafe.name, onClose]);

    const getTriggerMessage = () => {
      switch (trigger) {
        case 'usage_limit':
          return "You've reached your usage limit for this month.";
        case 'feature_access':
          return `${feature} requires ${tierSafe.name}.`;
        default:
          return `Upgrade to ${tierSafe.name} to continue.`;
      }
    };

    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm' />
          <Dialog.Content className='fixed w-full max-w-lg p-6 transform -translate-x-1/2 -translate-y-1/2 border rounded-lg top-1/2 left-1/2 bg-cosmic-blue/80 backdrop-blur-md border-cosmic-silver/20'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex flex-col space-y-2'>
                <Dialog.Title className='text-lg font-bold text-cosmic-gold'>
                  Upgrade to {tierSafe.name}
                </Dialog.Title>
                <span className='px-2 py-1 text-sm text-purple-500 rounded bg-purple-500/20'>
                  {tierSafe.price.monthly > 0
                    ? `$${tierSafe.price.monthly}/month`
                    : 'Free'}
                </span>
              </div>
              <Dialog.Close asChild>
                <button
                  className='text-cosmic-silver hover:text-cosmic-gold'
                  aria-label='Close'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </Dialog.Close>
            </div>

            <div className='flex flex-col space-y-4'>
              <div className='flex p-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50'>
                <span className='text-xl text-blue-500'>ℹ️</span>
                <p className='text-cosmic-silver'>{getTriggerMessage()}</p>
              </div>

              <div>
                <p className='mb-2 font-semibold text-purple-600'>
                  {tierSafe.name} includes:
                </p>
                <ul className='space-y-2'>
                  {tierSafe.features
                    .slice(0, 6)
                    .map((feature: string, index: number) => (
                      <li key={index} className='flex items-center space-x-2'>
                        <FaCheck className='text-green-500' />
                        <span className='text-sm text-cosmic-silver'>
                          {feature}
                        </span>
                      </li>
                    ))}
                  {tierSafe.features.length > 6 && (
                    <li className='text-sm italic text-cosmic-silver/60'>
                      + {tierSafe.features.length - 6} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className='flex p-4 space-x-4 border border-green-500 rounded-md bg-green-900/50'>
                <span className='text-xl text-green-500'>✅</span>
                <div className='flex flex-col space-y-1'>
                  <p className='font-semibold text-cosmic-silver'>
                    7-day free trial
                  </p>
                  <p className='text-sm text-cosmic-silver'>
                    Cancel anytime, no commitment
                  </p>
                </div>
              </div>
            </div>

            <div className='flex mt-6 space-x-3'>
              <button
                className='flex-1 bg-transparent border cosmic-button border-cosmic-silver text-cosmic-silver hover:bg-cosmic-silver/10'
                onClick={onClose}
                aria-label='Close Modal'
              >
                Maybe Later
              </button>
              <button
                className='flex-1 cosmic-button'
                onClick={handleUpgrade}
                aria-label='Start Free Trial'
              >
                Start Free Trial
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

UpgradePrompt.displayName = 'UpgradePrompt';

export default UpgradePrompt;
