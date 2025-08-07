import React, { useState } from 'react';
import { HEALWAVE_TIERS, calculateYearlySavings } from '../types/subscription';
import { useAuth } from '../contexts/AuthContext';
import * as SwitchPrimitive from '@radix-ui/react-switch';

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();

  const handleSubscribe = async (tierSlug: string) => {
    if (!user) {
      alert('Please sign in to subscribe to HealWave Pro');
      return;
    }

    if (tierSlug === 'free') {
      alert('You are already using the free tier!');
      return;
    }

    alert('Subscription system will be available soon!');
  };

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex flex-col items-center mb-12 space-y-8 text-center">
          <h2 className="text-3xl font-bold text-purple-600">
            Choose Your HealWave Plan
          </h2>
          <p className="max-w-2xl text-xl text-gray-600">
            Unlock your mind's potential with therapeutic binaural beats. 
            Start free, upgrade for advanced features.
          </p>
          
          <div className="flex items-center space-x-4">
            <span className="font-semibold">Monthly</span>
            <SwitchPrimitive.Root
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="w-11 h-6 bg-gray-200 rounded-full relative data-[state=checked]:bg-purple-600 outline-none cursor-pointer transition-colors"
              aria-label="Toggle yearly billing"
            >
              <SwitchPrimitive.Thumb
                className="block w-5 h-5 bg-white rounded-full shadow-md transform translate-x-0.5 data-[state=checked]:translate-x-5.5 transition-transform"
              />
            </SwitchPrimitive.Root>
            <span className="font-semibold">Yearly</span>
            <span className="px-2 py-1 text-sm font-medium text-white bg-green-500 rounded-md">
              Save up to 33%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {Object.entries(HEALWAVE_TIERS).map(([tierSlug, tier]) => {
            const price = isYearly ? tier.price.yearly : tier.price.monthly;
            const yearlyPrice = tier.price.yearly;
            const monthlyPrice = tier.price.monthly;
            const savings = calculateYearlySavings(monthlyPrice, yearlyPrice);
            const isPopular = tierSlug === 'premium';

            return (
              <div
                key={tierSlug}
                className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg border ${isPopular ? 'border-purple-500 border-4' : 'border-gray-200'} relative transition-all duration-300 ${isPopular ? 'scale-105' : 'scale-100'}`}
              >
                {isPopular && (
                  <span className="absolute flex items-center px-4 py-1 space-x-1 text-sm font-medium text-white transform -translate-x-1/2 bg-purple-500 rounded-full -top-3 left-1/2">
                    <span>★</span>
                    <span>Most Popular</span>
                  </span>
                )}

                <div className="flex flex-col items-center p-8 space-y-6">
                  <div className="space-y-2 text-center">
                    <h3 className={`text-xl font-bold ${isPopular ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {tier.name}
                    </h3>
                    
                    <div className="flex items-baseline justify-center">
                      <span className={`text-4xl font-bold ${isPopular ? 'text-purple-600' : 'text-gray-900 dark:text-white'}`}>
                        ${price}
                      </span>
                      {tierSlug !== 'free' && (
                        <span className="ml-1 text-gray-500">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      )}
                    </div>

                    {isYearly && tierSlug !== 'free' && savings > 0 && (
                      <p className="text-sm font-semibold text-green-500">
                        Save {savings}% yearly
                      </p>
                    )}
                  </div>

                  <ul className="w-full space-y-3">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2 text-green-500">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(tierSlug)}
                    disabled={tierSlug === 'free'}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      tierSlug === 'free'
                        ? 'border border-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                    }`}
                    aria-label={`Subscribe to ${tier.name} plan`}
                  >
                    {tierSlug === 'free' ? 'Current Plan' : `Start ${tier.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center mt-16 space-y-4 text-center">
          <p className="text-gray-600">
            All plans include our 7-day free trial. Cancel anytime.
          </p>
          <p className="text-sm text-gray-500">
            Prices in USD. Auto-renewal can be turned off at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
