import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft, FaCreditCard } from 'react-icons/fa';

const SubscriptionCancel: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tier = searchParams.get('tier') ?? 'premium';
  const feature = searchParams.get('feature');

  const handleRetryCheckout = (): void => {
    // Redirect back to pricing page with the same tier pre-selected
    const url = new URL('/pricing', window.location.origin);
    // tier always non-empty due to default above
    url.searchParams.set('tier', tier);
    if (feature !== null && feature !== undefined && feature !== '') {
      url.searchParams.set('feature', feature);
    }
    navigate(`/pricing?${url.searchParams.toString()}`);
  };

  const handleReturnToDashboard = (): void => {
    navigate('/', { replace: true });
  };

  const handleBrowseFeatures = (): void => {
    navigate('/upgrade-demo');
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        <FaTimesCircle className='w-16 h-16 text-orange-500 mx-auto mb-4' />

        <h1 className='text-2xl font-bold text-cosmic-dark mb-4'>
          Subscription Cancelled
        </h1>

        <p className='text-cosmic-silver mb-6'>
          No worries! Your checkout was cancelled and no charges were made to
          your account.
        </p>

        {feature !== null && feature !== undefined && feature !== '' && (
          <div className='bg-blue-50 rounded-lg p-4 mb-6'>
            <p className='text-sm text-blue-700'>
              <span className='font-semibold'>{feature}</span> is still waiting
              for you! You can try upgrading again anytime.
            </p>
          </div>
        )}

        <div className='space-y-4'>
          <button
            onClick={handleRetryCheckout}
            className='w-full cosmic-button flex items-center justify-center space-x-2'
          >
            <FaCreditCard className='w-4 h-4' />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleBrowseFeatures}
            className='w-full bg-cosmic-purple/10 hover:bg-cosmic-purple/20 text-cosmic-purple py-3 px-4 rounded-lg font-semibold transition-colors'
          >
            Browse Premium Features
          </button>

          <button
            onClick={handleReturnToDashboard}
            className='w-full bg-gray-200 hover:bg-gray-300 text-cosmic-dark py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2'
          >
            <FaArrowLeft className='w-4 h-4' />
            <span>Return to Dashboard</span>
          </button>
        </div>

        <div className='mt-8 pt-6 border-t border-gray-200'>
          <h3 className='text-lg font-semibold text-cosmic-dark mb-3'>
            Why Upgrade to CosmicHub {tier === 'elite' ? 'Elite' : 'Premium'}?
          </h3>

          <ul className='text-sm text-cosmic-silver space-y-2 text-left'>
            <li className='flex items-start space-x-2'>
              <span className='text-green-500 mt-0.5'>•</span>
              <span>Unlimited chart calculations</span>
            </li>
            <li className='flex items-start space-x-2'>
              <span className='text-green-500 mt-0.5'>•</span>
              <span>Advanced AI interpretations</span>
            </li>
            <li className='flex items-start space-x-2'>
              <span className='text-green-500 mt-0.5'>•</span>
              <span>Priority customer support</span>
            </li>
            {tier === 'elite' && (
              <>
                <li className='flex items-start space-x-2'>
                  <span className='text-green-500 mt-0.5'>•</span>
                  <span>Multi-system astrology analysis</span>
                </li>
                <li className='flex items-start space-x-2'>
                  <span className='text-green-500 mt-0.5'>•</span>
                  <span>Synastry compatibility reports</span>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <p className='text-xs text-gray-600'>
            Questions about our plans? Contact us at{' '}
            <a
              href='mailto:support@cosmichub.app'
              className='text-cosmic-purple hover:text-cosmic-purple-dark underline'
            >
              support@cosmichub.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancel;
