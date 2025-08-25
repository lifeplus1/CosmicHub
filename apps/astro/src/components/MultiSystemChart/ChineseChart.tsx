import React from 'react';
import type { ChineseChartData } from './types';

interface Props {
  data: ChineseChartData;
}

const ChineseChart: React.FC<Props> = ({ data }) => {
  if (data === undefined || data === null) {
    return (
      <p className='text-cosmic-silver'>No Chinese astrology data available</p>
    );
  }

  return (
    <div className='flex flex-col space-y-4'>
      <div className='cosmic-card bg-red-50/95'>
        <div className='p-4 text-gray-800'>
          <h3 className='mb-4 font-bold text-red-700 text-md'>
            Chinese Astrology
          </h3>
          <p className='mb-4 text-sm font-medium text-gray-700'>
            {data.description}
          </p>

          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div>
              <p className='mb-2 font-bold'>Four Pillars</p>
              <p className='mb-2 text-sm'>
                <strong>Year:</strong> {data.year?.element} {data.year?.animal}
              </p>
              <p className='mb-2 text-sm'>
                <strong>Month:</strong> {data.month?.animal}
              </p>
              <p className='mb-2 text-sm'>
                <strong>Day:</strong> {data.day?.animal}
              </p>
              <p className='mb-2 text-sm'>
                <strong>Hour:</strong> {data.hour?.animal}
              </p>
            </div>
            <div>
              <p className='mb-2 font-bold'>Bazi Chart</p>
              <p className='mb-2 font-mono text-sm'>{data.four_pillars}</p>
              <p className='mb-2 font-bold'>Elemental Balance</p>
              <p className='text-sm'>{data.elements_analysis?.analysis}</p>
            </div>
          </div>

          <p className='mb-2 font-bold'>Personality Traits</p>
          <p className='mb-4 text-sm'>{data.year?.traits}</p>

          <p className='mb-2 font-bold'>Overall Summary</p>
          <p className='text-sm'>{data.personality_summary}</p>
        </div>
      </div>
    </div>
  );
};

export default ChineseChart;
