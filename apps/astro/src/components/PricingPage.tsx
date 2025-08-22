import React, { useState, useCallback } from 'react';
import { devConsole } from '../config/environment';
import { useAuth, useSubscription } from '@cosmichub/auth';
import { useToast } from './ToastProvider';
import { stripeService } from '@cosmichub/integrations';
import * as Tooltip from '@radix-ui/react-tooltip';
import { FaCheck, FaTimes, FaStar, FaCrown, FaUser, FaChartLine, FaUsers, FaBrain, FaMagic, FaInfinity, FaQuestionCircle, FaHeart, FaCalendarAlt, FaFilePdf, FaSave, FaHeadset } from 'react-icons/fa';
// Using centralized subscription tiers
import { COSMICHUB_TIERS, type AstroSubscriptionTier } from '@cosmichub/subscriptions';

const PricingPage: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { tier: userTier } = useSubscription();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = useCallback(async (tier: 'premium' | 'elite') => {
    if (user === null || user === undefined) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to upgrade your plan.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (stripeService === undefined || stripeService === null) {
      toast({
        title: 'Service Unavailable',
        description: 'Payment service is currently unavailable. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(tier);
    try {
      const successUrl = `${window.location.origin}/pricing/success?tier=${tier}`;
      const cancelUrl = `${window.location.origin}/pricing/cancel`;

      await stripeService.createCheckoutSession({
        tier,
        userId: user.uid,
        isAnnual,
        successUrl,
        cancelUrl,
        metadata: {
          sourceComponent: 'PricingPage',
          billingCycle: isAnnual ? 'annual' : 'monthly'
        }
      });

      // Update subscription data in Firestore
      await stripeService.updateUserSubscription(user.uid, tier, isAnnual);
      
      toast({
        title: 'Upgrade Initiated',
        description: 'Redirecting to Stripe Checkout...',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      devConsole.error('Upgrade error:', error);
      toast({
        title: 'Upgrade Failed',
        description: 'An error occurred during the upgrade process. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(null);
    }
  }, [user, isAnnual, toast]);

  const getTierIcon = (tier: keyof typeof COSMICHUB_TIERS) => {
    switch (tier) {
      case 'free': return <FaUser className="text-gray-500" />;
      case 'premium': return <FaStar className="text-purple-500" />;
      case 'elite': return <FaCrown className="text-orange-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getTierColor = (tier: keyof typeof COSMICHUB_TIERS): string => {
    switch (tier) {
      case 'free': return 'gray-500';
      case 'premium': return 'purple-500';
      case 'elite': return 'orange-500';
      default: return 'gray-500';
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'Basic birth chart calculation': return <FaChartLine className="text-blue-500" />;
      case 'Western tropical astrology': return <FaUsers className="text-green-500" />;
      case 'Multi-system analysis': return <FaBrain className="text-purple-500" />;
      case 'Vedic sidereal charts': return <FaMagic className="text-orange-500" />;
      case 'Chinese astrology': return <FaInfinity className="text-red-500" />;
      case 'Mayan calendar': return <FaStar className="text-yellow-500" />;
      case 'Uranian astrology': return <FaCrown className="text-gold-500" />;
      case 'Synastry compatibility': return <FaHeart className="text-pink-500" />;
      case 'AI interpretations': return <FaBrain className="text-indigo-500" />;
      case 'Transit analysis': return <FaCalendarAlt className="text-cyan-500" />;
      case 'PDF export': return <FaFilePdf className="text-red-500" />;
      case 'Unlimited calculations': return <FaInfinity className="text-green-500" />;
      case 'Unlimited storage': return <FaSave className="text-blue-500" />;
      case 'Priority support': return <FaHeadset className="text-purple-500" />;
      default: return <FaQuestionCircle className="text-gray-500" />;
    }
  };

  const getFeatureDescription = (feature: string): string => {
    const descriptions: Record<string, string> = {
      'AI interpretations': 'Intelligent chart analysis powered by advanced AI models.',
      'Transit analysis': 'Detailed forecasts of upcoming planetary influences and timing.',
      'Multi-system analysis': 'Integrated Western, Vedic, Chinese, Mayan, and Uranian astrology.',
      'Synastry compatibility': 'In-depth relationship analysis between multiple charts.',
      'Vedic sidereal charts': 'Traditional Indian astrology with sidereal zodiac.',
      'Chinese astrology': 'Four Pillars and Zi Wei Dou Shu systems.',
      'Mayan calendar': 'Tzolk\'in and Haab cycles for spiritual timing.',
      'Uranian astrology': 'Midpoint and transneptunian planet analysis.'
    };
    const desc = descriptions[feature];
    return desc === undefined || desc === '' ? 'Advanced astrological feature for deeper insights.' : desc;
  };

  const getFeatureExamples = (feature: string): string[] => {
    const examples: Record<string, string[]> = {
      'AI interpretations': [
        'Personality analysis based on planetary patterns',
        'Life purpose guidance from chart synthesis',
        'Relationship compatibility insights',
        'Career path recommendations'
      ],
      'Transit analysis': [
        'Current life phase timing',
        'Opportunity windows',
        'Challenge periods',
        'Growth cycles'
      ],
      'Multi-system analysis': [
        'Western tropical chart for personality',
        'Vedic sidereal for karmic patterns',
        'Chinese Four Pillars for life cycles',
        'Mayan calendar for spiritual purpose'
      ],
      'Synastry compatibility': [
        'Romantic partnership analysis',
        'Friendship compatibility',
        'Family relationship dynamics',
        'Business partnership potential'
      ]
    };
    const ex = examples[feature];
    return Array.isArray(ex) ? ex : [];
  };

  const getFeatureTier = (feature: string): 'free' | 'premium' | 'elite' | undefined => {
    const tiers: Record<string, 'free' | 'premium' | 'elite'> = {
      'AI interpretations': 'elite',
      'Transit analysis': 'elite',
      'Multi-system analysis': 'premium',
      'Synastry compatibility': 'premium',
      'Vedic sidereal charts': 'premium',
      'Chinese astrology': 'premium',
      'Uranian astrology': 'elite',
      'Mayan calendar': 'premium'
    };
    return tiers[feature];
  };

  const getAllFeatures = (): string[] => [
    'Basic birth chart calculation',
    'Western tropical astrology',
    'Multi-system analysis',
    'Vedic sidereal charts',
    'Chinese astrology',
    'Mayan calendar',
    'Uranian astrology',
    'Synastry compatibility',
    'AI interpretations',
    'Transit analysis',
    'PDF export',
    'Unlimited calculations',
    'Unlimited storage',
    'Priority support'
  ];

  const isFeatureIncluded = (feature: string, planFeatures: string[]): boolean => {
    return planFeatures.includes(feature);
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-4xl font-bold text-cosmic-gold font-cinzel">Pricing Plans</h2>
          <p className="max-w-2xl mx-auto text-lg text-cosmic-silver">
            Choose the perfect plan to unlock the cosmos. All plans include core astrology features, with premium tiers adding advanced analysis and unlimited access.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnnual}
              onChange={(e) => setIsAnnual(e.target.checked)}
              className="w-5 h-5 text-purple-500 rounded"
            />
            <span className="font-medium text-cosmic-silver">Annual Billing</span>
            <span className="px-2 py-1 text-sm text-green-500 rounded bg-green-500/20">Save 20%</span>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {Object.entries(COSMICHUB_TIERS).map(([tierKey, tier]: [string, AstroSubscriptionTier]) => (
            <div key={tierKey} className={`cosmic-card ${tierKey === userTier ? 'border-2 border-purple-500 shadow-lg' : ''}`}>
              <div className="p-6">
                <div className="flex items-center mb-4 space-x-3">
                  {getTierIcon(tierKey)}
                  <h3 className="text-2xl font-bold text-cosmic-gold">{tier.name}</h3>
                </div>
                <p className="mb-6 text-sm text-cosmic-silver">{tier.description}</p>
                <div className="flex items-baseline mb-6 space-x-2">
                  <span className="text-3xl font-bold text-cosmic-gold">${isAnnual ? tier.price.yearly : tier.price.monthly}</span>
                  <span className="text-sm text-cosmic-silver/80">/{isAnnual ? 'year' : 'month'}</span>
                </div>
                <ul className="mb-6 space-y-4">
                  {tier.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3">
                      <FaCheck className="mt-1 text-green-500" />
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm text-cosmic-silver">{feature}</p>
                        <div className="flex items-center space-x-2">
                          {/* Guard against invalid tier color values (tailwind safelist recommended) */}
                          <span className={`px-2 py-1 rounded text-xs bg-${getTierColor(feature)}/20 text-${getTierColor(feature)}`}>
                            {getFeatureTier(feature)}
                          </span>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <button className="text-cosmic-purple hover:text-cosmic-purple/80" aria-label="Feature Information">
                                <FaQuestionCircle />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content className="bg-cosmic-blue/80 backdrop-blur-md border border-cosmic-silver/20 rounded-md shadow-lg p-2 text-cosmic-silver max-w-[300px]" side="top">
                                <p className="mb-2 font-bold">{feature}</p>
                                <p className="mb-2 text-sm">{getFeatureDescription(feature)}</p>
                                <div className="flex flex-col space-y-1">
                                  {getFeatureExamples(feature).map((example, i) => (
                                    <p key={i} className="text-xs text-cosmic-silver/80">• {example}</p>
                                  ))}
                                </div>
                                <Tooltip.Arrow className="fill-cosmic-blue/80" />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full cosmic-button"
                  disabled={(loading !== null && loading === tierKey) || (typeof userTier === 'string' && tierKey === userTier)}
                  onClick={() => { void handleUpgrade(tierKey as 'premium' | 'elite'); }}
                  aria-label={tierKey === userTier ? 'Current Plan' : 'Select Plan'}
                >
                  {tierKey === userTier ? 'Current Plan' : (tier.price.monthly === 0 ? 'Free' : 'Subscribe Now')}
                </button>
                {tier.price.monthly === 0 && typeof tier.price.monthly === 'number' && (
                  <p className="mt-2 text-xs text-center text-cosmic-silver/80">Always free</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <hr className="my-12 border-cosmic-silver/30" />

        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-cosmic-gold">Feature Comparison</h2>
          <p className="text-sm text-cosmic-silver">Hover over features for more details</p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-3 font-semibold text-left text-cosmic-silver">Feature</th>
                <th className="px-4 py-3 font-semibold text-center text-cosmic-silver">Free</th>
                <th className="px-4 py-3 font-semibold text-center text-cosmic-silver">Premium</th>
                <th className="px-4 py-3 font-semibold text-center text-cosmic-silver">Elite</th>
              </tr>
            </thead>
            <tbody>
              {getAllFeatures().map((feature) => (
                <tr key={feature} className="border-b border-cosmic-silver/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getFeatureIcon(feature)}
                      <span className="text-cosmic-silver">{feature}</span>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button className="text-cosmic-purple hover:text-cosmic-purple/80" aria-label="Feature Information">
                            <FaQuestionCircle />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content className="bg-cosmic-blue/80 backdrop-blur-md border border-cosmic-silver/20 rounded-md shadow-lg p-2 text-cosmic-silver max-w-[300px]" side="top">
                            <p className="mb-2 font-bold">{feature}</p>
                            <p className="mb-2 text-sm">{getFeatureDescription(feature)}</p>
                            <div className="flex flex-col space-y-1">
                              {getFeatureExamples(feature).map((example, i) => (
                                <p key={i} className="text-xs text-cosmic-silver/80">• {example}</p>
                              ))}
                            </div>
                            <Tooltip.Arrow className="fill-cosmic-blue/80" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isFeatureIncluded(feature, (COSMICHUB_TIERS['free']?.features ?? [])) ? <FaCheck className="mx-auto text-green-500" /> : <FaTimes className="mx-auto text-red-500" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isFeatureIncluded(feature, (COSMICHUB_TIERS['premium']?.features ?? [])) ? <FaCheck className="mx-auto text-green-500" /> : <FaTimes className="mx-auto text-red-500" />}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isFeatureIncluded(feature, (COSMICHUB_TIERS['elite']?.features ?? [])) ? <FaCheck className="mx-auto text-green-500" /> : <FaTimes className="mx-auto text-red-500" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

PricingPage.displayName = 'PricingPage';

export default PricingPage;