import React from 'react';
import type { AyurvedaChartData } from './types';
import { getDoshaIcon, getDoshaColor } from './utils';

interface DoshasTabProps {
  data?: AyurvedaChartData['doshas_analysis'];
}

const DoshasTab: React.FC<DoshasTabProps> = React.memo(({ data }) => {
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
});

DoshasTab.displayName = 'DoshasTab';

export default DoshasTab;
