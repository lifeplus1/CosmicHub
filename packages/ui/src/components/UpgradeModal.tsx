import React from 'react';
import { FaTimes, FaStar, FaCrown, FaRocket } from 'react-icons/fa';
import { Button } from './Button';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  currentTier: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  onUpgrade: (tier: 'Basic' | 'Pro' | 'Enterprise') => void;
}

const tierData = {
  Basic: {
    name: 'Basic',
    price: '$9.99',
    period: '/month',
    icon: FaStar,
    color: 'blue',
    features: [
      'Unlimited birth charts',
      'Basic astrology reports',
      'Numerology calculations',
      'Basic frequency therapy',
      'Email support'
    ]
  },
  Pro: {
    name: 'Pro',
    price: '$19.99',
    period: '/month',
    icon: FaCrown,
    color: 'purple',
    popular: true,
    features: [
      'Everything in Basic',
      'Advanced astrology reports',
      'Gene Keys analysis',
      'Advanced frequency therapy',
      'Synastry compatibility',
      'PDF export',
      'Priority support'
    ]
  },
  Enterprise: {
    name: 'Enterprise',
    price: '$49.99',
    period: '/month',
    icon: FaRocket,
    color: 'gold',
    features: [
      'Everything in Pro',
      'Custom branding',
      'API access',
      'Bulk chart processing',
      'Advanced analytics',
      'White-label solutions',
      'Dedicated support'
    ]
  }
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  currentTier,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const getRecommendedTier = (): 'Basic' | 'Pro' | 'Enterprise' => {
    if (feature?.includes('Gene Keys') || feature?.includes('Synastry') || feature?.includes('PDF')) {
      return 'Pro';
    }
    if (feature?.includes('API') || feature?.includes('Enterprise')) {
      return 'Enterprise';
    }
    return 'Basic';
  };

  const recommendedTier = getRecommendedTier();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-white p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Unlock Premium Features</h2>
            {feature && (
              <p className="text-cosmic-silver text-lg">
                Upgrade to access <span className="font-semibold">{feature}</span>
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(tierData).map(([tierKey, tier]) => {
              const TierIcon = tier.icon;
              const isRecommended = tierKey === recommendedTier;
              const isCurrentTier = tierKey === currentTier;
              
              return (
                <div
                  key={tierKey}
                  className={`relative border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                    isRecommended 
                      ? 'border-cosmic-purple bg-cosmic-purple bg-opacity-5 ring-2 ring-cosmic-purple ring-opacity-30' 
                      : 'border-gray-200 hover:border-cosmic-purple'
                  } ${
                    isCurrentTier ? 'opacity-50' : ''
                  }`}
                >
                  {/* Recommended badge */}
                  {isRecommended && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-cosmic-purple text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Popular badge */}
                  {'popular' in tier && tier.popular && (
                    <div className="absolute -top-3 right-4">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Current tier badge */}
                  {isCurrentTier && (
                    <div className="absolute -top-3 left-4">
                      <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <TierIcon className={`w-12 h-12 mx-auto mb-4 text-cosmic-${tier.color}`} />
                    <h3 className="text-2xl font-bold text-cosmic-dark mb-2">{tier.name}</h3>
                    <div className="text-3xl font-bold text-cosmic-purple">
                      {tier.price}
                      <span className="text-lg font-normal text-gray-600">{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => onUpgrade(tierKey as 'Basic' | 'Pro' | 'Enterprise')}
                    disabled={isCurrentTier}
                    className={`w-full ${
                      isRecommended 
                        ? 'bg-cosmic-purple hover:bg-cosmic-purple-dark' 
                        : 'bg-cosmic-blue hover:bg-cosmic-blue-dark'
                    } ${isCurrentTier ? 'opacity-50 cursor-not-allowed' : ''}`}
                    variant="primary"
                  >
                    {isCurrentTier ? 'Current Plan' : `Upgrade to ${tier.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Benefits section */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-cosmic-dark mb-4 text-center">
              Why Upgrade to CosmicHub Premium?
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cosmic-purple bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <FaStar className="w-4 h-4 text-cosmic-purple" />
                </div>
                <div>
                  <h4 className="font-semibold text-cosmic-dark mb-1">Advanced Insights</h4>
                  <p className="text-gray-600 text-sm">
                    Unlock deeper astrological analysis and personalized insights
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cosmic-blue bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <FaCrown className="w-4 h-4 text-cosmic-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-cosmic-dark mb-1">Premium Tools</h4>
                  <p className="text-gray-600 text-sm">
                    Access Gene Keys, frequency therapy, and compatibility analysis
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FaRocket className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-cosmic-dark mb-1">Export & Share</h4>
                  <p className="text-gray-600 text-sm">
                    Generate beautiful PDF reports and share your insights
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <FaStar className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-cosmic-dark mb-1">Priority Support</h4>
                  <p className="text-gray-600 text-sm">
                    Get faster responses and dedicated assistance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Money-back guarantee */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              <span className="font-semibold">30-day money-back guarantee</span> • Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
