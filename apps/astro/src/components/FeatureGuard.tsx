import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@cosmichub/auth';
import { useSubscription } from '@cosmichub/auth';

interface FeatureGuardProps {
  children: React.ReactNode;
  requiredTier: 'premium' | 'elite';
  feature: string;
  upgradeMessage?: string;
  showPreview?: boolean;
}

export const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  requiredTier,
  feature,
  upgradeMessage,
  showPreview = true
}) => {
  const { user } = useAuth();
  const { userTier, hasFeature } = useSubscription();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If user has access, render children normally
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  const getTierIcon = (tier: string): string => {
    switch (tier) {
      case 'premium': return '⭐';
      case 'elite': return '👑';
      default: return '🔒';
    }
  };

  const getTierColorClasses = (tier: string) => {
    switch (tier) {
      case 'premium': return {
        border: 'border-purple-400',
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        button: 'bg-purple-600 hover:bg-purple-700',
        badge: 'bg-purple-500'
      };
      case 'elite': return {
        border: 'border-yellow-400',
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        button: 'bg-yellow-600 hover:bg-yellow-700',
        badge: 'bg-yellow-500'
      };
      default: return {
        border: 'border-gray-400',
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        button: 'bg-gray-600 hover:bg-gray-700',
        badge: 'bg-gray-500'
      };
    }
  };

  const getFeatureDetails = (feature: string) => {
    const featureMap: Record<string, {
      icon: string;
      title: string;
      description: string;
      benefits: string[];
      examples: string[];
    }> = {
      'synastry_analysis': {
        icon: '👫',
        title: 'Synastry Compatibility Analysis',
        description: 'Compare two birth charts to understand relationship dynamics and compatibility patterns.',
        benefits: [
          'Romantic compatibility insights',
          'Friendship and family dynamics',
          'Communication style analysis',
          'Emotional compatibility patterns',
          'Challenge and growth areas'
        ],
        examples: [
          'Compare Venus-Mars connections for romance',
          'Analyze Moon aspects for emotional harmony',
          'Check Mercury contacts for communication',
          'Examine house overlays for life area focus'
        ]
      },
      'ai_interpretation': {
        icon: '🧠',
        title: 'AI-Powered Chart Interpretation',
        description: 'Advanced artificial intelligence analyzes your chart patterns to provide personalized insights.',
        benefits: [
          'Deep personality analysis',
          'Life purpose guidance',
          'Career path recommendations',
          'Relationship pattern insights',
          'Custom question answering'
        ],
        examples: [
          'Ask specific questions about your chart',
          'Get detailed personality breakdowns',
          'Understand complex aspect patterns',
          'Receive personalized guidance'
        ]
      },
      'transit_analysis': {
        icon: '📈',
        title: 'Transit Analysis & Timing',
        description: 'Track current planetary movements and their effects on your natal chart for predictive insights.',
        benefits: [
          'Current life phase understanding',
          'Opportunity timing windows',
          'Challenge period awareness',
          'Growth cycle tracking',
          'Decision-making guidance'
        ],
        examples: [
          'Saturn return timing and effects',
          'Jupiter opportunities periods',
          'Eclipse activation points',
          'Mercury retrograde impacts'
        ]
      },
      'multi_system_analysis': {
        icon: '🔮',
        title: 'Multi-System Analysis',
        description: 'Compare insights from Western, Vedic, Chinese, Mayan, and Uranian astrological systems.',
        benefits: [
          'Western tropical personality insights',
          'Vedic karmic patterns and life purpose',
          'Chinese Four Pillars life cycles',
          'Mayan galactic signature',
          'Comprehensive spiritual perspective'
        ],
        examples: [
          'Western Sun vs Vedic Sun differences',
          'Chinese animal year influences',
          'Mayan day sign spiritual meaning',
          'Integrated life path analysis'
        ]
      }
    };

    return featureMap[feature] || {
      icon: '🔒',
      title: `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature`,
      description: upgradeMessage || `This feature requires a ${requiredTier} subscription.`,
      benefits: ['Enhanced astrological insights', 'Professional-grade tools', 'Advanced analysis'],
      examples: ['Detailed chart analysis', 'Professional interpretations']
    };
  };

  const featureDetails = getFeatureDetails(feature);
  const colors = getTierColorClasses(requiredTier);

  const handleUpgrade = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/upgrade-demo');
  };

  const UpgradeCard = () => (
    <div className={`cosmic-card ${colors.border} border-2 rounded-2xl relative overflow-hidden`}>
      {/* Premium Badge */}
      <div className={`absolute top-4 right-4 ${colors.badge} text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1`}>
        <span>{getTierIcon(requiredTier)}</span>
        <span>{requiredTier.toUpperCase()}</span>
      </div>

      <div className="p-6 pt-8">
        <div className="flex flex-col items-center mb-6 space-y-4">
          <div className={`${colors.bg} p-4 rounded-full`}>
            <span className="text-4xl">{featureDetails.icon}</span>
          </div>
          
          <div className="space-y-2 text-center">
            <h3 className={`text-xl font-bold ${colors.text}`}>
              {featureDetails.title}
            </h3>
            <p className="text-base text-cosmic-silver">
              {featureDetails.description}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Benefits List */}
          <div>
            <p className="mb-3 font-bold text-white">
              What you'll unlock:
            </p>
            <ul className="space-y-2">
              {featureDetails.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="mt-1 text-green-500">✓</span>
                  <span className="text-cosmic-silver">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Current Tier Info */}
          {user && (
            <div className="flex p-3 space-x-3 border border-blue-500 rounded-md bg-blue-900/50">
              <span className="text-xl text-blue-500">ℹ️</span>
              <div className="flex flex-col space-y-0">
                <p className="text-sm font-bold text-white">
                  Current plan: {userTier.charAt(0).toUpperCase() + userTier.slice(1)}
                </p>
                <p className="text-xs text-white/80">
                  Upgrade to {requiredTier} to access this feature
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              className={`${colors.button} text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2 transition-colors`}
              onClick={handleUpgrade}
            >
              <span>⬆️</span>
              <span>{user ? `Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}` : 'Sign In to Upgrade'}</span>
            </button>
            
            <button
              className={`border-2 ${colors.border} ${colors.text} bg-transparent hover:${colors.bg} font-medium py-2 px-4 rounded-lg w-full flex items-center justify-center space-x-2 transition-colors`}
              onClick={() => setIsModalOpen(true)}
            >
              <span>❓</span>
              <span>Learn More</span>
            </button>
          </div>

          {/* Pricing Info */}
          <div className="p-4 text-center rounded-md bg-white/10">
            <p className="mb-2 text-sm text-cosmic-silver">
              {requiredTier === 'premium' ? 'Starting at $14.99/month' : 'Starting at $29.99/month'}
            </p>
            <p className="text-xs text-cosmic-silver/60">
              Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showPreview ? (
        <div className="relative">
          {/* Blurred Preview */}
          <div className="relative pointer-events-none blur-lg opacity-30">
            {children}
          </div>
          
          {/* Overlay */}
          <div className="absolute z-10 w-11/12 max-w-md transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
            <UpgradeCard />
          </div>
        </div>
      ) : (
        <UpgradeCard />
      )}

      {/* Feature Details Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cosmic-dark border border-cosmic-gold/30 rounded-xl p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto z-50">
            <Dialog.Title className="flex items-center mb-4 space-x-3">
              <span className="text-2xl">{featureDetails.icon}</span>
              <h2 className="text-xl font-bold text-white">{featureDetails.title}</h2>
            </Dialog.Title>
            
            <div className="space-y-6">
              <p className="text-cosmic-silver">
                {featureDetails.description}
              </p>

              <div>
                <h3 className="mb-3 font-bold text-white">
                  Key Benefits:
                </h3>
                <ul className="space-y-2">
                  {featureDetails.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="mt-1 text-green-500">✓</span>
                      <span className="text-cosmic-silver">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-3 font-bold text-white">
                  Examples:
                </h3>
                <ul className="space-y-2">
                  {featureDetails.examples.map((example, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className={colors.text}>⭐</span>
                      <span className="text-cosmic-silver">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex p-4 space-x-3 border border-blue-500 rounded-md bg-blue-900/50">
                <span className="text-xl text-blue-500">ℹ️</span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Requires {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Plan
                  </h4>
                  <p className="text-xs text-white/80">
                    Upgrade your subscription to access this feature and unlock the full potential of astrological analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                className={`${colors.button} text-white font-semibold py-3 px-6 rounded-lg w-full flex items-center justify-center space-x-2 transition-colors`}
                onClick={() => {
                  setIsModalOpen(false);
                  handleUpgrade();
                }}
              >
                <span>⬆️</span>
                <span>Upgrade Now</span>
              </button>
              <button 
                className="w-full py-2 transition-colors text-cosmic-silver hover:text-white"
                onClick={() => setIsModalOpen(false)}
              >
                Maybe Later
              </button>
            </div>

            <Dialog.Close className="absolute transition-colors top-4 right-4 text-cosmic-silver hover:text-white">
              ✕
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default FeatureGuard;
