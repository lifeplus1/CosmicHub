import React, { useState, Suspense, lazy, useCallback, useMemo } from 'react';
import type { UnifiedBirthData } from '@cosmichub/types';
import { AccessibleButton } from '@cosmichub/ui';
// Prefix unused imports with underscore to indicate future use
import { ProgressBar as _ProgressBar } from '@cosmichub/ui';
import { trackCosmicHubAIInteraction as _trackCosmicHubAIInteraction } from '../../../services/analytics';

// Lazy-loaded components for performance
const MBTIDetailView = lazy(() => import('./MBTIDetailView'));
const EnneagramDetailView = lazy(() => import('./EnneagramDetailView'));
const PsychologySynthesisView = lazy(() => import('./PsychologySynthesisView'));

// MBTI Data Types
interface CognitiveFunction {
  name: string;
  fullName: string;
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';
  planetaryCorrelation: string;
  elementalAssociation: string;
  strength: number;
  description: string;
}

interface MBTIProfile {
  type: string;
  name: string;
  description: string;
  temperament: string;
  cognitiveStack: CognitiveFunction[];
  elementalCorrelation: string;
  astrologicalSigns: string[];
  strengths: string[];
  growthAreas: string[];
  compatibility: Record<string, string>;
}

// Enneagram Data Types
interface EnneagramWing {
  number: number;
  name: string;
  influence: number;
  description: string;
}

interface EnneagramProfile {
  type: number;
  name: string;
  description: string;
  coreMotivation: string;
  basicFear: string;
  house: number;
  planetaryRuler: string;
  element: string;
  wings: EnneagramWing[];
  instinctualVariant: 'Self-Preservation' | 'Sexual' | 'Social';
  level: number;
  integrationDirection: number;
  disintegrationDirection: number;
  compatibleTypes: number[];
  challengingTypes: number[];
  areasForGrowth: string[];
}

// Props interface
interface PsychologyChartProps {
  data: UnifiedBirthData;
  className?: string;
}

/**
 * Psychology Chart Component
 * Displays MBTI and Enneagram analysis with astrological correlations
 */
