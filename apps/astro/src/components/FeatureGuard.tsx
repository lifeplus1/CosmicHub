import React, { useState, useCallback, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSubscription } from '@cosmichub/auth';

// Temporary inline constants to avoid import issues
const FEATURE_KEYS = {
  SYNSTRY_ANALYSIS: 'synastry_analysis',
  AI_INTERPRETATION: 'ai_interpretation',
  TRANSIT_ANALYSIS: 'transit_analysis',
  MULTI_SYSTEM_ANALYSIS: 'multi_system_analysis',
} as const;

type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

const isFeatureKey = (value: string): value is FeatureKey =>
  Object.values(FEATURE_KEYS).includes(value as FeatureKey);

interface FeatureGuardProps {
  children: React.ReactNode;
  requiredTier: 'premium' | 'elite';
  feature: string;
  upgradeMessage?: string;
  showPreview?: boolean;
}

interface FeatureDetails {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  examples: string[];
}

interface TierColors {
  border: string;
  bg: string;
  text: string;
  button: string;
  badge: string;
}

const FeatureGuard: React.FC<FeatureGuardProps> = React.memo(({
  children,
  requiredTier,
  feature,
  upgradeMessage,
  showPreview = true,
}) => {
  const { user } = useAuth();
  const { userTier, hasFeature } = useSubscription();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoized user tier for performance
  const safeUserTier = useMemo<string>(() => 
    typeof userTier === 'string' && userTier.length > 0 ? userTier : 'free',
    [userTier]
  );

  // Memoized feature access check
  const hasAccessToFeature = useMemo(() => 
    typeof hasFeature === 'function' && hasFeature(feature) === true,
    [hasFeature, feature]
  );

  // Memoized feature mapping to avoid recreation on every render
  const featureMap = useMemo<Record<string, FeatureDetails>>(() => ({
    [FEATURE_KEYS.SYNSTRY_ANALYSIS]: {
      icon: '👫',
      title: 'Synastry Compatibility Analysis',
      description:
        'Compare two birth charts to understand relationship dynamics and compatibility patterns.',
      benefits: [
        'Romantic compatibility insights',
        'Friendship and family dynamics',
        'Communication style analysis',
        'Emotional compatibility patterns',
        'Challenge and growth areas',
      ],
      examples: [
        'Compare Venus-Mars connections for romance',
        'Analyze Moon aspects for emotional harmony',
        'Check Mercury contacts for communication',
        'Examine house overlays for life area focus',
      ],
    },
    [FEATURE_KEYS.AI_INTERPRETATION]: {
      icon: '🧠',
      title: 'AI-Powered Chart Interpretation',
      description:
        'Advanced artificial intelligence analyzes your chart patterns to provide personalized insights.',
      benefits: [
        'Deep personality analysis',
        'Life purpose guidance',
        'Career path recommendations',
        'Relationship pattern insights',
        'Custom question answering',
      ],
      examples: [
        'Ask specific questions about your chart',
        'Get detailed personality breakdowns',
        'Understand complex aspect patterns',
        'Receive personalized guidance',
      ],
    },
    [FEATURE_KEYS.TRANSIT_ANALYSIS]: {
      icon: '📈',
      title: 'Transit Analysis & Timing',
      description:
        'Track current planetary movements and their effects on your natal chart for predictive insights.',
      benefits: [
        'Current life phase understanding',
        'Opportunity timing windows',
        'Challenge period awareness',
        'Growth cycle tracking',
        'Decision-making guidance',
      ],
      examples: [
        'Saturn return timing and effects',
        'Jupiter opportunities periods',
        'Eclipse activation points',
        'Mercury retrograde impacts',
      ],
    },
    [FEATURE_KEYS.MULTI_SYSTEM_ANALYSIS]: {
      icon: '🔮',
      title: 'Multi-System Analysis',
      description:
        'Compare insights from Western, Vedic, Chinese, Mayan, and Uranian astrological systems.',
      benefits: [
        'Western tropical personality insights',
        'Vedic karmic patterns and life purpose',
        'Chinese Four Pillars life cycles',
        'Mayan galactic signature',
        'Comprehensive spiritual perspective',
      ],
      examples: [
        'Western Sun vs Vedic Sun differences',
        'Chinese animal year influences',
        'Mayan day sign spiritual meaning',
        'Integrated life path analysis',
      ],
    },
  }), []);

  // Memoized feature details for current feature
  const featureDetails = useMemo<FeatureDetails>(() => 
    (isFeatureKey(feature) ? featureMap[feature] : undefined) ?? {
      icon: '🔒',
      title: `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature`,
      description:
        upgradeMessage !== undefined &&
        upgradeMessage !== null &&
        upgradeMessage.length > 0
          ? upgradeMessage
          : `This feature requires a ${requiredTier} subscription.`,
      benefits: [
        'Enhanced astrological insights',
        'Professional-grade tools',
        'Advanced analysis',
      ],
      examples: ['Detailed chart analysis', 'Professional interpretations'],
    },
    [feature, requiredTier, upgradeMessage, featureMap]
  );

  // Memoized tier color classes
  const colors = useMemo<TierColors>(() => {
    switch (requiredTier) {
      case 'premium':
        return {
          border: 'border-purple-400',
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          button: 'bg-purple-600 hover:bg-purple-700',
          badge: 'bg-purple-500',
        };
      case 'elite':
        return {
          border: 'border-yellow-400',
          bg: 'bg-yellow-100',
          text: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          badge: 'bg-yellow-500',
        };
      default:
        return {
          border: 'border-gray-400',
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700',
          badge: 'bg-gray-500',
        };
    }
  }, [requiredTier]);

  // Memoized tier icon
  const tierIcon = useMemo(() => {
    switch (requiredTier) {
      case 'premium': return '⭐';
      case 'elite': return '👑';
      default: return '🔒';
    }
  }, [requiredTier]);

  // Optimized event handlers with useCallback
  const handleUpgrade = useCallback(() => {
    if (user === null || user === undefined) {
      navigate('/login');
      return;
    }
    navigate('/upgrade-demo');
  }, [user, navigate]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleModalUpgrade = useCallback(() => {
    setIsModalOpen(false);
    handleUpgrade();
  }, [handleUpgrade]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // Memoized pricing info
  const pricingInfo = useMemo(() => ({
    price: requiredTier === 'premium' ? '$14.99/month' : '$29.99/month',
    guarantee: 'Cancel anytime • 30-day money-back guarantee'
  }), [requiredTier]);

  // Memoized user status
  const userStatus = useMemo(() => ({
    isLoggedIn: user !== null && user !== undefined,
    displayTier: safeUserTier.charAt(0).toUpperCase() + safeUserTier.slice(1),
    displayRequiredTier: requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)
  }), [user, safeUserTier, requiredTier]);

    // Memoized UpgradeCard component to prevent unnecessary re-renders
  const UpgradeCard = useCallback(() => (
    <div
      className={`cosmic-card ${colors.border} border-2 rounded-2xl relative overflow-hidden`}
      role="article"
      aria-labelledby="upgrade-card-title"
      aria-describedby="upgrade-card-description"
    >
      {/* Premium Badge */}
      <div
        className={`absolute top-4 right-4 ${colors.badge} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1`}
        role="img"
        aria-label={`${userStatus.displayRequiredTier} tier required`}
      >
        <span>{tierIcon}</span>
        <span>{requiredTier.toUpperCase()}</span>
      </div>

      <div className='p-6 pt-8'>
        <div className='flex flex-col items-center mb-6 space-y-4'>
          <div className={`${colors.bg} p-4 rounded-full`} role="img" aria-label="Feature icon">
            <span className='text-4xl'>{featureDetails.icon}</span>
          </div>

          <div className='space-y-2 text-center'>
            <h3 
              id="upgrade-card-title"
              className={`text-xl font-bold ${colors.text}`}
            >
              {featureDetails.title}
            </h3>
            <p 
              id="upgrade-card-description"
              className='text-base text-cosmic-silver'
            >
              {featureDetails.description}
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          {/* Benefits List */}
          <div>
            <p className='mb-3 font-bold text-white'>
              What you&apos;ll unlock:
            </p>
            <ul 
              className='space-y-2'
              aria-label="Feature benefits"
            >
              {(Array.isArray(featureDetails.benefits)
                ? featureDetails.benefits
                : []
              ).map((benefit: string, index: number) => (
                <li key={index} className='flex items-start space-x-2 text-sm'>
                  <span className='mt-1 text-green-500' aria-hidden="true">✓</span>
                  <span className='text-cosmic-silver'>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current Tier Info */}
          {userStatus.isLoggedIn && (
            <div 
              className='flex p-3 space-x-3 border border-blue-500 rounded-md bg-blue-900/50'
              role="status"
              aria-label="Current subscription status"
            >
              <span className='text-xl text-blue-500' aria-hidden="true">ℹ️</span>
              <div className='flex flex-col space-y-0'>
                <p className='text-sm font-bold text-white'>
                  Current plan: {userStatus.displayTier}
                </p>
                <p className='text-xs text-white/80'>
                  Upgrade to {requiredTier} to access this feature
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-3'>
            <button
              className={`${colors.button} text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmic-dark focus:ring-purple-500`}
              onClick={handleUpgrade}
              onKeyDown={(e) => handleKeyDown(e, handleUpgrade)}
              aria-label={userStatus.isLoggedIn 
                ? `Upgrade to ${userStatus.displayRequiredTier} subscription`
                : 'Sign in to upgrade subscription'
              }
            >
              <span aria-hidden="true">⬆️</span>
              <span>
                {userStatus.isLoggedIn
                  ? `Upgrade to ${userStatus.displayRequiredTier}`
                  : 'Sign In to Upgrade'}
              </span>
            </button>

            <button
              className={`border-2 ${colors.border} ${colors.text} bg-transparent hover:${colors.bg} font-medium py-2 px-4 rounded-lg w-full flex items-center justify-center space-x-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmic-dark focus:ring-purple-500`}
              onClick={handleOpenModal}
              onKeyDown={(e) => handleKeyDown(e, handleOpenModal)}
              aria-label="Learn more about this feature"
            >
              <span aria-hidden="true">❓</span>
              <span>Learn More</span>
            </button>
          </div>

          {/* Pricing Info */}
          <div 
            className='p-4 text-center rounded-md bg-white/10'
            role="complementary"
            aria-label="Pricing information"
          >
            <p className='mb-2 text-sm text-cosmic-silver'>
              Starting at {pricingInfo.price}
            </p>
            <p className='text-xs text-cosmic-silver/60'>
              {pricingInfo.guarantee}
            </p>
          </div>
        </div>
      </div>
    </div>
  ), [colors, tierIcon, requiredTier, userStatus, featureDetails, handleUpgrade, handleOpenModal, handleKeyDown, pricingInfo]);

  // Early return for authorized users
  if (hasAccessToFeature) {
    return <>{children}</>;
  }

  return (
    <>
      {showPreview === true ? (
        <div 
          className='relative'
          role="region"
          aria-label="Premium feature preview"
        >
          {/* Blurred Preview */}
          <div 
            className='relative pointer-events-none blur-lg opacity-30'
            aria-hidden="true"
          >
            {children}
          </div>

          {/* Overlay */}
          <div 
            className='absolute z-10 w-11/12 max-w-md transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'
            role="dialog"
            aria-modal="false"
          >
            <UpgradeCard />
          </div>
        </div>
      ) : (
        <UpgradeCard />
      )}

      {/* Feature Details Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay 
            className='fixed inset-0 z-50 bg-black/50' 
            aria-label="Modal overlay"
          />
          <Dialog.Content 
            className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cosmic-dark border border-cosmic-gold/30 rounded-xl p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto z-50 focus:outline-none focus:ring-2 focus:ring-cosmic-gold'
            aria-describedby="modal-description"
          >
            <Dialog.Title className='flex items-center mb-4 space-x-3'>
              <span className='text-2xl' aria-hidden="true">{featureDetails.icon}</span>
              <h2 className='text-xl font-bold text-white'>
                {featureDetails.title}
              </h2>
            </Dialog.Title>

            <div className='space-y-6' id="modal-description">
              <p className='text-cosmic-silver'>{featureDetails.description}</p>

              <div>
                <h3 className='mb-3 font-bold text-white'>Key Benefits:</h3>
                <ul className='space-y-2'>
                  {Array.isArray(featureDetails.benefits)
                    ? featureDetails.benefits.map(
                        (benefit: string, index: number) => (
                          <li
                            key={index}
                            className='flex items-start space-x-2 text-sm'
                          >
                            <span className='mt-1 text-green-500' aria-hidden="true">✓</span>
                            <span className='text-cosmic-silver'>
                              {benefit}
                            </span>
                          </li>
                        )
                      )
                    : null}
                </ul>
              </div>

              <div>
                <h3 className='mb-3 font-bold text-white'>Examples:</h3>
                <ul className='space-y-2'>
                  {Array.isArray(featureDetails.examples)
                    ? featureDetails.examples.map(
                        (example: string, index: number) => (
                          <li
                            key={index}
                            className='flex items-start space-x-2 text-sm'
                          >
                            <span className={colors.text} aria-hidden="true">⭐</span>
                            <span className='text-cosmic-silver'>
                              {example}
                            </span>
                          </li>
                        )
                      )
                    : null}
                </ul>
              </div>

              <div 
                className='flex p-4 space-x-3 border border-blue-500 rounded-md bg-blue-900/50'
                role="status"
                aria-label="Subscription requirement information"
              >
                <span className='text-xl text-blue-500' aria-hidden="true">ℹ️</span>
                <div>
                  <h4 className='text-sm font-bold text-white'>
                    Requires {userStatus.displayRequiredTier} Plan
                  </h4>
                  <p className='text-xs text-white/80'>
                    Upgrade your subscription to access this feature and unlock
                    the full potential of astrological analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-6 space-y-3'>
              <button
                className={`${colors.button} text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmic-dark focus:ring-purple-500`}
                onClick={handleModalUpgrade}
                onKeyDown={(e) => handleKeyDown(e, handleModalUpgrade)}
                aria-label="Upgrade subscription now"
              >
                <span aria-hidden="true">⬆️</span>
                <span>Upgrade Now</span>
              </button>
              <button
                className='w-full py-2 transition-colors text-cosmic-silver hover:text-white focus:ring-2 focus:ring-cosmic-gold focus:outline-none'
                onClick={handleCloseModal}
                onKeyDown={(e) => handleKeyDown(e, handleCloseModal)}
                aria-label="Close modal and continue browsing"
              >
                Maybe Later
              </button>
            </div>

            <Dialog.Close 
              className='absolute transition-colors top-4 right-4 text-cosmic-silver hover:text-white focus:ring-2 focus:ring-cosmic-gold focus:outline-none rounded'
              aria-label="Close modal"
              onClick={handleCloseModal}
              onKeyDown={(e) => handleKeyDown(e, handleCloseModal)}
            >
              ✕
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});

FeatureGuard.displayName = 'FeatureGuard';

export default FeatureGuard;
