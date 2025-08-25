import React, { useState } from 'react';
import { useAuth } from '@cosmichub/auth';
import { useNavigate } from 'react-router-dom';
import { getStripeServiceOrThrow, StripeSession } from '@cosmichub/integrations';


const Subscribe: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (): Promise<void> => {
    if (!user) {
      alert('Please sign in to subscribe to HealWave Pro');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const stripeService = getStripeServiceOrThrow();
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
  };

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
          disabled={isLoading}
          className='w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:transform-none'
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
};

export default Subscribe;
