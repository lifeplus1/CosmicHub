import React, { useEffect, useState, useMemo, type JSX as JSXNamespace } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaCrown, FaArrowRight, FaHome, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { useAuth, useSubscription } from '@cosmichub/auth';
import { useToast } from '../components/ToastProvider';

interface SubscriptionDetails {
  tier: string;
  status: string;
  features: string[];
  expires_at: string;
}

export const SubscriptionSuccessPage: React.FC = (): JSXNamespace.Element => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const subscriptionData = useSubscription();
  const { toast } = useToast();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const refreshSubscription: () => Promise<unknown> = useMemo((): (() => Promise<unknown>) => {
    return typeof subscriptionData?.refreshSubscription === 'function'
      ? subscriptionData.refreshSubscription
      : () => Promise.resolve();
  }, [subscriptionData]);

  useEffect((): void => {
    const hasSession = typeof sessionId === 'string' && sessionId.length > 0;
    if (!(user && hasSession)) {
      if (!hasSession) setLoading(false);
      return;
    }
  void (async (): Promise<void> => {
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/stripe/subscription-status', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  if (response.ok) {
          const details = (await response.json()) as SubscriptionDetails;
          setSubscriptionDetails(details);
          await refreshSubscription();
          toast({
            title: 'Success',
            description: 'Subscription activated successfully!',
            status: 'success',
            duration: 3000,
            isClosable: true
          });
        } else {
          throw new Error('Failed to verify subscription');
        }
      } catch {
        toast({
          title: 'Error',
            description: 'Unable to verify subscription. Please contact support if issues persist.',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, sessionId, refreshSubscription, toast]);

  const getTierDisplayName = (tier: string): string => {
    const tierNames: Record<string, string> = {
      'healwave_pro': 'HealWave Pro',
      'astro_premium': 'Astrology Premium',
      'cosmic_master': 'Cosmic Master'
    };
    return tierNames[tier] || tier;
  };

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      'healwave_pro': 'bg-blue-500',
      'astro_premium': 'bg-purple-500',
      'cosmic_master': 'bg-gold-500'
    };
    return colors[tier] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 mx-auto mb-4 text-green-500 animate-spin" />
          <p className="text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (!(typeof sessionId === 'string' && sessionId.length > 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-bold text-red-600">Invalid Access</h2>
          </div>
          <div className="space-y-4 text-center">
            <p className="text-gray-600">
              This page can only be accessed after a successful subscription purchase.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center w-full px-4 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FaCreditCard className="w-4 h-4 mr-2" />
              View Pricing Plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container px-4 py-12 mx-auto">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-green-100 rounded-full">
              <FaCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Welcome to the Cosmic Family! 🌟
            </h1>
            <p className="text-lg text-gray-600">
              Your subscription has been activated successfully
            </p>
          </div>

          {/* Subscription Details Card */}
          {subscriptionDetails && (
            <div className="mb-8 bg-white border-2 border-green-200 rounded-lg shadow-lg">
              <div className="p-6 text-white rounded-t-lg bg-gradient-to-r from-green-500 to-blue-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaCrown className="w-6 h-6" />
                    <h2 className="text-xl font-bold">
                      {getTierDisplayName(subscriptionDetails.tier)}
                    </h2>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${getTierColor(subscriptionDetails.tier)} text-white`}>
                    Active
                  </span>
                </div>
              </div>
              
              <div className="p-6 pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-3 font-semibold text-gray-900">
                      Your Premium Features:
                    </h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {subscriptionDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FaCheckCircle className="flex-shrink-0 w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {subscriptionDetails.expires_at && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Next billing date:</strong>{' '}
                        {new Date(subscriptionDetails.expires_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <FaArrowRight className="w-5 h-5 text-blue-500" />
                What&apos;s Next?
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  to="/"
                  className="flex flex-col items-center h-auto gap-2 p-4 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <FaHome className="w-6 h-6" />
                  <span className="font-semibold">Explore Your Dashboard</span>
                  <span className="text-xs opacity-80">Start using your premium features</span>
                </Link>
                
                <Link
                  to="/account/subscription"
                  className="flex flex-col items-center h-auto gap-2 p-4 font-semibold text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <FaCreditCard className="w-6 h-6" />
                  <span className="font-semibold">Manage Subscription</span>
                  <span className="text-xs opacity-80">Update billing & preferences</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Support Information */}
          <div className="p-6 text-center bg-white border rounded-lg shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              Need Help Getting Started?
            </h3>
            <p className="mb-4 text-gray-600">
              Our support team is here to help you make the most of your subscription.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/help"
                className="px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                View Help Center
              </Link>
              <a
                href="mailto:support@cosmichub.app"
                className="px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Contact Support
              </a>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              You will receive a confirmation email with your subscription details shortly.
              <br />
              Thank you for choosing CosmicHub! ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
