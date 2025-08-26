import React from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Accordion from '@radix-ui/react-accordion';
import type { WesternChartData } from './types';
import {
  getPlanetSymbolSafe,
  getAspectSymbolSafe,
  getZodiacSign,
  isValidChartData,
} from './utils';

interface Props {
  data?: WesternChartData;
}

const WesternChart: React.FC<Props> = ({ data }) => {
  // Enhanced data validation
  if (!isValidChartData(data) || !data.planets) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30'>
        <div className='p-6 text-center'>
          <p className='text-cosmic-silver'>No Western chart data available</p>
          <p className='text-cosmic-silver/60 text-sm mt-2'>
            Please calculate a chart to see Western tropical analysis
          </p>
        </div>
      </div>
    );
  }

  const planetEntries = Object.entries(data.planets || {});
  const aspectsArray = Array.isArray(data.aspects) ? data.aspects : [];

  return (
    <div className='flex flex-col space-y-6'>
      <div className='cosmic-card bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30'>
        <div className='p-6'>
          <h3 className='mb-4 font-bold text-purple-400 text-md'>
            Western Tropical Chart
          </h3>
          <p className='mb-6 text-sm text-cosmic-silver'>
            Based on tropical zodiac, solar-focused approach emphasizing
            personality and life expression
          </p>

          <Accordion.Root type='single' collapsible>
            <Accordion.Item
              value='planets'
              className='rounded-lg cosmic-card border-purple-300/30'
            >
              <Accordion.Trigger className='flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6'>
                <div className='flex space-x-2'>
                  <span className='mb-0 font-bold'>Planets & Positions</span>
                  <span className='px-2 py-1 text-sm text-cosmic-silver rounded bg-cosmic-purple'>
                    {planetEntries.length}
                  </span>
                </div>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='p-0'>
                {planetEntries.length > 0 ? (
                  <div className='overflow-x-auto'>
                    <table className='w-full table-auto'>
                      <thead>
                        <tr>
                          <th className='px-4 py-2 text-left min-w-32'>
                            Planet
                          </th>
                          <th className='px-4 py-2 text-left min-w-48'>
                            Position
                          </th>
                          <th className='px-4 py-2 text-left min-w-24'>
                            Retrograde
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {planetEntries.map(([planet, info]) => {
                          // Safe property access with validation
                          const position =
                            typeof info?.position === 'number'
                              ? info.position
                              : 0;
                          const retrograde = Boolean(info?.retrograde);

                          return (
                            <tr key={planet}>
                              <td className='px-4 py-2 border-b border-cosmic-gold/20'>
                                <div className='flex space-x-2'>
                                  <span className='text-lg'>
                                    {getPlanetSymbolSafe(planet)}
                                  </span>
                                  <span className='font-semibold text-cosmic-silver capitalize'>
                                    {planet.replace('_', ' ')}
                                  </span>
                                </div>
                              </td>
                              <td className='px-4 py-2 font-mono border-b border-cosmic-gold/20 text-cosmic-silver'>
                                {getZodiacSign(position)}
                              </td>
                              <td className='px-4 py-2 text-center border-b border-cosmic-gold/20'>
                                {retrograde ? (
                                  <span className='px-2 py-1 text-sm text-yellow-500 rounded bg-yellow-500/20'>
                                    ℞
                                  </span>
                                ) : (
                                  <span className='text-cosmic-silver/60'>
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='p-4 text-center text-cosmic-silver/70'>
                    No planet data available
                  </div>
                )}
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item
              value='aspects'
              className='mt-4 rounded-lg cosmic-card border-purple-300/30'
            >
              <Accordion.Trigger className='flex justify-between w-full p-4 transition-colors duration-300 bg-purple-500/20 hover:bg-purple-500/30 lg:p-6'>
                <div className='flex space-x-2'>
                  <span className='mb-0 font-bold'>Aspects</span>
                  <span className='px-2 py-1 text-sm rounded bg-cosmic-purple/20 text-cosmic-purple'>
                    {aspectsArray.length}
                  </span>
                </div>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='p-0'>
                {aspectsArray.length > 0 ? (
                  <div className='overflow-x-auto'>
                    <table className='w-full table-auto'>
                      <thead>
                        <tr>
                          <th className='px-4 py-2 text-left min-w-32'>
                            Aspect Type
                          </th>
                          <th className='px-4 py-2 text-left min-w-40'>
                            Planets
                          </th>
                          <th className='px-4 py-2 text-left min-w-24'>Orb</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aspectsArray.map((aspect, idx) => {
                          // Safe property access with fallbacks
                          const aspectType = aspect?.aspect || 'Unknown';
                          const point1 = aspect?.point1 || 'Unknown';
                          const point2 = aspect?.point2 || 'Unknown';
                          const orb =
                            typeof aspect?.orb === 'number' ? aspect.orb : 0;
                          const isExact = Boolean(aspect?.exact);
                          const point1Sign = aspect?.point1_sign || '';
                          const point2Sign = aspect?.point2_sign || '';
                          const point1House = aspect?.point1_house || '';
                          const point2House = aspect?.point2_house || '';

                          return (
                            <tr key={`${point1}-${point2}-${idx}`}>
                              <td className='px-4 py-2 border-b border-cosmic-gold/20'>
                                <div className='flex space-x-2'>
                                  <span className='text-lg'>
                                    {getAspectSymbolSafe(aspectType)}
                                  </span>
                                  <span className='font-semibold text-cosmic-silver'>
                                    {aspectType}
                                  </span>
                                </div>
                              </td>
                              <td className='px-4 py-2 border-b border-cosmic-gold/20'>
                                <span className='text-cosmic-silver'>
                                  {point1} - {point2}
                                </span>
                                {(point1Sign || point2Sign) && (
                                  <p className='text-sm text-cosmic-silver/70'>
                                    {point1Sign &&
                                      `${point1Sign}${point1House ? ` (H${point1House})` : ''}`}
                                    {point1Sign && point2Sign && ' - '}
                                    {point2Sign &&
                                      `${point2Sign}${point2House ? ` (H${point2House})` : ''}`}
                                  </p>
                                )}
                              </td>
                              <td className='px-4 py-2 border-b border-cosmic-gold/20'>
                                <span
                                  className={`${isExact ? 'bg-green-500 text-cosmic-dark' : 'bg-cosmic-purple/20 text-cosmic-purple'} px-2 py-1 rounded text-sm`}
                                >
                                  {orb.toFixed(2)}°
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='p-4 text-center text-cosmic-silver/70'>
                    No aspect data available
                  </div>
                )}
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

export default WesternChart;
