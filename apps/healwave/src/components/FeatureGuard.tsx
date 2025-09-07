import React, { useMemo, useCallback } from 'react';
import { useAuth, useSubscription } from '@cosmichub/auth';
import { useAppNavigation } from '../hooks/useAppNavigation';
import { FaCrown, FaStar, FaLock } from 'react-icons/fa';

interface FeatureGuardProps {
  children: React.ReactNode;
  requiredTier: 'premium' | 'clinical';
  feature: string;
  showPreview?: boolean;
  upgradeMessage?: string;
}

interface FeatureDetails {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const FeatureGuard: React.FC<FeatureGuardProps> = ({
  children,
  requiredTier,
  feature,
  showPreview = true,
  upgradeMessage
}) => {
  const { user } = useAuth();
  const { userTier, hasFeature } = useSubscription();
  const { goToUpgrade } = useAppNavigation();

  // Determine if user has access to this feature
  const hasAccess = useMemo(() => {
    if (typeof hasFeature === 'function') {
      return hasFeature(feature, 'healwave');
    }
    
    // Fallback: Basic tier checking
    const tierHierarchy = ['free', 'premium', 'clinical'];
    const userLevel = tierHierarchy.indexOf(userTier || 'free');
    const requiredLevel = tierHierarchy.indexOf(requiredTier);
    return userLevel >= requiredLevel;
  }, [hasFeature, feature, userTier, requiredTier]);

  // Feature metadata mapping
  const featureMap = useMemo<Record<string, FeatureDetails>>(() => ({
    'custom-presets': {
      icon: <FaStar className="w-8 h-8 text-cosmic-purple" />,
      title: 'Custom Preset Creation',
      description: 'Create and save your own healing frequency combinations',
      benefits: [
        'Unlimited custom presets',
        'Personal frequency combinations',
        'Save session configurations',
        'Export preset collections'
      ]
    },
    'advanced-frequencies': {
      icon: <FaCrown className="w-8 h-8 text-cosmic-gold" />,
      title: 'Advanced Frequency Library',
      description: 'Access premium Rife and Solfeggio frequencies',
      benefits: [
        'Complete Rife frequency database',
        'Extended Solfeggio collection',
        'Clinical-grade frequencies',
        'Research-backed protocols'
      ]
    },
    'session-recording': {
      icon: <FaStar className="w-8 h-8 text-cosmic-purple" />,
      title: 'Session Recording & Export',
      description: 'Record and export your healing sessions',
      benefits: [
        'High-quality session recording',
        'Multiple export formats',
        'Share sessions with practitioners',
        'Build personal audio library'
      ]
    },
    'unlimited-duration': {
      icon: <FaStar className="w-8 h-8 text-cosmic-purple" />,
      title: 'Unlimited Session Duration',
      description: 'No time limits on your healing sessions',
      benefits: [
        'Sessions as long as you need',
        'No interruptions or timeouts',
        'Extended meditation support',
        'Overnight healing sessions'
      ]
    }
  }), []);

  const featureDetails = featureMap[feature] || {
    icon: <FaLock className="w-8 h-8 text-cosmic-silver" />,
    title: `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature`,
    description: upgradeMessage || `This feature requires a ${requiredTier} subscription.`,
    benefits: ['Enhanced healing capabilities', 'Professional tools', 'Advanced features']
  };

  const handleUpgrade = useCallback(() => {
    if (!user) {
      // Redirect to login first
      window.location.href = '/login';
      return;
    }
    goToUpgrade();
  }, [user, goToUpgrade]);

  // Render children if user has access
  if (hasAccess) {
    return <>{children}</>;
  }

  // Render upgrade prompt
  return (
    <div className="relative">
      {showPreview && (
        <div className="pointer-events-none blur-sm opacity-40" aria-hidden="true">
          {children}
        </div>
      )}
      
      <div className={`${showPreview ? 'absolute inset-0' : ''} flex items-center justify-center`}>
        <div className="cosmic-card bg-cosmic-dark/95 backdrop-blur border border-cosmic-purple/30 rounded-xl p-6 max-w-md mx-auto text-center">
          {/* Feature Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-cosmic-purple/20">
              {featureDetails.icon}
            </div>
          </div>

          {/* Tier Badge */}
          <div className="flex justify-center mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              requiredTier === 'clinical' 
                ? 'bg-cosmic-gold/20 text-cosmic-gold' 
                : 'bg-cosmic-purple/20 text-cosmic-purple'
            }`}>
              {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Feature
            </span>
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-white mb-2">
            {featureDetails.title}
          </h3>
          <p className="text-cosmic-silver mb-4">
            {featureDetails.description}
          </p>

          {/* Benefits */}
          <div className="text-left mb-6">
            <p className="font-semibold text-white mb-2">Includes:</p>
            <ul className="space-y-1">
              {featureDetails.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm text-cosmic-silver">
                  <span className="text-cosmic-purple mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Upgrade Button */}
          <button
            onClick={handleUpgrade}
            className="w-full cosmic-button bg-gradient-to-r from-cosmic-purple to-cosmic-pink hover:from-cosmic-purple/80 hover:to-cosmic-pink/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
          </button>
          
          <p className="text-xs text-cosmic-silver/60 mt-2">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureGuard;
