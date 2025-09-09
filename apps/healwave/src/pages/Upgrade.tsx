import React from 'react';
import { FaCrown, FaStar, FaHeadphones, FaCheck, FaArrowUp } from 'react-icons/fa';
import { useUnrestrictedSubscription } from '../providers/useUnrestrictedSubscription';

const Upgrade: React.FC = () => {
  const { userTier: currentTier } = useUnrestrictedSubscription();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: <FaHeadphones className="w-8 h-8 text-cosmic-silver" />,
      price: 'Free',
      period: 'Forever',
      features: [
        'Basic frequency generator',
        'Limited preset library',
        '5-minute sessions',
        'Standard audio quality',
      ],
      limitations: [
        'No binaural beats',
        'No custom presets',
        'No extended sessions',
      ],
      current: currentTier === 'free',
      buttonText: 'Current Plan',
      buttonDisabled: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <FaStar className="w-8 h-8 text-cosmic-purple" />,
      price: '$9.99',
      period: 'per month',
      features: [
        'Advanced frequency generator',
        'Full preset library (100+ presets)',
        'Unlimited session duration',
        'High-quality audio (48kHz)',
        'Binaural beat generator',
        'Custom preset creation',
        'Audio export functionality',
        'Progress tracking',
      ],
      popular: true,
      current: currentTier === 'premium',
      buttonText: currentTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium',
      buttonDisabled: currentTier === 'premium',
    },
    {
      id: 'clinical',
      name: 'Clinical',
      icon: <FaCrown className="w-8 h-8 text-cosmic-gold" />,
      price: '$29.99',
      period: 'per month',
      features: [
        'Everything in Premium',
        'Clinical-grade frequencies',
        'Research-backed protocols',
        'Patient session management',
        'Detailed analytics',
        'Professional support',
        'HIPAA compliance',
        'API access',
      ],
      current: currentTier === 'clinical',
      buttonText: currentTier === 'clinical' ? 'Current Plan' : 'Upgrade to Clinical',
      buttonDisabled: currentTier === 'clinical',
    },
  ];

  const handleUpgrade = (planId: string) => {
    // TODO: Implement actual upgrade logic
    alert(`Upgrade to ${planId} plan - Integration pending`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FaArrowUp className="w-8 h-8 text-cosmic-gold mr-3" />
            <h1 className="text-4xl font-bold text-white">
              Upgrade Your HealWave Experience
            </h1>
          </div>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Unlock the full potential of therapeutic frequency generation with advanced features 
            designed for both personal wellness and professional healing practices.
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentTier && (
          <div className="text-center mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <FaHeadphones className="w-4 h-4 mr-2" />
              Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
            </span>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                plan.current
                  ? 'border-cosmic-gold shadow-lg shadow-cosmic-gold/20'
                  : plan.popular
                  ? 'border-cosmic-purple shadow-lg shadow-cosmic-purple/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cosmic-purple text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {plan.current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cosmic-gold text-cosmic-dark px-4 py-1 rounded-full text-sm font-bold">
                    Current Plan
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period !== 'Forever' && (
                    <span className="text-blue-200 ml-2">/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheck className="w-4 h-4 text-green-400 mt-1 mr-3 flex-shrink-0" />
                      <span className="text-blue-100">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations (for free plan) */}
                {plan.limitations && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-blue-200 mb-3">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-blue-300">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.buttonDisabled}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  plan.buttonDisabled
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-cosmic-purple hover:bg-cosmic-purple/90 text-white shadow-lg hover:shadow-cosmic-purple/30'
                    : plan.id === 'clinical'
                    ? 'bg-cosmic-gold hover:bg-cosmic-gold/90 text-cosmic-dark shadow-lg hover:shadow-cosmic-gold/30'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } ${!plan.buttonDisabled && 'hover:scale-105'}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">
                What&apos;s the difference between Premium and Clinical?
              </h3>
              <p className="text-blue-200">
                Premium is perfect for personal wellness and meditation practices, while Clinical 
                is designed for healthcare professionals with additional compliance features, 
                patient management tools, and research-backed protocols.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-blue-200">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access 
                to premium features until the end of your current billing period.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a free trial available?
              </h3>
              <p className="text-blue-200">
                We offer a 7-day free trial for both Premium and Clinical plans. No credit card 
                required to start your trial.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-blue-300">
            <div className="flex items-center">
              <FaCheck className="w-5 h-5 text-green-400 mr-2" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center">
              <FaCheck className="w-5 h-5 text-green-400 mr-2" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center">
              <FaCheck className="w-5 h-5 text-green-400 mr-2" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
