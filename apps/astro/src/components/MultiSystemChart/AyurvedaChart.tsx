import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { UnifiedBirthData } from '@cosmichub/types';
import { AccessibleButton } from '@cosmichub/ui';

// Ayurveda Data Types
interface DoshaProfile {
  name: 'Vata' | 'Pitta' | 'Kapha';
  percentage: number;
  state: 'balanced' | 'excess' | 'deficient';
  qualities: string[];
  planetaryRuler: string;
  elementCorrelation: string;
  seasonalPeak: string;
  timeOfDay: string;
  characteristics: string[];
  imbalanceSymptoms: string[];
  balancingPractices: string[];
}

interface ConstitutionalAnalysis {
  prakruti: {
    primary_dosha: DoshaProfile;
    secondary_dosha?: DoshaProfile;
    constitution_type: string;
    birth_constitution_summary: string;
  };
  vikruti: {
    current_state: string;
    imbalances: string[];
    seasonal_factors: string[];
    lifestyle_factors: string[];
  };
}

interface PlanetaryHealth {
  planet: string;
  bodySystem: string;
  doshicInfluence: string;
  astrological_placement: string;
  health_correlation: string;
  preventive_measures: string[];
  optimal_timing: string;
}

interface AyurvedaChartData {
  description?: string;
  constitutional_analysis?: ConstitutionalAnalysis;
  doshas_analysis?: {
    detailed_breakdown: DoshaProfile[];
    seasonal_variations: Record<string, string>;
    daily_rhythms: Record<string, string>;
    life_stage_considerations: string;
  };
  planetary_health?: {
    correlations: PlanetaryHealth[];
    birth_chart_health_map: string;
    vulnerable_periods: Record<string, string>;
  };
  wellness_plan?: {
    personalized_diet: {
      foods_to_favor: string[];
      foods_to_avoid: string[];
      seasonal_adjustments: Record<string, string[]>;
    };
    lifestyle_recommendations: {
      daily_routine: string[];
      exercise_guidelines: string[];
      sleep_optimization: string[];
    };
    herbal_support: {
      constitutional_herbs: string[];
      seasonal_herbs: Record<string, string[]>;
      contraindications: string[];
    };
  };
  synthesis?: {
    ayurveda_astrology_integration: string;
    dharmic_alignment: string;
    spiritual_development_path: string[];
    karmic_health_patterns: string;
  };
}

interface AyurvedaChartProps {
  data?: AyurvedaChartData;
  birthData?: UnifiedBirthData;
  isLoading?: boolean;
}

