import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SubscriptionCancelledPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Cancellation Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
              <XCircle className="w-10 h-10 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscription Cancelled
            </h1>
            <p className="text-lg text-gray-600">
              No worries! Your subscription was not activated.
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="mb-8 border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
              <CardTitle className="text-xl text-center">
                What Happened?
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  You cancelled the subscription process or encountered an issue during payment. 
                  Don't worry - <strong>no charges were made</strong> to your account.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Common reasons for cancellation:
                  </h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Changed your mind about upgrading</li>
                    <li>• Encountered a payment method issue</li>
                    <li>• Browser or network connectivity problems</li>
                    <li>• Wanted to review the features again</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-blue-500" />
                What Would You Like To Do?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Button asChild size="lg" className="h-auto p-6">
                  <Link to="/pricing" className="flex flex-col items-center gap-2">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-semibold">Try Again</span>
                    <span className="text-xs opacity-80">Review plans and subscribe</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="h-auto p-6">
                  <Link to="/" className="flex flex-col items-center gap-2">
                    <ArrowLeft className="w-6 h-6" />
                    <span className="font-semibold">Continue Free</span>
                    <span className="text-xs opacity-80">Use CosmicHub with free features</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Free Features Reminder */}
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">
                🌟 You Can Still Enjoy CosmicHub for Free!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-green-700 space-y-2">
                <p className="font-medium">Our free tier includes:</p>
                <ul className="space-y-1 text-sm ml-4">
                  <li>• Basic astrology chart generation</li>
                  <li>• Essential healing frequencies</li>
                  <li>• Limited daily sessions</li>
                  <li>• Community access and support</li>
                  <li>• Core personality insights</li>
                </ul>
                <p className="text-sm pt-2">
                  Upgrade anytime to unlock premium features and unlimited access.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-2">
              Need Help or Have Questions?
            </h3>
            <p className="text-gray-600 mb-4">
              Our team is here to assist you with any subscription or payment questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="sm" asChild>
                <Link to="/help/pricing">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View Pricing FAQ
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:support@cosmichub.app">
                  Contact Support
                </a>
              </Button>
            </div>
          </div>

          {/* Special Offer (Optional) */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
            <div className="text-center">
              <h3 className="font-bold text-purple-900 mb-2">
                🎁 Special Offer Just For You
              </h3>
              <p className="text-purple-800 mb-4">
                Get 20% off your first month when you subscribe within the next 24 hours!
              </p>
              <Button asChild className="bg-purple-600 hover:bg-purple-700">
                <Link to="/pricing?offer=comeback20">
                  Claim 20% Discount
                </Link>
              </Button>
              <p className="text-xs text-purple-600 mt-2">
                Use code: COMEBACK20 (expires in 24 hours)
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Thank you for considering CosmicHub Premium.
              <br />
              We're here whenever you're ready to upgrade your cosmic journey! ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
