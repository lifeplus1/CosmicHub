import React, { useState, Suspense, lazy, useCallback, useMemo, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { UnifiedBirthData } from '@cosmichub/types';
import { AccessibleButton } from '@cosmichub/ui';
import { ProgressBar } from '../ui/ProgressBar';
import { trackCosmicHubAIInteraction } from '../../services/analytics';

// Lazy-loaded components for virtualization
const MBTIDetailView = lazy(() => import('./PsychologyChartComponents/MBTIDetailView'));
const EnneagramDetailView = lazy(() => import('./PsychologyChartComponents/EnneagramDetailView'));
const PsychologySynthesisView = lazy(() => import('./PsychologyChartComponents/PsychologySynthesisView'));

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
  sephirahCorrelation: string;
}

// Psychology Chart Data Interface
interface PsychologyChartData {
  description?: string;
  mbti?: {
    profile: MBTIProfile;
    birth_correlation: {
      seasonal_pattern: string;
      elemental_dominance: string;
      planetary_influences: string;
    };
    astrology_synthesis: {
      chart_confirmation: string[];
      contradictions?: string[];
      integration_notes: string;
    };
  };
  enneagram?: {
    profile: EnneagramProfile;
    astrological_correlations: {
      house_themes: string;
      planetary_alignment: string;
      aspect_patterns: string;
    };
    spiritual_development: {
      current_level: string;
      growth_path: string[];
      meditation_focus: string;
    };
  };
  synthesis?: {
    personality_integration: {
      mbti_enneagram_bridge: string;
      spiritual_path_alignment: string;
      growth_recommendations: string[];
    };
    astrological_confirmation: {
      chart_personality_match: number;
      supporting_aspects: string[];
      developmental_timing: Record<string, string>;
    };
    tarot_correspondences?: {
      mbti_cards: Record<string, string>;
      enneagram_cards: Record<number, string>;
      personality_spread: string[];
    };
  };
}

interface PsychologyChartProps {
  data?: PsychologyChartData;
  birthData?: UnifiedBirthData;
  isLoading?: boolean;
}

