import { ChevronDownIcon } from '@radix-ui/react-icons';
import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import type { VedicChartData } from './types';

interface Props {
  data: VedicChartData;
}

const VedicChart: React.FC<Props> = ({ data }) => {
  if (data === null || data === undefined) {
    return (
      <p className='text-cosmic-silver'>No Vedic astrology data available</p>
    );
  }

  return (
    <div className='flex flex-col space-y-4'>
      <div className='cosmic-card bg-orange-50/95'>
        <div className='p-4 text-gray-800'>
          <h3 className='mb-4 font-bold text-orange-700 text-md'>
            Vedic Sidereal Astrology
          </h3>
          <p className='mb-4 text-sm font-medium text-gray-700'>
            {data.description}
          </p>
          <p className='mb-4 text-sm text-gray-700'>
            <strong>Ayanamsa:</strong> {data.ayanamsa?.toFixed(4)}°
          </p>

          <Accordion.Root type='single' collapsible>
            <Accordion.Item value='0'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>Lunar Analysis</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <p className='mb-2 text-sm font-medium'>
                  Moon Sign (Rashi): {data.analysis?.moon_sign}
                </p>
                <p className='text-sm'>{data.analysis?.analysis}</p>
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value='1'>
              <Accordion.Trigger className='flex justify-between w-full'>
                <span className='font-bold'>Planets & Nakshatras</span>
                <ChevronDownIcon />
              </Accordion.Trigger>
              <Accordion.Content className='pb-4'>
                <table className='w-full text-sm table-auto'>
                  <thead>
                    <tr>
                      <th className='py-2 text-left'>Planet</th>
                      <th className='py-2 text-left'>Sign</th>
                      <th className='py-2 text-left'>Nakshatra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.planets ?? {}).map(
                      ([planet, info]: [
                        string,
                        {
                          vedic_sign?: string;
                          nakshatra?: { name?: string; pada?: string };
                        },
                      ]) => (
                        <tr key={planet}>
                          <td className='py-2 font-medium capitalize'>
                            {planet}
                          </td>
                          <td className='py-2'>{info.vedic_sign}</td>
                          <td className='py-2'>
                            {info.nakshatra?.name} (Pada {info.nakshatra?.pada})
                          </td>
                        </tr>
                      )
                    )}
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

export default VedicChart;
