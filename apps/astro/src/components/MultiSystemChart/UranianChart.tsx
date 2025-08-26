import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import type { UranianChartData } from './types';

interface Props {
  data: UranianChartData;
}

// Constants
const MAX_DIAL_ASPECTS = 8;

// Type for planet info to avoid inline type definitions
interface PlanetInfo {
  symbol?: string;
  position?: number;
  meaning?: string;
}

const UranianChart: React.FC<Props> = ({ data }) => {
  if (!data) {
    return (
      <p className='text-cosmic-silver'>No Uranian astrology data available</p>
    );
  }

  return (
    <div className='flex flex-col space-y-4'>
      <div className='cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30'>
        <div className='p-4'>
          <h3 className='mb-4 font-bold text-indigo-400 text-md'>
            Uranian Astrology
          </h3>
          <p className='mb-4 text-sm font-medium text-cosmic-silver'>
            {data.description}
          </p>

          <Accordion.Root type='single' collapsible>
            <Accordion.Item value='0'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>Transneptunian Points</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <table className='w-full text-sm table-auto'>
                  <thead>
                    <tr>
                      <th className='py-2 text-left text-cosmic-silver'>
                        Planet
                      </th>
                      <th className='py-2 text-left text-cosmic-silver'>
                        Position
                      </th>
                      <th className='py-2 text-left text-cosmic-silver'>
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.uranian_planets ?? {}).map(
                      ([planet, info]: [string, PlanetInfo]) => (
                        <tr key={planet}>
                          <td className='py-2'>
                            <div className='flex'>
                              <span className='text-indigo-400'>
                                {info.symbol}
                              </span>
                              <span className='ml-2 font-medium text-cosmic-silver'>
                                {planet.charAt(0).toUpperCase() +
                                  planet.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className='py-2 font-mono text-cosmic-silver/80'>
                            {info.position != null
                              ? `${info.position.toFixed(2)}°`
                              : 'N/A'}
                          </td>
                          <td className='py-2 text-xs text-cosmic-silver/70'>
                            {info.meaning}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value='1'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>90° Dial Aspects</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <table className='w-full text-sm table-auto'>
                  <thead>
                    <tr>
                      <th className='py-2 text-left text-cosmic-silver'>
                        Bodies
                      </th>
                      <th className='py-2 text-left text-cosmic-silver'>
                        Aspect
                      </th>
                      <th className='py-2 text-left text-cosmic-silver'>Orb</th>
                      <th className='py-2 text-left text-cosmic-silver'>
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.dial_aspects ?? [])
                      .slice(0, MAX_DIAL_ASPECTS)
                      .map(aspect => (
                        <tr
                          key={`${aspect.body1}-${aspect.body2}-${aspect.angle}`}
                        >
                          <td className='py-2 text-sm text-cosmic-silver/80'>
                            {aspect.body1} - {aspect.body2}
                          </td>
                          <td className='py-2 text-cosmic-silver/80'>
                            {aspect.angle}°
                          </td>
                          <td className='py-2 text-cosmic-silver/80'>
                            {aspect.orb != null
                              ? `${aspect.orb.toFixed(2)}°`
                              : 'N/A'}
                          </td>
                          <td className='py-2 text-xs text-cosmic-silver/70'>
                            {aspect.meaning}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
};

export default UranianChart;
