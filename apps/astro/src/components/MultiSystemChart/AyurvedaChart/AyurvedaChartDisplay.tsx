import React, { useState, useCallback } from 'react';
import type { AyurvedaChartData } from './types';
import ConstitutionTab from './ConstitutionTab';
import DoshasTab from './DoshasTab';
import PlanetaryHealthTab from './PlanetaryHealthTab';
import WellnessPlanTab from './WellnessPlanTab';
import SynthesisTab from './SynthesisTab';

interface AyurvedaChartDisplayProps {
  data?: AyurvedaChartData;
  className?: string;
}

type TabKey = 'constitution' | 'doshas' | 'planetary' | 'wellness' | 'synthesis';

const AyurvedaChartDisplay: React.FC<AyurvedaChartDisplayProps> = React.memo(({ 
  data, 
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('constitution');

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  if (!data) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <p className='text-cosmic-silver'>No Ayurveda chart data available</p>
      </div>
    );
  }

  const tabs = [
    { 
      key: 'constitution' as TabKey, 
      label: 'Constitution', 
      icon: '🌟',
      description: 'Birth constitution & current state'
    },
    { 
      key: 'doshas' as TabKey, 
      label: 'Doshas', 
      icon: '⚖️',
      description: 'Three doshas analysis'
    },
    { 
      key: 'planetary' as TabKey, 
      label: 'Planetary Health', 
      icon: '🪐',
      description: 'Astrological health correlations'
    },
    { 
      key: 'wellness' as TabKey, 
      label: 'Wellness Plan', 
      icon: '🌿',
      description: 'Personalized recommendations'
    },
    { 
      key: 'synthesis' as TabKey, 
      label: 'Synthesis', 
      icon: '🔮',
      description: 'Integration & spiritual path'
    }
  ];

  return (
    <div className={`bg-cosmic-black/40 backdrop-blur-sm border border-cosmic-silver/20 rounded-lg p-6 ${className}`}>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-cosmic-gold mb-2'>
          Ayurvedic Health Analysis
        </h2>
        <p className='text-cosmic-silver text-sm'>
          Ancient wisdom meets celestial guidance for personalized health insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className='flex flex-wrap gap-2 mb-6 p-2 bg-cosmic-black/20 rounded-lg'>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 min-w-0 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-cosmic-gold text-cosmic-black shadow-lg'
                : 'text-cosmic-silver hover:text-cosmic-gold hover:bg-cosmic-gold/10'
            }`}
            title={tab.description}
          >
            <div className='flex items-center justify-center space-x-1'>
              <span className='text-base'>{tab.icon}</span>
              <span className='hidden sm:inline truncate'>{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='min-h-[400px]'>
        {activeTab === 'constitution' && (
          <ConstitutionTab data={data.constitutional_analysis} />
        )}
        {activeTab === 'doshas' && (
          <DoshasTab data={data.doshas_analysis} />
        )}
        {activeTab === 'planetary' && (
          <PlanetaryHealthTab data={data.planetary_health} />
        )}
        {activeTab === 'wellness' && (
          <WellnessPlanTab data={data.wellness_plan} />
        )}
        {activeTab === 'synthesis' && (
          <SynthesisTab data={data.synthesis} />
        )}
      </div>
    </div>
  );
});

AyurvedaChartDisplay.displayName = 'AyurvedaChartDisplay';

export default AyurvedaChartDisplay;
export type { AyurvedaChartDisplayProps, TabKey };
