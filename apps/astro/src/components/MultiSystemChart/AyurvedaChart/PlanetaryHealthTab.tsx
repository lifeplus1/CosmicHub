import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import type { AyurvedaChartData } from './types';
import { getPlanetIcon } from './utils';

interface PlanetaryHealthTabProps {
  data?: AyurvedaChartData['planetary_health'];
}

const PlanetaryHealthTab: React.FC<PlanetaryHealthTabProps> = React.memo(({ data }) => {
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
});

PlanetaryHealthTab.displayName = 'PlanetaryHealthTab';

export default PlanetaryHealthTab;
