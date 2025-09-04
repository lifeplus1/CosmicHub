import React, { useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronDownIcon, QuestionMarkCircledIcon, Cross2Icon } from '@radix-ui/react-icons';
import type { UnifiedBirthData } from '@cosmichub/types';
import type { TCMChartData } from './types';
import { AccessibleButton } from '@cosmichub/ui';

interface TCMChartProps {
  data?: TCMChartData;
  birthData?: UnifiedBirthData;
  isLoading?: boolean;
}

const TCMChart: React.FC<TCMChartProps> = ({ 
  data, 
  birthData: _birthData, 
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState<
    'constitution' | 'elements' | 'meridians' | 'health' | 'synthesis'
  >('constitution');
  
  // Educational dialog state
  const [educationalDialog, setEducationalDialog] = useState<{
    isOpen: boolean;
    topic: string;
    content: EducationalContent | null;
  }>({
    isOpen: false,
    topic: '',
    content: null
  });

  // Educational content types
  interface EducationalSection {
    title: string;
    content: string;
  }

  interface EducationalContent {
    title: string;
    description: string;
    sections: EducationalSection[];
  }

  // Educational content for various TCM concepts
  const educationalContent: Record<string, EducationalContent> = {
    'five-elements': {
      title: '🏮 Five Elements Theory (Wu Xing)',
      description: 'The foundation of Traditional Chinese Medicine',
      sections: [
        {
          title: 'What are the Five Elements?',
          content: 'Wood (木), Fire (火), Earth (土), Metal (金), and Water (水) represent fundamental energies that govern all natural phenomena, including human health and personality.'
        },
        {
          title: 'Element Cycles',
          content: 'Generative Cycle: Wood feeds Fire → Fire creates Earth → Earth bears Metal → Metal enriches Water → Water nourishes Wood. Destructive Cycle: Wood depletes Earth → Earth absorbs Water → Water extinguishes Fire → Fire melts Metal → Metal cuts Wood.'
        },
        {
          title: 'In Your Chart',
          content: 'Your astrological chart reveals which elements are dominant, deficient, or in balance, providing insights into your constitutional strengths and areas needing support.'
        }
      ]
    },
    'meridians': {
      title: '⚡ Meridian System',
      description: 'Energy highways of the body',
      sections: [
        {
          title: 'What are Meridians?',
          content: '12 main energy pathways (經絡) that circulate Qi (life energy) throughout the body. Each meridian connects to specific organs and has peak energy times during the day.'
        },
        {
          title: 'Astrological Connection',
          content: 'Your birth chart planetary positions correlate with meridian strengths and weaknesses, revealing optimal times for healing and energy cultivation.'
        },
        {
          title: 'Practical Application',
          content: 'Understanding your meridian patterns helps optimize daily routines, exercise timing, and therapeutic interventions based on your cosmic blueprint.'
        }
      ]
    },
    'constitution': {
      title: '🧬 Constitutional Types',
      description: 'Your fundamental TCM body-mind pattern',
      sections: [
        {
          title: 'Nine Constitutions',
          content: 'TCM recognizes 9 constitutional types: Balanced, Qi Deficiency, Yang Deficiency, Yin Deficiency, Phlegm-Dampness, Damp-Heat, Blood Stasis, Qi Stagnation, and Special Diathesis.'
        },
        {
          title: 'Birth Chart Correlation',
          content: 'Your astrological patterns reveal constitutional tendencies through planetary placements, seasonal birth timing, and elemental distributions in your chart.'
        },
        {
          title: 'Lifestyle Integration',
          content: 'Constitutional awareness guides food choices, exercise preferences, seasonal adjustments, and preventive health strategies aligned with your cosmic nature.'
        }
      ]
    }
  };

  const openEducationalDialog = (topic: string) => {
    const content = educationalContent[topic];
    setEducationalDialog({
      isOpen: true,
      topic,
      content: content ?? null
    });
  };

  const closeEducationalDialog = () => {
    setEducationalDialog({
      isOpen: false,
      topic: '',
      content: null
    });
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-green-900/20 to-yellow-900/20 border border-green-500/30'>
        <div className='p-6 text-center'>
          <div className='animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full mx-auto mb-4'></div>
          <p className='text-cosmic-silver'>
            Analyzing TCM constitutional patterns...
          </p>
        </div>
      </div>
    );
  }

  // Handle no data state
  if (!data) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-green-900/20 to-yellow-900/20 border border-green-500/30'>
        <div className='p-6 text-center'>
          <h3 className='font-bold text-green-400 mb-2'>
            🌿 Traditional Chinese Medicine Ready
          </h3>
          <p className='text-cosmic-silver/70 text-sm mb-4'>
            Enter your birth details to receive personalized TCM constitutional analysis
            based on Five Elements theory and meridian systems
          </p>
          <div className='grid grid-cols-2 gap-4 text-xs'>
            <div className='bg-green-900/20 p-3 rounded'>
              <span className='text-green-300 font-medium'>🏮 Five Elements</span>
              <p className='text-cosmic-silver/60'>
                Wood, Fire, Earth, Metal, Water balance
              </p>
            </div>
            <div className='bg-yellow-900/20 p-3 rounded'>
              <span className='text-yellow-300 font-medium'>⚡ Meridians</span>
              <p className='text-cosmic-silver/60'>
                12 energy pathways assessment
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='cosmic-card bg-gradient-to-br from-green-900/10 to-yellow-900/10 border border-green-500/20'>
      <div className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-green-400 flex items-center'>
            <span className='mr-3'>🌿</span>
            Traditional Chinese Medicine Analysis
            <span className='ml-2 text-xs bg-green-500/20 px-2 py-1 rounded-full'>
              TCM-001
            </span>
          </h2>
          
          {/* Educational Help Button */}
          <Dialog.Root open={educationalDialog.isOpen} onOpenChange={closeEducationalDialog}>
            <Dialog.Trigger asChild>
              <AccessibleButton
                onClick={() => openEducationalDialog('constitution')}
                className='p-2 text-cosmic-purple hover:text-cosmic-gold transition-colors'
                accessibleName='Learn about Traditional Chinese Medicine'
              >
                <QuestionMarkCircledIcon className='w-6 h-6' />
              </AccessibleButton>
            </Dialog.Trigger>
            
            <Dialog.Portal>
              <Dialog.Overlay className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50' />
              <Dialog.Content className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-2xl max-h-[85vh] overflow-y-auto cosmic-card bg-gradient-to-br from-cosmic-dark to-cosmic-blue border border-cosmic-gold/30 p-6 rounded-lg'>
                <div className='flex items-center justify-between mb-4'>
                  <Dialog.Title className='text-xl font-bold text-cosmic-gold'>
                    {educationalDialog.content?.title ?? 'TCM Education'}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <AccessibleButton
                      className='p-2 text-cosmic-silver hover:text-cosmic-gold transition-colors'
                      accessibleName='Close educational dialog'
                    >
                      <Cross2Icon className='w-5 h-5' />
                    </AccessibleButton>
                  </Dialog.Close>
                </div>
                
                {educationalDialog.content && (
                  <div className='space-y-4'>
                    <p className='text-cosmic-silver text-sm italic'>
                      {educationalDialog.content.description}
                    </p>
                    
                    {educationalDialog.content.sections?.map((section: EducationalSection, index: number) => (
                      <div key={index} className='bg-cosmic-black/30 p-4 rounded-lg'>
                        <h4 className='font-semibold text-cosmic-purple mb-2'>
                          {section.title}
                        </h4>
                        <p className='text-cosmic-silver text-sm leading-relaxed'>
                          {section.content}
                        </p>
                      </div>
                    ))}
                    
                    <div className='mt-6 p-4 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-gold/20 rounded-lg border border-cosmic-gold/20'>
                      <h4 className='font-semibold text-cosmic-gold mb-2'>
                        🎓 Ready to Learn More?
                      </h4>
                      <p className='text-cosmic-silver text-sm'>
                        This analysis combines ancient TCM wisdom with your astrological blueprint. 
                        Each section provides personalized insights based on your cosmic patterns.
                      </p>
                    </div>
                  </div>
                )}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        {/* Tab Navigation with Educational Features */}
        <div className='flex flex-wrap gap-1 mb-6 bg-cosmic-black/30 p-1 rounded-lg'>
          <div className='flex items-center'>
            <AccessibleButton
              onClick={() => setActiveTab('constitution')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'constitution'
                  ? 'bg-green-500/30 text-green-300 border border-green-400/30'
                  : 'text-cosmic-silver hover:text-green-300 hover:bg-green-500/10'
              }`}
              accessibleName={`Constitutional Analysis Tab${activeTab === 'constitution' ? ' - Active' : ''}`}
            >
              🧬 Constitution
            </AccessibleButton>
            <AccessibleButton
              onClick={() => openEducationalDialog('constitution')}
              className='ml-1 p-1 text-cosmic-silver hover:text-green-300 transition-colors'
              accessibleName='Learn about TCM Constitution'
            >
              <QuestionMarkCircledIcon className='w-3 h-3' />
            </AccessibleButton>
          </div>
          
          <div className='flex items-center'>
            <AccessibleButton
              onClick={() => setActiveTab('elements')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'elements'
                  ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/30'
                  : 'text-cosmic-silver hover:text-yellow-300 hover:bg-yellow-500/10'
              }`}
              accessibleName={`Five Elements Tab${activeTab === 'elements' ? ' - Active' : ''}`}
            >
              🏮 Five Elements
            </AccessibleButton>
            <AccessibleButton
              onClick={() => openEducationalDialog('five-elements')}
              className='ml-1 p-1 text-cosmic-silver hover:text-yellow-300 transition-colors'
              accessibleName='Learn about Five Elements Theory'
            >
              <QuestionMarkCircledIcon className='w-3 h-3' />
            </AccessibleButton>
          </div>
          
          <div className='flex items-center'>
            <AccessibleButton
              onClick={() => setActiveTab('meridians')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === 'meridians'
                  ? 'bg-blue-500/30 text-blue-300 border border-blue-400/30'
                  : 'text-cosmic-silver hover:text-blue-300 hover:bg-blue-500/10'
              }`}
              accessibleName={`Meridian Systems Tab${activeTab === 'meridians' ? ' - Active' : ''}`}
            >
              ⚡ Meridians
            </AccessibleButton>
            <AccessibleButton
              onClick={() => openEducationalDialog('meridians')}
              className='ml-1 p-1 text-cosmic-silver hover:text-blue-300 transition-colors'
              accessibleName='Learn about Meridian System'
            >
              <QuestionMarkCircledIcon className='w-3 h-3' />
            </AccessibleButton>
          </div>
          
          <AccessibleButton
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === 'health'
                ? 'bg-red-500/30 text-red-300 border border-red-400/30'
                : 'text-cosmic-silver hover:text-red-300 hover:bg-red-500/10'
            }`}
            accessibleName={`Health Correlations Tab${activeTab === 'health' ? ' - Active' : ''}`}
          >
            🩺 Health
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
          {activeTab === 'elements' && (
            <FiveElementsSection data={data.five_elements} />
          )}
          {activeTab === 'meridians' && (
            <MeridianSection data={data.meridian_system} />
          )}
          {activeTab === 'health' && (
            <HealthSection data={data.health_correlations} />
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
  data?: TCMChartData['constitutional_analysis'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No constitutional analysis available</div>;
  }

  const primaryType = data.primary_type;
  const secondaryType = data.secondary_type;

  if (!primaryType) {
    return (
      <div className='text-cosmic-silver text-center py-8'>
        <p>Primary constitution type analysis not available</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Primary Constitution */}
      <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-green-300 mb-4 flex items-center'>
          <span className='mr-2'>👑</span>
          Primary Constitution: {primaryType.name}
        </h3>
        
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <p className='text-cosmic-silver mb-4'>{primaryType.description}</p>
            
            <div className='mb-4'>
              <h4 className='text-green-400 font-medium mb-2'>Key Characteristics</h4>
              <div className='flex flex-wrap gap-2'>
                {Array.isArray(primaryType.characteristics) && primaryType.characteristics.map((trait: string, index: number) => (
                  <span
                    key={index}
                    className='text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded'
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className='mb-4'>
              <h4 className='text-yellow-400 font-medium mb-2'>Potential Vulnerabilities</h4>
              <ul className='text-sm text-cosmic-silver space-y-1'>
                {Array.isArray(primaryType.vulnerabilities) && primaryType.vulnerabilities.map((vulnerability: string, index: number) => (
                  <li key={index} className='flex items-start'>
                    <span className='text-yellow-400 mr-2'>⚠️</span>
                    {vulnerability}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className='text-blue-400 font-medium mb-2'>Recommended Practices</h4>
              <div className='flex flex-wrap gap-2'>
                {Array.isArray(primaryType.recommendations) && primaryType.recommendations.map((rec: string, index: number) => (
                  <span
                    key={index}
                    className='text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded'
                  >
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className='mt-6 p-4 bg-cosmic-black/20 rounded-lg'>
          <h4 className='text-green-400 font-medium mb-3'>Personalized Recommendations</h4>
          <div className='grid md:grid-cols-2 gap-4'>
            {Array.isArray(primaryType.recommendations) && primaryType.recommendations.map((rec: string, index: number) => (
              <div key={index} className='flex items-start'>
                <span className='text-green-400 mr-2'>✓</span>
                <span className='text-sm text-cosmic-silver'>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Constitution */}
      {secondaryType && (
        <div className='bg-orange-900/10 border border-orange-500/20 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-orange-300 mb-3 flex items-center'>
            <span className='mr-2'>⭐</span>
            Secondary Constitution: {secondaryType.name}
          </h3>
          <p className='text-cosmic-silver text-sm'>{secondaryType.description}</p>
        </div>
      )}

      {/* Constitution Summary */}
      <div className='bg-gradient-to-r from-green-900/10 to-yellow-900/10 border border-green-500/20 rounded-lg p-4'>
        <h3 className='text-green-300 font-medium mb-2'>Overall Assessment</h3>
        <p className='text-cosmic-silver'>{data.constitution_summary}</p>
      </div>
    </div>
  );
};

// Five Elements Section Component
const FiveElementsSection: React.FC<{ 
  data?: TCMChartData['five_elements'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No Five Elements analysis available</div>;
  }

  const elements = data.elements ?? [];

  // Element color mapping
  const getElementColor = (element: string) => {
    const colorMap: Record<string, string> = {
      'Wood': 'green',
      'Fire': 'red',
      'Earth': 'yellow',
      'Metal': 'gray',
      'Water': 'blue'
    };
    return colorMap[element] ?? 'gray';
  };

  const getBalanceColor = (level: string) => {
    const colorMap: Record<string, string> = {
      'deficient': 'red',
      'balanced': 'green',
      'excess': 'orange'
    };
    return colorMap[level] ?? 'gray';
  };

  return (
    <div className='space-y-6'>
      {/* Elements Overview */}
      <div className='bg-gradient-to-br from-yellow-900/10 to-red-900/10 border border-yellow-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-yellow-300 mb-4 flex items-center'>
          <span className='mr-2'>🏮</span>
          Five Elements (Wu Xing) Balance
        </h3>
        <p className='text-cosmic-silver mb-4'>{data.balance_overview}</p>
        
        {/* Elements Grid */}
        <div className='grid md:grid-cols-5 gap-4'>
          {elements.map((element, index) => (
            <div
              key={index}
              className={`bg-${getElementColor(element.name)}-900/20 border border-${getElementColor(element.name)}-500/30 rounded-lg p-4 text-center`}
            >
              <h4 className={`text-${getElementColor(element.name)}-300 font-semibold mb-2`}>
                {element.name}
              </h4>
              <p className='text-xs text-cosmic-silver mb-2'>{element.chineseName}</p>
              
              {/* Balance indicator */}
              <div className='mb-3'>
                <div className='w-full bg-gray-700 rounded-full h-2 mb-1 relative overflow-hidden'>
                  <div
                    className={`absolute left-0 top-0 h-full bg-${getBalanceColor(element.balanceLevel)}-500 rounded-full transition-all duration-300 w-[${Math.min(100, Math.max(0, element.percentage))}%]`}
                    data-percentage={element.percentage}
                  ></div>
                </div>
                <span className={`text-xs text-${getBalanceColor(element.balanceLevel)}-400 font-medium`}>
                  {element.balanceLevel} ({element.percentage}%)
                </span>
              </div>
              
              {/* Element details */}
              <div className='text-xs text-cosmic-silver space-y-1'>
                <p><span className='font-medium'>Season:</span> {element.season}</p>
                <p><span className='font-medium'>Organ:</span> {element.organ}</p>
                <p><span className='font-medium'>Emotion:</span> {element.emotion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Guidance */}
      {data.seasonal_guidance && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-4'>
          <h3 className='text-green-300 font-semibold mb-3 flex items-center'>
            <span className='mr-2'>🌸</span>
            Seasonal Guidance
          </h3>
          <p className='text-cosmic-silver'>{data.seasonal_guidance}</p>
        </div>
      )}
    </div>
  );
};

// Meridian Section Component  
const MeridianSection: React.FC<{ 
  data?: TCMChartData['meridian_system'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No meridian system analysis available</div>;
  }

  const meridians = data.meridians ?? [];

  return (
    <div className='space-y-6'>
      {/* Energy Flow Assessment */}
      <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-blue-300 mb-4 flex items-center'>
          <span className='mr-2'>⚡</span>
          Meridian Energy Flow Assessment
        </h3>
        <p className='text-cosmic-silver mb-4'>{data.energy_flow_assessment}</p>

        {/* Blockage Areas */}
        {data.blockage_areas && data.blockage_areas.length > 0 && (
          <div className='mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg'>
            <h4 className='text-red-300 font-medium mb-2'>Areas of Energy Blockage</h4>
            <div className='flex flex-wrap gap-2'>
              {data.blockage_areas.map((area, index) => (
                <span
                  key={index}
                  className='text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded'
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Meridian Details */}
      <div className='space-y-4'>
        <h3 className='text-blue-300 font-semibold'>12 Primary Meridians</h3>
        
        <Accordion.Root type="multiple" className="space-y-2">
          {meridians.map((meridian, index) => (
            <Accordion.Item
              key={index}
              value={`meridian-${index}`}
              className="bg-cosmic-black/20 border border-blue-500/20 rounded-lg overflow-hidden"
            >
              <Accordion.Header>
                <Accordion.Trigger className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-900/20 transition-colors group">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <span className="text-blue-300 font-medium">{meridian.name}</span>
                      <span className="text-xs text-cosmic-silver">
                        Flow: {meridian.flow_direction} • {meridian.timeWindow}
                      </span>
                    </div>
                    
                    {/* Strength indicator */}
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2 relative overflow-hidden">
                        <div
                          className={`absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all duration-300 w-[${Math.min(100, Math.max(0, meridian.energy_level))}%]`}
                          data-strength={meridian.energy_level}
                        ></div>
                      </div>
                      <span className="text-xs text-blue-400">{meridian.energy_level}%</span>
                    </div>
                  </div>
                  
                  <ChevronDownIcon className="w-5 h-5 text-cosmic-silver transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              
              <Accordion.Content className="p-4 pt-0 text-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-cosmic-silver mb-2">
                      <span className="text-blue-400 font-medium">Time Window:</span> {meridian.timeWindow}
                    </p>
                    <p className="text-cosmic-silver mb-2">
                      <span className="text-blue-400 font-medium">Flow Direction:</span> {meridian.flow_direction}
                    </p>
                  </div>
                  <div>
                    <p className="text-cosmic-silver mb-2">
                      <span className="text-blue-400 font-medium">Energy Level:</span> {meridian.energy_level}%
                    </p>
                    {meridian.blockages && meridian.blockages.length > 0 && (
                      <div>
                        <span className="text-blue-400 font-medium">Blockages:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {meridian.blockages.map((blockage, blockageIndex) => (
                            <span
                              key={blockageIndex}
                              className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded"
                            >
                              {blockage}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  );
};

// Health Section Component
const HealthSection: React.FC<{ 
  data?: TCMChartData['health_correlations'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No health correlation analysis available</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Astrological Health Risks */}
      {data.astrological_health_risks && data.astrological_health_risks.length > 0 && (
        <div className='bg-red-900/10 border border-red-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-red-300 mb-4 flex items-center'>
            <span className='mr-2'>⚠️</span>
            Astrological Health Considerations
          </h3>
          <div className='space-y-3'>
            {data.astrological_health_risks.map((risk, index) => (
              <div key={index} className='flex items-start space-x-3'>
                <span className='text-red-400 mt-0.5'>•</span>
                <p className='text-cosmic-silver text-sm'>{risk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preventive Recommendations */}
      {data.preventive_recommendations && data.preventive_recommendations.length > 0 && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-green-300 mb-4 flex items-center'>
            <span className='mr-2'>🛡️</span>
            Preventive Recommendations
          </h3>
          <div className='grid md:grid-cols-2 gap-4'>
            {data.preventive_recommendations.map((rec, index) => (
              <div key={index} className='flex items-start space-x-3'>
                <span className='text-green-400 mt-0.5'>✓</span>
                <p className='text-cosmic-silver text-sm'>{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimal Timing */}
      {data.optimal_timing && Object.keys(data.optimal_timing).length > 0 && (
        <div className='bg-blue-900/10 border border-blue-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-blue-300 mb-4 flex items-center'>
            <span className='mr-2'>⏰</span>
            Optimal Timing for Wellness Practices
          </h3>
          <div className='space-y-3'>
            {Object.entries(data.optimal_timing).map(([practice, timing], index) => (
              <div key={index} className='flex justify-between items-center p-3 bg-cosmic-black/20 rounded-lg'>
                <span className='text-cosmic-silver font-medium'>{practice}</span>
                <span className='text-blue-400 text-sm'>{timing}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Synthesis Section Component
const SynthesisSection: React.FC<{ 
  data?: TCMChartData['synthesis'] 
}> = ({ data }) => {
  if (!data) {
    return <div className='text-cosmic-silver'>No synthesis data available</div>;
  }

  return (
    <div className='space-y-6'>
      {/* TCM-Astrology Integration */}
      <div className='bg-purple-900/10 border border-purple-500/20 rounded-lg p-6'>
        <h3 className='text-lg font-semibold text-purple-300 mb-4 flex items-center'>
          <span className='mr-2'>🔮</span>
          TCM-Astrology Integration
        </h3>
        <p className='text-cosmic-silver'>{data.tcm_astrology_integration}</p>
      </div>

      {/* Personalized Wellness Plan */}
      {data.personalized_wellness_plan && data.personalized_wellness_plan.length > 0 && (
        <div className='bg-green-900/10 border border-green-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-green-300 mb-4 flex items-center'>
            <span className='mr-2'>📋</span>
            Personalized Wellness Plan
          </h3>
          <div className='space-y-3'>
            {data.personalized_wellness_plan.map((item, index) => (
              <div key={index} className='flex items-start space-x-3'>
                <span className='text-green-400 mt-0.5 text-sm'>{index + 1}.</span>
                <p className='text-cosmic-silver text-sm'>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal Adjustments */}
      {data.seasonal_adjustments && Object.keys(data.seasonal_adjustments).length > 0 && (
        <div className='bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-yellow-300 mb-4 flex items-center'>
            <span className='mr-2'>🌸</span>
            Seasonal Adjustments
          </h3>
          <div className='space-y-4'>
            {Object.entries(data.seasonal_adjustments).map(([season, adjustments], index) => (
              <div key={index} className='p-4 bg-cosmic-black/20 rounded-lg'>
                <h4 className='text-yellow-400 font-medium mb-2'>{season}</h4>
                <div className='space-y-1'>
                  {adjustments.map((adjustment, adjustmentIndex) => (
                    <div key={adjustmentIndex} className='flex items-start space-x-2'>
                      <span className='text-yellow-400 mt-0.5 text-xs'>•</span>
                      <p className='text-cosmic-silver text-sm'>{adjustment}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TCMChart;
export type { TCMChartData, TCMChartProps };
