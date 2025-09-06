import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaStar, FaLeaf, FaBalanceScale } from 'react-icons/fa';
import type { UnifiedBirthData } from '@cosmichub/types';

interface ExtractedSystemsNavigationProps {
  birthData?: UnifiedBirthData;
  className?: string;
}

interface ExtractedSystem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  tier: 'free' | 'premium' | 'elite';
}

export const ExtractedSystemsNavigation: React.FC<ExtractedSystemsNavigationProps> = ({ 
  birthData,
  className = ''
}) => {
  const navigate = useNavigate();
  
  const extractedSystems: ExtractedSystem[] = [
    {
      id: 'psychology',
      title: 'Psychological Astrology',
      description: 'MBTI, Enneagram & personality integration',
      icon: FaBrain,
      path: '/psychology',
      tier: 'premium'
    },
    {
      id: 'spiritual', 
      title: 'Spiritual Astrology',
      description: 'Tarot, Kabbalah & consciousness development',
      icon: FaStar,
      path: '/spiritual',
      tier: 'elite'
    },
    {
      id: 'wellness',
      title: 'Astrological Wellness', 
      description: 'TCM, Five Elements & health correlations',
      icon: FaLeaf,
      path: '/wellness',
      tier: 'premium'
    },
    {
      id: 'synthesis',
      title: 'Integration Overview',
      description: 'Unified insights & life purpose synthesis',
      icon: FaBalanceScale,
      path: '/synthesis',
      tier: 'free'
    }
  ];

  const handleNavigate = (path: string) => {
    if (birthData) {
      navigate(path);
    } else {
      // Store intended destination and redirect to chart input
      navigate('/chart', { state: { redirectTo: path } });
    }
  };

  const getTierBadgeStyles = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/30';
      case 'elite':
        return 'bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30';
      default:
        return 'bg-cosmic-silver/20 text-cosmic-silver border-cosmic-silver/30';
    }
  };

  return (
    <div className={`cosmic-card bg-gradient-to-br from-cosmic-purple/10 to-cosmic-blue/10 border border-cosmic-silver/20 ${className}`}>
      <div className='p-4'>
        <h3 className='font-bold text-cosmic-gold mb-4 text-center'>
          Specialized Analysis Systems
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {extractedSystems.map((system) => {
            const IconComponent = system.icon;
            return (
              <button
                key={system.id}
                onClick={() => handleNavigate(system.path)}
                className='cosmic-card bg-cosmic-dark/50 hover:bg-cosmic-purple/20 border border-cosmic-silver/10 hover:border-cosmic-purple/30 transition-all duration-200 p-4 text-left group'
                disabled={!birthData}
                title={!birthData ? 'Enter birth data first' : `Navigate to ${system.title}`}
              >
                <div className='flex items-start space-x-3'>
                  <div className='flex-shrink-0'>
                    <IconComponent 
                      className='text-cosmic-purple group-hover:text-cosmic-gold transition-colors duration-200' 
                      size={20} 
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center justify-between mb-1'>
                      <h4 className='font-medium text-cosmic-silver text-sm truncate'>
                        {system.title}
                      </h4>
                      <span 
                        className={`inline-block px-2 py-0.5 text-xs rounded border ${getTierBadgeStyles(system.tier)}`}
                      >
                        {system.tier}
                      </span>
                    </div>
                    <p className='text-cosmic-silver/70 text-xs leading-relaxed'>
                      {system.description}
                    </p>
                  </div>
                </div>
                {!birthData && (
                  <div className='mt-2 text-center'>
                    <span className='text-xs text-yellow-400'>
                      ⚠️ Birth data required
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {!birthData && (
          <div className='mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-center'>
            <p className='text-yellow-400 text-sm'>
              <strong>Enter your birth data</strong> to access specialized analysis systems
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractedSystemsNavigation;