const PsychologyChart: React.FC<PsychologyChartProps> = ({ 
  data, 
  birthData, 
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState<
    'mbti' | 'enneagram' | 'synthesis' | 'assessment'
  >('mbti');

  // Memoize processed psychology data to prevent unnecessary recalculations
  const processedData = useMemo(() => {
    if (!data) return null;
    
    return {
      mbti: data.mbti,
      enneagram: data.enneagram,
      synthesis: data.synthesis,
      metadata: {
        timestamp: Date.now(),
        isValid: !!(data.mbti && data.enneagram)
      }
    };
  }, [data]);

  // Memoize tab change handler to prevent child re-renders and add analytics
  const _handleTabChange = useCallback((value: 'mbti' | 'enneagram' | 'synthesis' | 'assessment') => {
    const start = performance.now();
    setActiveTab(value);
    
    // Track analytics for psychology tab switches
    try {
      const end = performance.now();
      trackCosmicHubAIInteraction({
        feature: 'multi_system_synthesis',
        input_type: 'selection',
        response_time_ms: Math.round(end - start),
        model_version: 'v1',
      });
    } catch {
      /* swallow analytics errors */
    }
  }, []);

  // Track component mount and data availability
  useEffect(() => {
    if (processedData?.metadata?.isValid) {
      const start = performance.now();
      try {
        const end = performance.now();
        trackCosmicHubAIInteraction({
          feature: 'pattern_recognition',
          input_type: 'selection',
          response_time_ms: Math.round(end - start),
          model_version: 'v1',
        });
      } catch {
        /* swallow analytics errors */
      }
    }
  }, [processedData]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30'>
        <div className='p-6 text-center'>
          <div className='animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-cosmic-silver'>
            Analyzing personality patterns...
          </p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!data) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30'>
        <div className='p-6 text-center'>
          <h3 className='font-bold text-indigo-400 mb-2'>
            🧠 Psychology Integration Ready
          </h3>
          <p className='text-cosmic-silver/70 text-sm mb-4'>
            Complete personality assessments to unlock MBTI and Enneagram insights
            integrated with your astrological profile
          </p>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div className='bg-indigo-900/20 p-3 rounded'>
              <span className='text-indigo-300 font-medium'>🎭 MBTI</span>
              <p className='text-cosmic-silver/60'>
                16 personality types + cognitive functions
              </p>
            </div>
            <div className='bg-purple-900/20 p-3 rounded'>
              <span className='text-purple-300 font-medium'>⭐ Enneagram</span>
              <p className='text-cosmic-silver/60'>
                9 types + wings + spiritual development
              </p>
            </div>
          </div>
          
          <AccessibleButton
            className='mt-4 px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors'
            accessibleName='Take Personality Assessment'
            onClick={() => setActiveTab('assessment')}
          >
            Take Assessment
          </AccessibleButton>
        </div>
      </div>
    );
  }

  return (
    <div className='cosmic-card bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border border-indigo-500/20'>
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-indigo-400 mb-6 flex items-center'>
          <span className='mr-3'>🧠</span>
          Psychology Integration Analysis
          <span className='ml-2 text-xs bg-indigo-500/20 px-2 py-1 rounded-full'>
            PSYCH-001
          </span>
        </h2>

        {/* Tab Navigation */}
        <div className='flex flex-wrap gap-1 mb-6 bg-cosmic-black/30 p-1 rounded-lg'>
          <AccessibleButton
            onClick={() => setActiveTab('mbti')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'mbti'
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30'
                : 'text-cosmic-silver hover:text-indigo-300 hover:bg-indigo-500/10'
            }`}
            accessibleName={`MBTI Analysis Tab${activeTab === 'mbti' ? ' - Active' : ''}`}
          >
            🎭 MBTI
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('enneagram')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'enneagram'
                ? 'bg-purple-500/30 text-purple-300 border border-purple-400/30'
                : 'text-cosmic-silver hover:text-purple-300 hover:bg-purple-500/10'
            }`}
            accessibleName={`Enneagram Tab${activeTab === 'enneagram' ? ' - Active' : ''}`}
          >
            ⭐ Enneagram
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('synthesis')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'synthesis'
                ? 'bg-teal-500/30 text-teal-300 border border-teal-400/30'
                : 'text-cosmic-silver hover:text-teal-300 hover:bg-teal-500/10'
            }`}
            accessibleName={`Synthesis Tab${activeTab === 'synthesis' ? ' - Active' : ''}`}
          >
            🔮 Synthesis
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('assessment')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'assessment'
                ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30'
                : 'text-cosmic-silver hover:text-yellow-300 hover:bg-yellow-500/10'
            }`}
            accessibleName={`Assessment Tab${activeTab === 'assessment' ? ' - Active' : ''}`}
          >
            📋 Assessment
          </AccessibleButton>
        </div>

        {/* Tab Content with Suspense Boundaries */}
        <div className='min-h-96'>
          {activeTab === 'mbti' && (
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full mr-3"></div>
                  <span className="text-indigo-300">Loading MBTI analysis...</span>
                </div>
              }
            >
              <MBTISection data={processedData?.mbti} />
            </Suspense>
          )}
          {activeTab === 'enneagram' && (
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mr-3"></div>
                  <span className="text-purple-300">Loading Enneagram analysis...</span>
                </div>
              }
            >
              <EnneagramSection data={processedData?.enneagram} />
            </Suspense>
          )}
          {activeTab === 'synthesis' && (
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full mr-3"></div>
                  <span className="text-teal-300">Loading synthesis analysis...</span>
                </div>
              }
            >
              <SynthesisSection data={processedData?.synthesis} />
            </Suspense>
          )}
          {activeTab === 'assessment' && (
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mr-3"></div>
                  <span className="text-yellow-300">Loading assessment...</span>
                </div>
              }
            >
              <AssessmentSection />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

// MBTI Section Component
const MBTISection: React.FC<{ 
  data?: PsychologyChartData['mbti'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No MBTI analysis available</div>;
  }

  const profile = data.profile;

  return (
    <div className='space-y-6'>
      {/* MBTI Profile Overview */}
      <div className='bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-semibold text-indigo-300 flex items-center'>
            <span className='mr-2'>🎭</span>
            {profile.type} - {profile.name}
          </h3>
          <span className='text-sm bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full'>
            {profile.temperament}
          </span>
        </div>
        
        <p className='text-cosmic-silver mb-4'>{profile.description}</p>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <h4 className='text-indigo-400 font-medium mb-3'>Elemental Correlation</h4>
            <div className='flex items-center space-x-3 mb-4'>
              <span className='text-lg'>{getElementIcon(profile.elementalCorrelation)}</span>
              <span className='text-cosmic-silver'>{profile.elementalCorrelation}</span>
            </div>
            
            <h4 className='text-indigo-400 font-medium mb-3'>Astrological Affinity</h4>
            <div className='flex flex-wrap gap-2'>
              {profile.astrologicalSigns.map((sign, index) => (
                <span
                  key={index}
                  className='text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded'
                >
                  {sign}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className='text-green-400 font-medium mb-3'>Core Strengths</h4>
            <ul className='text-sm text-cosmic-silver space-y-1 mb-4'>
              {profile.strengths.slice(0, 4).map((strength, index) => (
                <li key={index} className='flex items-start'>
                  <span className='text-green-400 mr-2'>✓</span>
                  {strength}
                </li>
              ))}
            </ul>
            
            <h4 className='text-yellow-400 font-medium mb-3'>Growth Areas</h4>
            <ul className='text-sm text-cosmic-silver space-y-1'>
              {profile.growthAreas.slice(0, 3).map((area, index) => (
                <li key={index} className='flex items-start'>
                  <span className='text-yellow-400 mr-2'>→</span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Cognitive Functions */}
      <div className='bg-gradient-to-br from-indigo-900/10 to-blue-900/10 border border-indigo-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-indigo-300 mb-4 flex items-center'>
          <span className='mr-2'>⚙️</span>
          Cognitive Function Stack
        </h3>
        
        <div className='space-y-4'>
          {profile.cognitiveStack.map((func, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                func.position === 'dominant' ? 'bg-blue-900/20 border-blue-500/30' :
                func.position === 'auxiliary' ? 'bg-indigo-900/20 border-indigo-500/30' :
                func.position === 'tertiary' ? 'bg-purple-900/20 border-purple-500/30' :
                'bg-gray-900/20 border-gray-500/30'
              }`}
            >
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center space-x-3'>
                  <span className='font-mono text-lg font-bold text-white'>
                    {func.name}
                  </span>
                  <span className='text-sm text-cosmic-silver'>
                    {func.fullName}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    func.position === 'dominant' ? 'bg-blue-500/20 text-blue-300' :
                    func.position === 'auxiliary' ? 'bg-indigo-500/20 text-indigo-300' :
                    func.position === 'tertiary' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {func.position}
                  </span>
                </div>
                
                <div className='text-sm text-cosmic-silver'>
                  <span className='text-yellow-400'>{func.planetaryCorrelation}</span>
                  <span className='mx-2'>•</span>
                  <span className='text-green-400'>{func.elementalAssociation}</span>
                </div>
              </div>
              
              <p className='text-sm text-cosmic-silver mb-2'>{func.description}</p>
              
              {/* Strength indicator */}
              <div className='flex items-center space-x-2'>
                <span className='text-xs text-cosmic-silver'>Strength:</span>
                <ProgressBar 
                  progress={func.strength}
                  className="w-24"
                  color={
                    func.position === 'dominant' ? 'bg-blue-500' :
                    func.position === 'auxiliary' ? 'bg-indigo-500' :
                    func.position === 'tertiary' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }
                />
                <span className='text-xs text-cosmic-silver'>{func.strength}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Astrological Synthesis */}
      {data.astrology_synthesis && (
        <div className='bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-yellow-300 mb-4 flex items-center'>
            <span className='mr-2'>🌟</span>
            Astrological Synthesis
          </h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Chart Confirmations</h4>
              <ul className='space-y-2'>
                {data.astrology_synthesis.chart_confirmation.map((confirmation, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-green-400 mr-2'>✓</span>
                    <span className='text-cosmic-silver'>{confirmation}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {data.astrology_synthesis.contradictions && (
              <div>
                <h4 className='text-orange-400 font-medium mb-3'>Areas of Tension</h4>
                <ul className='space-y-2'>
                  {data.astrology_synthesis.contradictions.map((contradiction, index) => (
                    <li key={index} className='flex items-start text-sm'>
                      <span className='text-orange-400 mr-2'>⚠️</span>
                      <span className='text-cosmic-silver'>{contradiction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className='mt-4 p-4 bg-cosmic-black/20 rounded-lg'>
            <h4 className='text-yellow-400 font-medium mb-2'>Integration Notes</h4>
            <p className='text-cosmic-silver text-sm'>{data.astrology_synthesis.integration_notes}</p>
          </div>
        </div>
      )}

      {/* Birth Correlation */}
      {data.birth_correlation && (
        <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-4'>
          <h3 className='text-purple-300 font-semibold mb-3 flex items-center'>
            <span className='mr-2'>🌸</span>
            Birth Pattern Correlations
          </h3>
          <div className='grid md:grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='text-purple-400 font-medium'>Seasonal Pattern:</span>
              <p className='text-cosmic-silver'>{data.birth_correlation.seasonal_pattern}</p>
            </div>
            <div>
              <span className='text-purple-400 font-medium'>Elemental Dominance:</span>
              <p className='text-cosmic-silver'>{data.birth_correlation.elemental_dominance}</p>
            </div>
            <div>
              <span className='text-purple-400 font-medium'>Planetary Influences:</span>
              <p className='text-cosmic-silver'>{data.birth_correlation.planetary_influences}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enneagram Section Component
const EnneagramSection: React.FC<{ 
  data?: PsychologyChartData['enneagram'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No Enneagram analysis available</div>;
  }

  const profile = data.profile;

  return (
    <div className='space-y-6'>
      {/* Enneagram Profile Overview */}
      <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xl font-semibold text-purple-300 flex items-center'>
            <span className='mr-2'>⭐</span>
            Type {profile.type} - {profile.name}
          </h3>
          <div className='flex items-center space-x-2'>
            <span className='text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full'>
              House {profile.house}
            </span>
            <span className='text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full'>
              Level {profile.level}
            </span>
          </div>
        </div>
        
        <p className='text-cosmic-silver mb-4'>{profile.description}</p>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <div className='mb-4'>
              <h4 className='text-purple-400 font-medium mb-2'>Core Motivation</h4>
              <p className='text-cosmic-silver text-sm'>{profile.coreMotivation}</p>
            </div>
            
            <div className='mb-4'>
              <h4 className='text-red-400 font-medium mb-2'>Basic Fear</h4>
              <p className='text-cosmic-silver text-sm'>{profile.basicFear}</p>
            </div>
            
            <div className='mb-4'>
              <h4 className='text-blue-400 font-medium mb-2'>Instinctual Variant</h4>
              <span className='text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded'>
                {profile.instinctualVariant}
              </span>
            </div>
          </div>
          
          <div>
            <div className='mb-4'>
              <h4 className='text-yellow-400 font-medium mb-2'>Planetary Ruler</h4>
              <div className='flex items-center space-x-2'>
                <span className='text-cosmic-silver'>{profile.planetaryRuler}</span>
                <span className='text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded'>
                  {profile.element}
                </span>
              </div>
            </div>
            
            <div className='mb-4'>
              <h4 className='text-green-400 font-medium mb-2'>Sephirah Correlation</h4>
              <p className='text-cosmic-silver text-sm'>{profile.sephirahCorrelation}</p>
            </div>
            
            <div className='flex items-center space-x-4 text-sm'>
              <div>
                <span className='text-green-400'>Integration (→{profile.integrationDirection})</span>
              </div>
              <div>
                <span className='text-red-400'>Disintegration (→{profile.disintegrationDirection})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wings Analysis */}
      <div className='bg-gradient-to-br from-purple-900/10 to-pink-900/10 border border-purple-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-purple-300 mb-4 flex items-center'>
          <span className='mr-2'>🦋</span>
          Wings Analysis
        </h3>
        
        <div className='grid md:grid-cols-2 gap-4'>
          {profile.wings.map((wing, index) => (
            <div
              key={index}
              className='p-4 bg-cosmic-black/20 border border-pink-500/20 rounded-lg'
            >
              <div className='flex items-center justify-between mb-2'>
                <h4 className='text-pink-300 font-medium'>
                  Type {wing.number} - {wing.name}
                </h4>
                <div className='flex items-center space-x-2'>
                  <ProgressBar 
                    progress={wing.influence}
                    className="w-16"
                    color="bg-pink-500"
                  />
                  <span className='text-xs text-pink-400'>{wing.influence}%</span>
                </div>
              </div>
              <p className='text-cosmic-silver text-sm'>{wing.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Astrological Correlations */}
      {data.astrological_correlations && (
        <div className='bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-yellow-300 mb-4 flex items-center'>
            <span className='mr-2'>🌟</span>
            Astrological Correlations
          </h3>
          
          <div className='space-y-4'>
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-yellow-400 font-medium mb-2'>House {profile.house} Themes</h4>
              <p className='text-cosmic-silver text-sm'>{data.astrological_correlations.house_themes}</p>
            </div>
            
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-yellow-400 font-medium mb-2'>Planetary Alignment</h4>
              <p className='text-cosmic-silver text-sm'>{data.astrological_correlations.planetary_alignment}</p>
            </div>
            
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-yellow-400 font-medium mb-2'>Aspect Patterns</h4>
              <p className='text-cosmic-silver text-sm'>{data.astrological_correlations.aspect_patterns}</p>
            </div>
          </div>
        </div>
      )}

      {/* Spiritual Development */}
      {data.spiritual_development && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-green-300 mb-4 flex items-center'>
            <span className='mr-2'>🌱</span>
            Spiritual Development Path
          </h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Current Level</h4>
              <p className='text-cosmic-silver text-sm mb-4'>{data.spiritual_development.current_level}</p>
              
              <h4 className='text-blue-400 font-medium mb-3'>Meditation Focus</h4>
              <p className='text-cosmic-silver text-sm'>{data.spiritual_development.meditation_focus}</p>
            </div>
            
            <div>
              <h4 className='text-purple-400 font-medium mb-3'>Growth Path</h4>
              <ul className='space-y-2'>
                {data.spiritual_development.growth_path.map((step, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-purple-400 mr-2'>{index + 1}.</span>
                    <span className='text-cosmic-silver'>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Synthesis Section Component
const SynthesisSection: React.FC<{ 
  data?: PsychologyChartData['synthesis'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No synthesis data available</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Personality Integration */}
      {data.personality_integration && (
        <div className='bg-teal-900/10 border border-teal-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-teal-300 mb-4 flex items-center'>
            <span className='mr-2'>🔮</span>
            Personality Integration Analysis
          </h3>
          
          <div className='space-y-4'>
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-teal-400 font-medium mb-2'>MBTI-Enneagram Bridge</h4>
              <p className='text-cosmic-silver text-sm'>{data.personality_integration.mbti_enneagram_bridge}</p>
            </div>
            
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-teal-400 font-medium mb-2'>Spiritual Path Alignment</h4>
              <p className='text-cosmic-silver text-sm'>{data.personality_integration.spiritual_path_alignment}</p>
            </div>
            
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-green-400 font-medium mb-3'>Growth Recommendations</h4>
              <ul className='space-y-2'>
                {data.personality_integration.growth_recommendations.map((rec, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-green-400 mr-2'>✓</span>
                    <span className='text-cosmic-silver'>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Astrological Confirmation */}
      {data.astrological_confirmation && (
        <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-300 mb-4 flex items-center'>
            <span className='mr-2'>⭐</span>
            Astrological Confirmation
          </h3>
          
          <div className='mb-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-blue-400 font-medium'>Chart-Personality Match</span>
              <span className='text-lg font-bold text-blue-300'>
                {data.astrological_confirmation.chart_personality_match}%
              </span>
            </div>
            <ProgressBar 
              progress={data.astrological_confirmation.chart_personality_match}
              className="w-full h-3"
              color="bg-blue-500"
            />
          </div>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Supporting Aspects</h4>
              <ul className='space-y-2'>
                {data.astrological_confirmation.supporting_aspects.map((aspect, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-green-400 mr-2'>✓</span>
                    <span className='text-cosmic-silver'>{aspect}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-purple-400 font-medium mb-3'>Developmental Timing</h4>
              <div className='space-y-2'>
                {Object.entries(data.astrological_confirmation.developmental_timing).map(([period, description], index) => (
                  <div key={index} className='flex justify-between items-start text-sm'>
                    <span className='text-purple-400 font-medium'>{period}:</span>
                    <span className='text-cosmic-silver text-right'>{description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarot Correspondences */}
      {data.tarot_correspondences && (
        <div className='bg-violet-900/10 border border-violet-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-violet-300 mb-4 flex items-center'>
            <span className='mr-2'>🃏</span>
            Tarot Correspondences
          </h3>
          
          <div className='grid md:grid-cols-3 gap-6'>
            {data.tarot_correspondences.mbti_cards && Object.keys(data.tarot_correspondences.mbti_cards).length > 0 && (
              <div>
                <h4 className='text-violet-400 font-medium mb-3'>MBTI Cards</h4>
                <div className='space-y-2'>
                  {Object.entries(data.tarot_correspondences.mbti_cards).map(([func, card], index) => (
                    <div key={index} className='text-sm'>
                      <span className='text-violet-300 font-mono'>{func}:</span>
                      <span className='text-cosmic-silver ml-2'>{card}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {data.tarot_correspondences.enneagram_cards && Object.keys(data.tarot_correspondences.enneagram_cards).length > 0 && (
              <div>
                <h4 className='text-violet-400 font-medium mb-3'>Enneagram Cards</h4>
                <div className='space-y-2'>
                  {Object.entries(data.tarot_correspondences.enneagram_cards).map(([type, card], index) => (
                    <div key={index} className='text-sm'>
                      <span className='text-violet-300'>Type {type}:</span>
                      <span className='text-cosmic-silver ml-2'>{card}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {data.tarot_correspondences.personality_spread && (
              <div>
                <h4 className='text-violet-400 font-medium mb-3'>Personality Spread</h4>
                <div className='space-y-1'>
                  {data.tarot_correspondences.personality_spread.map((card, index) => (
                    <div key={index} className='text-sm text-cosmic-silver'>
                      {index + 1}. {card}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Assessment Section Component
const AssessmentSection: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='bg-gradient-to-br from-yellow-900/10 to-orange-900/10 border border-yellow-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-yellow-300 mb-4 flex items-center'>
          <span className='mr-2'>📋</span>
          Personality Assessments
        </h3>
        
        <p className='text-cosmic-silver mb-6'>
          Complete these assessments to unlock personalized psychology-astrology integrations.
          All assessments are optional and results are stored locally for your privacy.
        </p>
        
        <div className='grid md:grid-cols-2 gap-6'>
          {/* MBTI Assessment */}
          <div className='p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-lg'>
            <h4 className='text-indigo-300 font-semibold mb-3 flex items-center'>
              <span className='mr-2'>🎭</span>
              MBTI Assessment
            </h4>
            <p className='text-cosmic-silver text-sm mb-4'>
              Discover your 4-letter personality type and cognitive function stack based on
              Jung's psychological types theory.
            </p>
            <ul className='text-xs text-cosmic-silver/70 space-y-1 mb-4'>
              <li>• 64 questions, ~15 minutes</li>
              <li>• Cognitive functions analysis</li>
              <li>• Astrological correlations</li>
              <li>• Birth pattern insights</li>
            </ul>
            <AccessibleButton
              className='w-full py-2 px-4 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors'
              accessibleName='Start MBTI Assessment'
            >
              Start Assessment
            </AccessibleButton>
          </div>
          
          {/* Enneagram Assessment */}
          <div className='p-6 bg-purple-900/20 border border-purple-500/30 rounded-lg'>
            <h4 className='text-purple-300 font-semibold mb-3 flex items-center'>
              <span className='mr-2'>⭐</span>
              Enneagram Assessment
            </h4>
            <p className='text-cosmic-silver text-sm mb-4'>
              Uncover your core motivation, fears, and spiritual development path through
              the nine-point personality system.
            </p>
            <ul className='text-xs text-cosmic-silver/70 space-y-1 mb-4'>
              <li>• 108 questions, ~20 minutes</li>
              <li>• Wings & instincts analysis</li>
              <li>• House correlations</li>
              <li>• Sephirah connections</li>
            </ul>
            <AccessibleButton
              className='w-full py-2 px-4 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors'
              accessibleName='Start Enneagram Assessment'
            >
              Start Assessment
            </AccessibleButton>
          </div>
        </div>
        
        {/* Quick Assessment */}
        <div className='mt-6 p-4 bg-teal-900/20 border border-teal-500/30 rounded-lg'>
          <h4 className='text-teal-300 font-medium mb-2 flex items-center'>
            <span className='mr-2'>⚡</span>
            Quick Assessment (5 minutes)
          </h4>
          <p className='text-cosmic-silver text-sm mb-3'>
            Get preliminary insights while you decide on the full assessments.
          </p>
          <AccessibleButton
            className='py-2 px-4 bg-teal-500/20 text-teal-300 rounded-lg hover:bg-teal-500/30 transition-colors'
            accessibleName='Take Quick Assessment'
          >
            Quick Start
          </AccessibleButton>
        </div>
      </div>
    </div>
  );
};

// Helper function for element icons
const getElementIcon = (element: string): string => {
  const iconMap: Record<string, string> = {
    'Fire': '🔥',
    'Earth': '🌍',
    'Air': '💨',
    'Water': '🌊'
  };
  return iconMap[element] ?? '⭐';
};

// Memoized component to prevent unnecessary re-renders
const MemoizedPsychologyChart = React.memo(PsychologyChart);

export default MemoizedPsychologyChart;
export { PsychologyChart };
export type { PsychologyChartData, PsychologyChartProps };
