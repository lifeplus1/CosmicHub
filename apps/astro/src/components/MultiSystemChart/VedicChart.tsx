import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import type { VedicChartData } from './types';
import { isValidChartData, safeGet } from './utils';

interface Props {
  data: VedicChartData;
}

const VedicChart: React.FC<Props> = ({ data }) => {
  if (!isValidChartData(data)) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30'>
        <div className='p-6 text-center'>
          <p className='text-cosmic-silver'>
            No Vedic astrology data available
          </p>
          <p className='text-cosmic-silver/60 text-sm mt-2'>
            Please calculate a chart to see Vedic sidereal analysis
          </p>
        </div>
      </div>
    );
  }

  // Safe data extraction with fallbacks
  const dataRecord = data as unknown as Record<string, unknown>;
  const description = safeGet(
    dataRecord,
    'description',
    'Vedic Sidereal Astrology Analysis'
  );
  const ayanamsa = safeGet(dataRecord, 'ayanamsa', 0) as number;
  const moonSign = safeGet(dataRecord, 'analysis.moon_sign', 'Not calculated');
  const analysis = safeGet(
    dataRecord,
    'analysis.analysis',
    'Analysis not available'
  );
  const planets = safeGet(dataRecord, 'planets', {});

  const planetEntries = Object.entries(planets);

  return (
    <div className='flex flex-col space-y-4'>
      <div className='cosmic-card bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30'>
        <div className='p-4'>
          <h3 className='mb-4 font-bold text-orange-400 text-md'>
            Vedic Sidereal Astrology
          </h3>
          <p className='mb-4 text-sm font-medium text-cosmic-silver'>
            {description}
          </p>
          {ayanamsa !== 0 && (
            <p className='mb-4 text-sm text-cosmic-silver'>
              <strong>Ayanamsa:</strong> {ayanamsa.toFixed(4)}°
            </p>
          )}

          <Accordion.Root type='single' collapsible>
            <Accordion.Item value='lunar'>
              <Accordion.Trigger className='flex justify-between w-full p-4 transition-colors duration-300 bg-orange-500/20 hover:bg-orange-500/30 rounded'>
                <span className='font-bold'>Lunar Analysis</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <p className='mb-2 text-sm font-medium text-cosmic-silver'>
                  Moon Sign (Rashi): {moonSign}
                </p>
                <p className='text-sm text-cosmic-silver/80'>{analysis}</p>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value='planets' className='mt-2'>
              <Accordion.Trigger className='flex justify-between w-full p-4 transition-colors duration-300 bg-orange-500/20 hover:bg-orange-500/30 rounded'>
                <div className='flex space-x-2'>
                  <span className='font-bold'>Planets & Nakshatras</span>
                  <span className='px-2 py-1 text-sm text-cosmic-silver rounded bg-orange-500/30'>
                    {planetEntries.length}
                  </span>
                </div>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                {planetEntries.length > 0 ? (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm table-auto'>
                      <thead>
                        <tr>
                          <th className='py-2 text-left text-cosmic-silver border-b border-orange-300/20'>
                            Planet
                          </th>
                          <th className='py-2 text-left text-cosmic-silver border-b border-orange-300/20'>
                            Sign
                          </th>
                          <th className='py-2 text-left text-cosmic-silver border-b border-orange-300/20'>
                            Nakshatra
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {planetEntries.map(([planet, info]) => {
                          // Safe property access with validation
                          const infoRecord = info as Record<string, unknown>;
                          const vedicSign = safeGet(
                            infoRecord,
                            'vedic_sign',
                            'Unknown'
                          );
                          const nakshatraName = safeGet(
                            infoRecord,
                            'nakshatra.name',
                            'Unknown'
                          );
                          const pada = safeGet(
                            infoRecord,
                            'nakshatra.pada',
                            'N/A'
                          ) as string;

                          return (
                            <tr
                              key={planet}
                              className='border-b border-orange-300/10'
                            >
                              <td className='py-2 font-medium capitalize text-cosmic-silver'>
                                {planet.replace('_', ' ')}
                              </td>
                              <td className='py-2 text-cosmic-silver/80'>
                                {vedicSign}
                              </td>
                              <td className='py-2 text-cosmic-silver/80'>
                                {nakshatraName}
                                {pada !== 'N/A' && ` (Pada ${pada})`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='p-4 text-center text-cosmic-silver/70'>
                    No planet data available for Vedic analysis
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

export default VedicChart;
