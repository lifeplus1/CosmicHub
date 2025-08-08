import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight, Home, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

interface SubscriptionDetails {
  tier: string;
  status: string;
  features: string[];
  expires_at: string;
}

export const SubscriptionSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refreshSubscription } = useSubscription();
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (user && sessionId) {
      verifySubscription();
    } else if (!sessionId) {
      setLoading(false);
    }
  }, [user, sessionId]);

  const verifySubscription = async () => {
    try {
      const token = await user?.getIdToken();
      
      // Verify the Stripe session and get updated subscription
      const response = await fetch('/api/stripe/subscription-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const details = await response.json();
        setSubscriptionDetails(details);
        
        // Refresh the subscription context
        await refreshSubscription();
        
        toast.success('Subscription activated successfully!');
      } else {
        throw new Error('Failed to verify subscription');
      }
    } catch (error) {
      console.error('Subscription verification failed:', error);
      toast.error('Unable to verify subscription. Please contact support if issues persist.');
    } finally {
      setLoading(false);
    }
  };

  const getTierDisplayName = (tier: string) => {
    const tierNames: Record<string, string> = {
      'healwave_pro': 'HealWave Pro',
      'astro_premium': 'Astrology Premium',
      'cosmic_master': 'Cosmic Master'
    };
    return tierNames[tier] || tier;
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      'healwave_pro': 'bg-blue-500',
      'astro_premium': 'bg-purple-500',
      'cosmic_master': 'bg-gold-500'
    };
    return colors[tier] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This page can only be accessed after a successful subscription purchase.
            </p>
            <Button asChild>
              <Link to="/pricing">
                <CreditCard className="w-4 h-4 mr-2" />
                View Pricing Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to the Cosmic Family! 🌟
            </h1>
            <p className="text-lg text-gray-600">
              Your subscription has been activated successfully
            </p>
          </div>

          {/* Subscription Details Card */}
          {subscriptionDetails && (
            <Card className="mb-8 border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6" />
                    <CardTitle className="text-xl">
                      {getTierDisplayName(subscriptionDetails.tier)}
                    </CardTitle>
                  </div>
                  <Badge 
                    className={`${getTierColor(subscriptionDetails.tier)} text-white`}
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Your Premium Features:
                    </h3>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {subscriptionDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
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
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-500" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Button asChild variant="default" className="h-auto p-4">
                  <Link to="/" className="flex flex-col items-center gap-2">
                    <Home className="w-6 h-6" />
                    <span className="font-semibold">Explore Your Dashboard</span>
                    <span className="text-xs opacity-80">Start using your premium features</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link to="/account/subscription" className="flex flex-col items-center gap-2">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-semibold">Manage Subscription</span>
                    <span className="text-xs opacity-80">Update billing & preferences</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you make the most of your subscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/help">
                  View Help Center
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:support@cosmichub.app">
                  Contact Support
                </a>
              </Button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
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