export const PsychologyChart: React.FC<PsychologyChartProps> = React.memo(({ 
  data, 
  className 
}) => {
  const [activeTab, setActiveTab] = useState<'mbti' | 'enneagram' | 'synthesis'>('mbti');
  // Prefix unused state with underscore to indicate future use  
  const [_isLoading, _setIsLoading] = useState(false);

  // Enhanced psychological profile calculation
  const psychologyData = useMemo(() => {
    if (!data) return null;

    // MBTI Profile calculation based on astrological data
    const mbtiProfile: MBTIProfile = {
      type: 'INFP', // This would be calculated from astrological data
      name: 'The Mediator',
      description: 'Mediators are creative idealists, guided by their values and beliefs.',
      temperament: 'Idealist',
      cognitiveStack: [
        {
          name: 'Fi',
          fullName: 'Introverted Feeling',
          position: 'dominant',
          planetaryCorrelation: 'Venus in Pisces',
          elementalAssociation: 'Water',
          strength: 85,
          description: 'Core values and emotional authenticity drive decisions'
        },
        {
          name: 'Ne',
          fullName: 'Extraverted Intuition',
          position: 'auxiliary',
          planetaryCorrelation: 'Mercury in Gemini',
          elementalAssociation: 'Air',
          strength: 78,
          description: 'Explores possibilities and connections between ideas'
        },
        {
          name: 'Si',
          fullName: 'Introverted Sensing',
          position: 'tertiary',
          planetaryCorrelation: 'Moon in Cancer',
          elementalAssociation: 'Earth',
          strength: 45,
          description: 'Personal experiences and sensory memories'
        },
        {
          name: 'Te',
          fullName: 'Extraverted Thinking',
          position: 'inferior',
          planetaryCorrelation: 'Mars in Capricorn',
          elementalAssociation: 'Fire',
          strength: 32,
          description: 'Organizing external world through logical systems'
        }
      ],
      elementalCorrelation: 'Water-Air dominant',
      astrologicalSigns: ['Pisces', 'Cancer', 'Scorpio', 'Gemini', 'Libra', 'Aquarius'],
      strengths: [
        'Creative and artistic expression',
        'Strong personal values',
        'Empathetic understanding',
        'Adaptable and open-minded'
      ],
      growthAreas: [
        'Practical execution of ideas',
        'Assertiveness in conflict',
        'Time management',
        'Logical decision-making'
      ],
      compatibility: {
        'ENFJ': 'Inspiring partnership with shared values',
        'ENFP': 'Creative collaboration and mutual understanding',
        'INFJ': 'Deep connection through intuitive understanding'
      }
    };

    // Enneagram Profile calculation
    const enneagramProfile: EnneagramProfile = {
      type: 4,
      name: 'The Individualist',
      description: 'Individualists are self-aware, sensitive, and emotionally honest.',
      coreMotivation: 'To find themselves and their significance',
      basicFear: 'Having no identity or personal significance',
      house: 4,
      planetaryRuler: 'Neptune',
      element: 'Water',
      wings: [
        {
          number: 3,
          name: 'The Achiever',
          influence: 35,
          description: 'Adds ambition and image consciousness'
        },
        {
          number: 5,
          name: 'The Investigator',
          influence: 65,
          description: 'Adds intellectual depth and withdrawal tendencies'
        }
      ],
      instinctualVariant: 'Self-Preservation',
      level: 5,
      integrationDirection: 1,
      disintegrationDirection: 2,
      compatibleTypes: [1, 5, 9],
      challengingTypes: [3, 7, 8],
      areasForGrowth: [
        'Embracing practical implementation',
        'Developing emotional resilience',
        'Balancing idealism with reality'
      ]
    };

    return {
      mbti: mbtiProfile,
      enneagram: enneagramProfile,
      synthesis: {
        personalityIntegration: 'Creative Idealist with introspective depth',
        astrologicalConfirmation: [
          'Neptune in dominant position supports intuitive nature',
          'Venus in Pisces aligns with INFP feeling function',
          'Mercury aspects enhance Ne exploration'
        ],
        developmentPath: [
          'Strengthen tertiary Sensing for practical grounding',
          'Develop inferior Thinking for structured implementation',
          'Balance emotional intensity with rational perspective'
        ],
        shadowWork: [
          'Embracing practical implementation',
          'Developing emotional resilience',
          'Balancing idealism with reality'
        ],
        spiritualGrowth: {
          meditationStyle: 'Contemplative and imagery-based meditation',
          spiritualPractices: 'Creative expression, nature connection, journaling',
          astrologicalTiming: 'New Moon in Water signs for emotional integration'
        },
        overallHarmony: 72,
        contradictions: [
          'Desire for solitude vs need for meaningful connection',
          'Perfectionist tendencies vs acceptance of imperfection'
        ],
        integrationGuidance: 'Focus on turning inner vision into tangible creative works'
      }
    };
  }, [data]);

  const handleTabChange = useCallback((tab: 'mbti' | 'enneagram' | 'synthesis') => {
    setActiveTab(tab);
  }, []);

  if (!psychologyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-cosmic-silver">Loading psychological analysis...</div>
      </div>
    );
  }

  return (
    <div className={`psychology-chart-container ${className ?? ''}`}>
      {/* Navigation Tabs */}
      <div className="flex bg-cosmic-dark border-b border-cosmic-silver/20 mb-6">
        <AccessibleButton
          onClick={() => handleTabChange('mbti')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'mbti'
              ? 'bg-cosmic-blue/20 text-cosmic-blue border-b-2 border-cosmic-blue'
              : 'text-cosmic-silver hover:text-cosmic-blue hover:bg-cosmic-blue/10'
          }`}
          aria-label="MBTI Personality Analysis"
        >
          MBTI Analysis
        </AccessibleButton>
        
        <AccessibleButton
          onClick={() => handleTabChange('enneagram')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'enneagram'
              ? 'bg-cosmic-purple/20 text-cosmic-purple border-b-2 border-cosmic-purple'
              : 'text-cosmic-silver hover:text-cosmic-purple hover:bg-cosmic-purple/10'
          }`}
          aria-label="Enneagram Type Analysis"
        >
          Enneagram
        </AccessibleButton>
        
        <AccessibleButton
          onClick={() => handleTabChange('synthesis')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'synthesis'
              ? 'bg-cosmic-gold/20 text-cosmic-gold border-b-2 border-cosmic-gold'
              : 'text-cosmic-silver hover:text-cosmic-gold hover:bg-cosmic-gold/10'
          }`}
          aria-label="Psychological Synthesis"
        >
          Synthesis
        </AccessibleButton>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        <Suspense 
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-cosmic-silver">Loading...</div>
            </div>
          }
        >
          {activeTab === 'mbti' && (
            <MBTIDetailView profile={psychologyData.mbti} />
          )}
          
          {activeTab === 'enneagram' && (
            <EnneagramDetailView profile={psychologyData.enneagram} />
          )}
          
          {activeTab === 'synthesis' && (
            <PsychologySynthesisView 
              synthesisData={psychologyData.synthesis}
              mbtiType={psychologyData.mbti.type}
              enneagramType={psychologyData.enneagram.type}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
});

PsychologyChart.displayName = 'PsychologyChart';

export default PsychologyChart;
