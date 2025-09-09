import React, { useState, useCallback } from 'react';
import { useAuth } from '@cosmichub/auth';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { getStripeService, StripeSession } from '@cosmichub/integrations';
import { ErrorBoundary } from '@cosmichub/ui';

const Subscribe: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { goToHome } = useAppNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = useCallback(async (): Promise<void> => {
    if (!user) {
      alert('Please sign in to subscribe to HealWave Pro');
      goToHome(); // Navigate to home page where login modal can be opened
      return;
    }

    setIsLoading(true);
    try {
      const stripeService = getStripeService();
      if (!stripeService) {
        throw new Error('Stripe service is not available');
      }
      // Create Stripe checkout session for HealWave Pro
      const successUrl = `${window.location.origin}/pricing/success?tier=premium`;
      const cancelUrl = `${window.location.origin}/pricing/cancel`;

      const session: StripeSession = await stripeService.createCheckoutSession({
        tier: 'premium', // HealWave Pro tier
        userId: user.uid,
        isAnnual: true, // Default to annual pricing
        successUrl,
        cancelUrl,
      });

      if (session.url) {
        // Update user subscription in Firestore before redirect
        await stripeService.updateUserSubscription(user.uid, 'premium', true);

        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch {
      alert(
        'An error occurred while setting up your subscription. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user, goToHome]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void handleSubscribe();
    }
  }, [handleSubscribe]);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-teal-800'>
      <div className='w-full max-w-md p-8 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-3xl border-white/20'>
        <div className='mb-8 text-center'>
          <h2 className='mb-2 text-2xl font-bold text-white'>
            Subscribe to HealWave Pro
          </h2>
          <p className='text-gray-300'>
            Unlock premium features for an enhanced healing experience.
          </p>
        </div>
        <button
          onClick={() => {
            void handleSubscribe();
          }}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className='w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
          aria-label='Subscribe to HealWave Pro'
        >
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <div className='w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin' />
              Processing...
            </div>
          ) : (
            'Subscribe Now'
          )}
        </button>
      </div>
    </div>
  );
});

Subscribe.displayName = 'Subscribe';

// Export with ErrorBoundary wrapper
const SubscribeWithErrorBoundary: React.FC = () => (
  <ErrorBoundary
    fallback={
      <div className='flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-br from-red-900 via-red-800 to-red-700'>
        <div className='w-full max-w-md p-8 border shadow-2xl bg-white/10 backdrop-blur-lg rounded-3xl border-red-400/30'>
          <div className='text-center'>
            <div className='text-4xl mb-4'>⚠️</div>
            <h2 className='mb-2 text-2xl font-bold text-white'>Subscription Error</h2>
            <p className='mb-4 text-red-300'>
              The subscription system encountered an error. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className='w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    }
  >
    <Subscribe />
  </ErrorBoundary>
);

export default SubscribeWithErrorBoundary;
