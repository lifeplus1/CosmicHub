import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaTimesCircle,
  FaArrowLeft,
  FaCreditCard,
  FaCommentDots,
  FaSyncAlt,
} from 'react-icons/fa';
import { Button, Card } from '@cosmichub/ui';

export const SubscriptionCancelledPage: React.FC = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50'>
      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-2xl mx-auto'>
          {/* Cancellation Header */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4'>
              <FaTimesCircle className='w-10 h-10 text-orange-600' />
            </div>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              Subscription Cancelled
            </h1>
            <p className='text-lg text-gray-600'>
              Your subscription has been successfully cancelled
            </p>
          </div>

          {/* Cancellation Confirmation */}
          <Card className='mb-8'>
            <div className='bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg p-6'>
              <h2 className='text-xl text-center'>
                Your cancellation is now active
              </h2>
            </div>
            <div className='p-6'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                  <span className='font-medium text-gray-700'>Status:</span>
                  <span className='text-red-600 font-semibold'>Cancelled</span>
                </div>
                <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                  <span className='font-medium text-gray-700'>
                    Access until:
                  </span>
                  <span className='text-gray-600'>End of billing period</span>
                </div>
                <div className='flex justify-between items-center py-3'>
                  <span className='font-medium text-gray-700'>
                    Next billing:
                  </span>
                  <span className='text-gray-500'>None</span>
                </div>
              </div>

              <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  <strong>Good news!</strong> You&apos;ll continue to have
                  access to all premium features until the end of your current
                  billing period. After that, your account will automatically
                  switch to our free plan.
                </p>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className='mb-8'>
            <div className='p-6'>
              <h2 className='flex items-center gap-2 text-xl font-bold text-gray-800 mb-4'>
                <FaSyncAlt className='w-5 h-5 text-blue-500' />
                What happens next?
              </h2>
              <div className='space-y-4'>
                <Button className='w-full h-auto p-6 bg-blue-600 hover:bg-blue-700'>
                  <Link
                    to='/pricing'
                    className='flex items-center gap-3 text-white no-underline'
                  >
                    <FaCreditCard className='w-6 h-6' />
                    <div className='text-left'>
                      <div className='font-semibold'>
                        Reactivate Subscription
                      </div>
                      <div className='text-sm opacity-90'>
                        Resume your premium features anytime
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button variant='secondary' className='w-full h-auto p-6'>
                  <Link
                    to='/'
                    className='flex items-center gap-3 text-gray-700 no-underline'
                  >
                    <FaArrowLeft className='w-6 h-6' />
                    <div className='text-left'>
                      <div className='font-semibold'>
                        Continue with Free Plan
                      </div>
                      <div className='text-sm opacity-75'>
                        Access basic features for free
                      </div>
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Feedback Section */}
          <Card>
            <div className='p-6'>
              <h3 className='text-green-800 text-lg font-bold mb-4'>
                Help us improve
              </h3>
              <p className='text-green-700 mb-6'>
                We&apos;re sorry to see you go! Your feedback helps us make
                CosmicHub better for everyone.
              </p>

              <div className='space-y-3'>
                <Button variant='secondary' className='w-full'>
                  <FaCommentDots className='w-4 h-4 mr-2' />
                  Share feedback
                </Button>
                <p className='text-xs text-gray-500 text-center'>
                  Takes less than 2 minutes • Completely optional
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelledPage;
