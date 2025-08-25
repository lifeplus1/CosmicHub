import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, useSubscription } from '@cosmichub/auth';
// stripeService import guarded (module may be optional in some builds)
interface StripeServiceLike {
  handleCheckoutSuccess?: (sessionId: string) => Promise<boolean>;
}
// Provided via global injection when integrations bundle is present; fallback empty object
const injectedStripe: unknown = (globalThis as { stripeService?: unknown })
  .stripeService;
const stripeService: StripeServiceLike =
  injectedStripe !== null &&
  injectedStripe !== undefined &&
  typeof injectedStripe === 'object'
    ? (injectedStripe as StripeServiceLike)
    : {};
import {
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { devConsole } from '../config/environment';

const SubscriptionSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [message, setMessage] = useState('Verifying your subscription...');

  const sessionId = searchParams.get('session_id');
  const tier = searchParams.get('tier') ?? 'premium';

  useEffect(() => {
    const verifySubscription = async (): Promise<void> => {
      if (sessionId === null) {
        setVerificationStatus('error');
        setMessage(
          'Missing session information. Please contact support if you were charged.'
        );
        return;
      }

      if (user === null || user === undefined) {
        setVerificationStatus('error');
        setMessage('Please sign in to complete your subscription setup.');
        return;
      }

      try {
        // Verify the checkout session
        const success =
          typeof stripeService.handleCheckoutSuccess === 'function'
            ? await stripeService.handleCheckoutSuccess(sessionId)
            : false;

        if (success) {
          // Refresh subscription data
          await refreshSubscription();

          setVerificationStatus('success');
          setMessage('Your subscription has been activated successfully!');

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(
            'There was an issue verifying your subscription. Please contact support.'
          );
        }
      } catch (error) {
        devConsole.error('❌ Subscription verification error:', error);
        setVerificationStatus('error');
        setMessage(
          'Failed to verify your subscription. Please contact support if you were charged.'
        );
      }
    };

    void verifySubscription();
  }, [sessionId, user, refreshSubscription, navigate]);

  const handleReturnToDashboard = (): void => {
    navigate('/', { replace: true });
  };

  const handleContactSupport = (): void => {
    // You can implement a support contact method here
    window.open(
      'mailto:support@cosmichub.app?subject=Subscription Issue&body=I need help with my subscription verification.',
      '_blank'
    );
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
        {verificationStatus === 'loading' && (
          <>
            <FaSpinner className='w-16 h-16 text-cosmic-purple mx-auto mb-4 animate-spin' />
            <h1 className='text-2xl font-bold text-cosmic-dark mb-4'>
              Processing Your Subscription
            </h1>
            <p className='text-cosmic-silver mb-6'>{message}</p>
            <div className='bg-cosmic-purple/10 rounded-lg p-4'>
              <p className='text-sm text-cosmic-purple'>
                Please wait while we confirm your payment...
              </p>
            </div>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <FaCheckCircle className='w-16 h-16 text-green-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-cosmic-dark mb-4'>
              Welcome to CosmicHub {tier === 'elite' ? 'Elite' : 'Premium'}!
            </h1>
            <p className='text-cosmic-silver mb-6'>{message}</p>

            <div className='bg-green-50 rounded-lg p-4 mb-6'>
              <h3 className='text-lg font-semibold text-green-800 mb-2'>
                What&apos;s Next?
              </h3>
              <ul className='text-sm text-green-700 space-y-1 text-left'>
                <li>• Access to all premium features</li>
                <li>• Unlimited chart calculations</li>
                <li>• Advanced AI interpretations</li>
                <li>• Priority customer support</li>
                {tier === 'elite' && (
                  <>
                    <li>• Multi-system astrology</li>
                    <li>• Synastry compatibility</li>
                    <li>• Transit analysis</li>
                  </>
                )}
              </ul>
            </div>

            <button
              onClick={handleReturnToDashboard}
              className='w-full cosmic-button mb-4'
            >
              Continue to Dashboard
            </button>

            <p className='text-xs text-cosmic-silver'>
              Redirecting automatically in a few seconds...
            </p>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <FaExclamationTriangle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-cosmic-dark mb-4'>
              Subscription Verification Issue
            </h1>
            <p className='text-cosmic-silver mb-6'>{message}</p>

            <div className='bg-red-50 rounded-lg p-4 mb-6'>
              <p className='text-sm text-red-700'>
                Don&apos;t worry! If your payment went through, we&apos;ll
                activate your subscription shortly. Check your email for a
                receipt, or contact our support team for assistance.
              </p>
            </div>

            <div className='space-y-3'>
              <button
                onClick={handleContactSupport}
                className='w-full bg-cosmic-purple hover:bg-cosmic-purple-dark text-white py-3 px-4 rounded-lg font-semibold transition-colors'
              >
                Contact Support
              </button>

              <button
                onClick={handleReturnToDashboard}
                className='w-full bg-gray-200 hover:bg-gray-300 text-cosmic-dark py-3 px-4 rounded-lg font-semibold transition-colors'
              >
                Return to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