const AyurvedaChart: React.FC<AyurvedaChartProps> = ({ 
  data, 
  birthData: _birthData, 
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState<
    'constitution' | 'doshas' | 'planetary' | 'wellness' | 'synthesis'
  >('constitution');

  // Handle loading state
  if (isLoading) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30'>
        <div className='p-6 text-center'>
          <div className='animate-spin w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-cosmic-silver'>
            Analyzing Ayurvedic constitution and doshas...
          </p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!data) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-500/30'>
        <div className='p-6 text-center'>
          <h3 className='font-bold text-orange-400 mb-2'>
            🕉️ Ayurveda Analysis Ready
          </h3>
          <p className='text-cosmic-silver/70 text-sm mb-4'>
            Enter your birth details to receive personalized Ayurvedic constitutional analysis
            based on doshas, planetary health correlations, and dharmic alignment
          </p>
          <div className='grid grid-cols-3 gap-3 text-xs'>
            <div className='bg-orange-900/20 p-3 rounded'>
              <span className='text-orange-300 font-medium'>💨 Vata</span>
              <p className='text-cosmic-silver/60'>
                Air + Space elements
              </p>
            </div>
            <div className='bg-red-900/20 p-3 rounded'>
              <span className='text-red-300 font-medium'>🔥 Pitta</span>
              <p className='text-cosmic-silver/60'>
                Fire + Water elements
              </p>
            </div>
            <div className='bg-green-900/20 p-3 rounded'>
              <span className='text-green-300 font-medium'>🌍 Kapha</span>
              <p className='text-cosmic-silver/60'>
                Earth + Water elements
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='cosmic-card bg-gradient-to-br from-orange-900/10 to-yellow-900/10 border border-orange-500/20'>
      <div className='p-6'>
        <h2 className='text-2xl font-bold text-orange-400 mb-6 flex items-center'>
          <span className='mr-3'>🕉️</span>
          Ayurveda Constitutional Analysis
          <span className='ml-2 text-xs bg-orange-500/20 px-2 py-1 rounded-full'>
            AYU-001
          </span>
        </h2>

        {/* Tab Navigation */}
        <div className='flex flex-wrap gap-1 mb-6 bg-cosmic-black/30 p-1 rounded-lg'>
          <AccessibleButton
            onClick={() => setActiveTab('constitution')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'constitution'
                ? 'bg-orange-500/30 text-orange-300 border border-orange-400/30'
                : 'text-cosmic-silver hover:text-orange-300 hover:bg-orange-500/10'
            }`}
            accessibleName={`Constitution Analysis Tab${activeTab === 'constitution' ? ' - Active' : ''}`}
          >
            🧬 Constitution
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('doshas')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'doshas'
                ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30'
                : 'text-cosmic-silver hover:text-yellow-300 hover:bg-yellow-500/10'
            }`}
            accessibleName={`Doshas Analysis Tab${activeTab === 'doshas' ? ' - Active' : ''}`}
          >
            ⚖️ Doshas
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('planetary')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'planetary'
                ? 'bg-purple-500/30 text-purple-300 border border-purple-400/30'
                : 'text-cosmic-silver hover:text-purple-300 hover:bg-purple-500/10'
            }`}
            accessibleName={`Planetary Health Tab${activeTab === 'planetary' ? ' - Active' : ''}`}
          >
            🪐 Planetary Health
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('wellness')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'wellness'
                ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                : 'text-cosmic-silver hover:text-green-300 hover:bg-green-500/10'
            }`}
            accessibleName={`Wellness Plan Tab${activeTab === 'wellness' ? ' - Active' : ''}`}
          >
            🌱 Wellness Plan
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('synthesis')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'synthesis'
                ? 'bg-purple-500/30 text-purple-300 border border-purple-400/30'
                : 'text-cosmic-silver hover:text-purple-300 hover:bg-purple-500/10'
            }`}
            accessibleName={`Synthesis Tab${activeTab === 'synthesis' ? ' - Active' : ''}`}
          >
            🔮 Synthesis
          </AccessibleButton>
        </div>

        {/* Tab Content */}
        <div className='min-h-96'>
          {activeTab === 'constitution' && (
            <ConstitutionSection data={data.constitutional_analysis} />
          )}
          {activeTab === 'doshas' && (
            <DoshasSection data={data.doshas_analysis} />
          )}
          {activeTab === 'planetary' && (
            <PlanetaryHealthSection data={data.planetary_health} />
          )}
          {activeTab === 'wellness' && (
            <WellnessPlanSection data={data.wellness_plan} />
          )}
          {activeTab === 'synthesis' && (
            <SynthesisSection data={data.synthesis} />
          )}
        </div>
      </div>
    </div>
  );
};

// Constitution Section Component
const ConstitutionSection: React.FC<{ 
  data?: ConstitutionalAnalysis 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No constitutional analysis available</div>;
  }

  const { prakruti, vikruti } = data;

  return (
    <div className='space-y-6'>
      {/* Prakruti (Birth Constitution) */}
      <div className='bg-orange-900/10 border border-orange-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-orange-300 mb-4 flex items-center'>
          <span className='mr-2'>🌟</span>
          Prakruti (Birth Constitution)
        </h3>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <div className='mb-4'>
              <h4 className='text-orange-400 font-medium mb-2'>Primary Dosha</h4>
              <div className='p-4 bg-cosmic-black/20 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-lg font-semibold text-orange-300'>
                    {getDoshaIcon(prakruti.primary_dosha.name)} {prakruti.primary_dosha.name}
                  </span>
                  <span className='text-orange-400 text-lg font-bold'>
                    {prakruti.primary_dosha.percentage}%
                  </span>
                </div>
                
                <div className='mb-3'>
                  <div className='w-full bg-gray-700 rounded-full h-3 relative overflow-hidden'>
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getDoshaColor(prakruti.primary_dosha.name)}`}
                      data-width={prakruti.primary_dosha.percentage}
                    ></div>
                  </div>
                </div>
                
                <div className='text-sm text-cosmic-silver space-y-1'>
                  <p><span className='text-orange-400 font-medium'>Planetary Ruler:</span> {prakruti.primary_dosha.planetaryRuler}</p>
                  <p><span className='text-orange-400 font-medium'>Element:</span> {prakruti.primary_dosha.elementCorrelation}</p>
                  <p><span className='text-orange-400 font-medium'>Peak Season:</span> {prakruti.primary_dosha.seasonalPeak}</p>
                  <p><span className='text-orange-400 font-medium'>Peak Time:</span> {prakruti.primary_dosha.timeOfDay}</p>
                </div>
              </div>
            </div>
            
            <div className='mb-4'>
              <h4 className='text-orange-400 font-medium mb-3'>Constitutional Qualities</h4>
              <div className='flex flex-wrap gap-2'>
                {prakruti.primary_dosha.qualities.map((quality, index) => (
                  <span
                    key={index}
                    className='text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded'
                  >
                    {quality}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className='mb-4'>
              <h4 className='text-green-400 font-medium mb-3'>Inherent Characteristics</h4>
              <ul className='text-sm text-cosmic-silver space-y-1'>
                {prakruti.primary_dosha.characteristics.slice(0, 5).map((characteristic, index) => (
                  <li key={index} className='flex items-start'>
                    <span className='text-green-400 mr-2'>✓</span>
                    {characteristic}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-blue-400 font-medium mb-3'>Constitutional Type</h4>
              <p className='text-cosmic-silver text-sm mb-3'>{prakruti.constitution_type}</p>
              
              <div className='p-3 bg-cosmic-black/20 rounded-lg'>
                <p className='text-cosmic-silver text-sm'>{prakruti.birth_constitution_summary}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Dosha */}
        {prakruti.secondary_dosha && (
          <div className='mt-6 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg'>
            <h4 className='text-yellow-300 font-medium mb-2 flex items-center'>
              <span className='mr-2'>⭐</span>
              Secondary Dosha: {prakruti.secondary_dosha.name} ({prakruti.secondary_dosha.percentage}%)
            </h4>
            <p className='text-cosmic-silver text-sm'>
              Provides balancing influence through {prakruti.secondary_dosha.elementCorrelation} qualities
            </p>
          </div>
        )}
      </div>

      {/* Vikruti (Current State) */}
      <div className='bg-red-900/10 border border-red-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-red-300 mb-4 flex items-center'>
          <span className='mr-2'>🌡️</span>
          Vikruti (Current State)
        </h3>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <div className='mb-4'>
              <h4 className='text-red-400 font-medium mb-3'>Current Imbalances</h4>
              {vikruti.imbalances.length > 0 ? (
                <ul className='space-y-2'>
                  {vikruti.imbalances.map((imbalance, index) => (
                    <li key={index} className='flex items-start text-sm'>
                      <span className='text-red-400 mr-2'>⚠️</span>
                      <span className='text-cosmic-silver'>{imbalance}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-green-400 text-sm'>✓ Constitution appears balanced</p>
              )}
            </div>
            
            <div>
              <h4 className='text-yellow-400 font-medium mb-3'>Seasonal Factors</h4>
              <ul className='space-y-1'>
                {vikruti.seasonal_factors.map((factor, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-yellow-400 mr-2'>🌸</span>
                    <span className='text-cosmic-silver'>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <div className='mb-4'>
              <h4 className='text-blue-400 font-medium mb-3'>Lifestyle Factors</h4>
              <ul className='space-y-1'>
                {vikruti.lifestyle_factors.map((factor, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-blue-400 mr-2'>🔄</span>
                    <span className='text-cosmic-silver'>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className='p-4 bg-cosmic-black/20 rounded-lg'>
              <h4 className='text-red-400 font-medium mb-2'>Current State Summary</h4>
              <p className='text-cosmic-silver text-sm'>{vikruti.current_state}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Doshas Analysis Section Component
const DoshasSection: React.FC<{ 
  data?: AyurvedaChartData['doshas_analysis'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No doshas analysis available</div>;
  }

  const doshas = data.detailed_breakdown ?? [];

  return (
    <div className='space-y-6'>
      {/* Three Doshas Overview */}
      <div className='bg-gradient-to-br from-orange-900/10 to-red-900/10 border border-orange-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-orange-300 mb-4 flex items-center'>
          <span className='mr-2'>⚖️</span>
          Three Doshas Analysis
        </h3>
        
        <div className='grid md:grid-cols-3 gap-4'>
          {doshas.map((dosha, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                dosha.name === 'Vata' ? 'bg-gray-900/20 border-gray-500/30' :
                dosha.name === 'Pitta' ? 'bg-red-900/20 border-red-500/30' :
                'bg-green-900/20 border-green-500/30'
              }`}
            >
              <div className='text-center mb-4'>
                <div className='text-2xl mb-2'>{getDoshaIcon(dosha.name)}</div>
                <h4 className={`text-lg font-semibold mb-1 ${
                  dosha.name === 'Vata' ? 'text-gray-300' :
                  dosha.name === 'Pitta' ? 'text-red-300' :
                  'text-green-300'
                }`}>
                  {dosha.name}
                </h4>
                <p className='text-xs text-cosmic-silver'>{dosha.elementCorrelation}</p>
              </div>
              
              {/* Dosha percentage */}
              <div className='mb-4'>
                <div className='flex justify-between items-center mb-1'>
                  <span className='text-sm text-cosmic-silver'>Percentage</span>
                  <span className={`text-sm font-bold ${
                    dosha.name === 'Vata' ? 'text-gray-300' :
                    dosha.name === 'Pitta' ? 'text-red-300' :
                    'text-green-300'
                  }`}>
                    {dosha.percentage}%
                  </span>
                </div>
                <div className='w-full bg-gray-700 rounded-full h-2 relative overflow-hidden'>
                  <div
                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getDoshaColor(dosha.name)}`}
                    data-width={dosha.percentage}
                  ></div>
                </div>
                <div className='mt-1 text-center'>
                  <span className={`text-xs px-2 py-1 rounded ${
                    dosha.state === 'balanced' ? 'bg-green-500/20 text-green-300' :
                    dosha.state === 'excess' ? 'bg-red-500/20 text-red-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {dosha.state}
                  </span>
                </div>
              </div>
              
              {/* Time correlations */}
              <div className='text-xs text-cosmic-silver space-y-1 mb-3'>
                <p><span className='font-medium'>Peak Season:</span> {dosha.seasonalPeak}</p>
                <p><span className='font-medium'>Peak Time:</span> {dosha.timeOfDay}</p>
                <p><span className='font-medium'>Planetary Ruler:</span> {dosha.planetaryRuler}</p>
              </div>
              
              {/* Balancing practices preview */}
              <div>
                <h5 className={`text-xs font-medium mb-2 ${
                  dosha.name === 'Vata' ? 'text-gray-400' :
                  dosha.name === 'Pitta' ? 'text-red-400' :
                  'text-green-400'
                }`}>
                  Balancing Practices
                </h5>
                <div className='flex flex-wrap gap-1'>
                  {dosha.balancingPractices.slice(0, 3).map((practice, practiceIndex) => (
                    <span
                      key={practiceIndex}
                      className={`text-xs px-1 py-0.5 rounded ${
                        dosha.name === 'Vata' ? 'bg-gray-500/20 text-gray-300' :
                        dosha.name === 'Pitta' ? 'bg-red-500/20 text-red-300' :
                        'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {practice}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Variations */}
      {data.seasonal_variations && Object.keys(data.seasonal_variations).length > 0 && (
        <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-300 mb-4 flex items-center'>
            <span className='mr-2'>🌸</span>
            Seasonal Variations
          </h3>
          
          <div className='grid md:grid-cols-2 gap-4'>
            {Object.entries(data.seasonal_variations).map(([season, variation], index) => (
              <div key={index} className='p-4 bg-cosmic-black/20 rounded-lg'>
                <h4 className='text-blue-400 font-medium mb-2'>{season}</h4>
                <p className='text-cosmic-silver text-sm'>{variation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Rhythms */}
      {data.daily_rhythms && Object.keys(data.daily_rhythms).length > 0 && (
        <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-purple-300 mb-4 flex items-center'>
            <span className='mr-2'>🕐</span>
            Daily Doshic Rhythms
          </h3>
          
          <div className='space-y-3'>
            {Object.entries(data.daily_rhythms).map(([timeOfDay, rhythm], index) => (
              <div key={index} className='flex justify-between items-center p-3 bg-cosmic-black/20 rounded-lg'>
                <span className='text-purple-400 font-medium'>{timeOfDay}</span>
                <span className='text-cosmic-silver text-sm'>{rhythm}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Life Stage Considerations */}
      {data.life_stage_considerations && (
        <div className='bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-4'>
          <h3 className='text-yellow-300 font-semibold mb-3 flex items-center'>
            <span className='mr-2'>🌱</span>
            Life Stage Considerations
          </h3>
          <p className='text-cosmic-silver text-sm'>{data.life_stage_considerations}</p>
        </div>
      )}
    </div>
  );
};

// Planetary Health Section Component
const PlanetaryHealthSection: React.FC<{ 
  data?: AyurvedaChartData['planetary_health'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No planetary health analysis available</div>;
  }

  const correlations = data.correlations ?? [];

  return (
    <div className='space-y-6'>
      {/* Birth Chart Health Map */}
      <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-purple-300 mb-4 flex items-center'>
          <span className='mr-2'>🗺️</span>
          Birth Chart Health Mapping
        </h3>
        <p className='text-cosmic-silver'>{data.birth_chart_health_map}</p>
      </div>

      {/* Planetary Health Correlations */}
      <div className='space-y-4'>
        <h3 className='text-purple-300 font-semibold flex items-center'>
          <span className='mr-2'>🪐</span>
          Planetary Health Correlations
        </h3>
        
        <Accordion.Root type="multiple" className="space-y-2">
          {correlations.map((correlation, index) => (
            <Accordion.Item
              key={index}
              value={`planet-${index}`}
              className="bg-cosmic-black/20 border border-purple-500/20 rounded-lg overflow-hidden"
            >
              <Accordion.Header>
                <Accordion.Trigger className="w-full flex items-center justify-between p-4 text-left hover:bg-purple-900/20 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <span className="text-lg">{getPlanetIcon(correlation.planet)}</span>
                    <div className="flex flex-col">
                      <span className="text-purple-300 font-medium">{correlation.planet}</span>
                      <span className="text-xs text-cosmic-silver">
                        {correlation.bodySystem} • {correlation.doshicInfluence}
                      </span>
                    </div>
                  </div>
                  
                  <ChevronDownIcon className="w-5 h-5 text-cosmic-silver transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              
              <Accordion.Content className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-purple-400 font-medium mb-2">Astrological Placement</h4>
                      <p className="text-cosmic-silver text-sm">{correlation.astrological_placement}</p>
                    </div>
                    <div>
                      <h4 className="text-purple-400 font-medium mb-2">Health Correlation</h4>
                      <p className="text-cosmic-silver text-sm">{correlation.health_correlation}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">Preventive Measures</h4>
                    <ul className="space-y-1">
                      {correlation.preventive_measures.map((measure, measureIndex) => (
                        <li key={measureIndex} className="flex items-start text-sm">
                          <span className="text-green-400 mr-2">✓</span>
                          <span className="text-cosmic-silver">{measure}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-blue-900/20 rounded-lg">
                    <h4 className="text-blue-400 font-medium mb-2">Optimal Timing</h4>
                    <p className="text-cosmic-silver text-sm">{correlation.optimal_timing}</p>
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>

      {/* Vulnerable Periods */}
      {data.vulnerable_periods && Object.keys(data.vulnerable_periods).length > 0 && (
        <div className='bg-red-900/10 border border-red-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-red-300 mb-4 flex items-center'>
            <span className='mr-2'>⚠️</span>
            Vulnerable Periods
          </h3>
          
          <div className='space-y-3'>
            {Object.entries(data.vulnerable_periods).map(([period, description], index) => (
              <div key={index} className='flex items-start justify-between p-3 bg-cosmic-black/20 rounded-lg'>
                <div className='flex-1'>
                  <span className='text-red-400 font-medium'>{period}</span>
                  <p className='text-cosmic-silver text-sm mt-1'>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Wellness Plan Section Component
const WellnessPlanSection: React.FC<{ 
  data?: AyurvedaChartData['wellness_plan'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No wellness plan available</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Personalized Diet */}
      {data.personalized_diet && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-green-300 mb-4 flex items-center'>
            <span className='mr-2'>🥗</span>
            Personalized Diet Recommendations
          </h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Foods to Favor</h4>
              <div className='space-y-2'>
                {data.personalized_diet.foods_to_favor.map((food, index) => (
                  <div key={index} className='flex items-center text-sm'>
                    <span className='text-green-400 mr-2'>✓</span>
                    <span className='text-cosmic-silver'>{food}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className='text-red-400 font-medium mb-3'>Foods to Minimize</h4>
              <div className='space-y-2'>
                {data.personalized_diet.foods_to_avoid.map((food, index) => (
                  <div key={index} className='flex items-center text-sm'>
                    <span className='text-red-400 mr-2'>⚠️</span>
                    <span className='text-cosmic-silver'>{food}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Seasonal Diet Adjustments */}
          {data.personalized_diet.seasonal_adjustments && Object.keys(data.personalized_diet.seasonal_adjustments).length > 0 && (
            <div className='mt-6'>
              <h4 className='text-yellow-400 font-medium mb-3'>Seasonal Adjustments</h4>
              <div className='grid md:grid-cols-2 gap-4'>
                {Object.entries(data.personalized_diet.seasonal_adjustments).map(([season, foods], index) => (
                  <div key={index} className='p-4 bg-cosmic-black/20 rounded-lg'>
                    <h5 className='text-yellow-300 font-medium mb-2'>{season}</h5>
                    <ul className='space-y-1'>
                      {foods.map((food, foodIndex) => (
                        <li key={foodIndex} className='text-sm text-cosmic-silver'>
                          • {food}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lifestyle Recommendations */}
      {data.lifestyle_recommendations && (
        <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-300 mb-4 flex items-center'>
            <span className='mr-2'>🏃‍♂️</span>
            Lifestyle Recommendations
          </h3>
          
          <div className='grid md:grid-cols-3 gap-6'>
            <div>
              <h4 className='text-blue-400 font-medium mb-3'>Daily Routine</h4>
              <ul className='space-y-2'>
                {data.lifestyle_recommendations.daily_routine.map((routine, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-blue-400 mr-2'>🔄</span>
                    <span className='text-cosmic-silver'>{routine}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Exercise Guidelines</h4>
              <ul className='space-y-2'>
                {data.lifestyle_recommendations.exercise_guidelines.map((guideline, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-green-400 mr-2'>💪</span>
                    <span className='text-cosmic-silver'>{guideline}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-purple-400 font-medium mb-3'>Sleep Optimization</h4>
              <ul className='space-y-2'>
                {data.lifestyle_recommendations.sleep_optimization.map((tip, index) => (
                  <li key={index} className='flex items-start text-sm'>
                    <span className='text-purple-400 mr-2'>🌙</span>
                    <span className='text-cosmic-silver'>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Herbal Support */}
      {data.herbal_support && (
        <div className='bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-yellow-300 mb-4 flex items-center'>
            <span className='mr-2'>🌿</span>
            Herbal Support Recommendations
          </h3>
          
          <div className='grid md:grid-cols-2 gap-6'>
            <div>
              <h4 className='text-green-400 font-medium mb-3'>Constitutional Herbs</h4>
              <div className='flex flex-wrap gap-2'>
                {data.herbal_support.constitutional_herbs.map((herb, index) => (
                  <span
                    key={index}
                    className='text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded'
                  >
                    {herb}
                  </span>
                ))}
              </div>
              
              {/* Seasonal Herbs */}
              {data.herbal_support.seasonal_herbs && Object.keys(data.herbal_support.seasonal_herbs).length > 0 && (
                <div className='mt-4'>
                  <h4 className='text-yellow-400 font-medium mb-3'>Seasonal Herbs</h4>
                  <div className='space-y-2'>
                    {Object.entries(data.herbal_support.seasonal_herbs).map(([season, herbs], index) => (
                      <div key={index} className='p-3 bg-cosmic-black/20 rounded'>
                        <span className='text-yellow-300 font-medium text-sm'>{season}: </span>
                        <span className='text-cosmic-silver text-sm'>{herbs.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h4 className='text-red-400 font-medium mb-3'>Important Contraindications</h4>
              <div className='space-y-2'>
                {data.herbal_support.contraindications.map((contraindication, index) => (
                  <div key={index} className='flex items-start p-3 bg-red-900/20 border border-red-500/30 rounded'>
                    <span className='text-red-400 mr-2'>⚠️</span>
                    <p className='text-cosmic-silver text-sm'>{contraindication}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Synthesis Section Component
const SynthesisSection: React.FC<{ 
  data?: AyurvedaChartData['synthesis'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No synthesis data available</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Ayurveda-Astrology Integration */}
      <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-purple-300 mb-4 flex items-center'>
          <span className='mr-2'>🔮</span>
          Ayurveda-Astrology Integration
        </h3>
        <p className='text-cosmic-silver'>{data.ayurveda_astrology_integration}</p>
      </div>

      {/* Dharmic Alignment */}
      <div className='bg-orange-900/10 border border-orange-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-orange-300 mb-4 flex items-center'>
          <span className='mr-2'>🙏</span>
          Dharmic Alignment
        </h3>
        <p className='text-cosmic-silver'>{data.dharmic_alignment}</p>
      </div>

      {/* Spiritual Development Path */}
      {data.spiritual_development_path && data.spiritual_development_path.length > 0 && (
        <div className='bg-teal-900/10 border border-teal-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-teal-300 mb-4 flex items-center'>
            <span className='mr-2'>🌱</span>
            Spiritual Development Path
          </h3>
          <div className='space-y-3'>
            {data.spiritual_development_path.map((step, index) => (
              <div key={index} className='flex items-start space-x-3'>
                <span className='text-teal-400 mt-0.5 text-sm font-bold'>{index + 1}.</span>
                <p className='text-cosmic-silver text-sm'>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Karmic Health Patterns */}
      <div className='bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-indigo-300 mb-4 flex items-center'>
          <span className='mr-2'>♻️</span>
          Karmic Health Patterns
        </h3>
        <p className='text-cosmic-silver'>{data.karmic_health_patterns}</p>
      </div>
    </div>
  );
};

// Helper functions
const getDoshaIcon = (dosha: string): string => {
  const iconMap: Record<string, string> = {
    'Vata': '💨',
    'Pitta': '🔥', 
    'Kapha': '🌍'
  };
  return iconMap[dosha] ?? '⭐';
};

const getDoshaColor = (dosha: string): string => {
  const colorMap: Record<string, string> = {
    'Vata': 'bg-gray-500',
    'Pitta': 'bg-red-500',
    'Kapha': 'bg-green-500'
  };
  return colorMap[dosha] ?? 'bg-gray-500';
};

const getPlanetIcon = (planet: string): string => {
  const iconMap: Record<string, string> = {
    'Sun': '☉',
    'Moon': '☽',
    'Mars': '♂',
    'Mercury': '☿',
    'Jupiter': '♃',
    'Venus': '♀',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
  };
  return iconMap[planet] ?? '🪐';
};

export default AyurvedaChart;
export type { AyurvedaChartData, AyurvedaChartProps };
