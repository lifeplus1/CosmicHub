import React from 'react';
import type { ChineseChartData } from './types';
import { isValidChartData, safeGet } from './utils';

interface Props {
  data: ChineseChartData;
}

const ChineseChart: React.FC<Props> = ({ data }) => {
  if (!isValidChartData(data)) {
    return (
      <div className='cosmic-card bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30'>
        <div className='p-6 text-center'>
          <p className='text-cosmic-silver'>
            No Chinese astrology data available
          </p>
          <p className='text-cosmic-silver/60 text-sm mt-2'>
            Please calculate a chart to see Chinese Four Pillars analysis
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
    'Chinese Astrology Four Pillars Analysis'
  );
  const yearElement = safeGet(dataRecord, 'year.element', 'Unknown');
  const yearAnimal = safeGet(dataRecord, 'year.animal', 'Unknown');
  const monthAnimal = safeGet(dataRecord, 'month.animal', 'Unknown');
  const dayAnimal = safeGet(dataRecord, 'day.animal', 'Unknown');
  const hourAnimal = safeGet(dataRecord, 'hour.animal', 'Unknown');
  const fourPillars = safeGet(dataRecord, 'four_pillars', 'Not available');
  const elementsAnalysis = safeGet(
    dataRecord,
    'elements_analysis.analysis',
    'Elements analysis not available'
  );
  const yearTraits = safeGet(
    dataRecord,
    'year.traits',
    'Personality traits not available'
  );
  const personalitySummary = safeGet(
    dataRecord,
    'personality_summary',
    'Summary not available'
  );

  return (
    <div className='flex flex-col space-y-4'>
      <div className='cosmic-card bg-gradient-to-br from-red-900/20 to-pink-900/20 border border-red-500/30'>
        <div className='p-4'>
          <h3 className='mb-4 font-bold text-red-400 text-md'>
            Chinese Astrology
          </h3>
          <p className='mb-4 text-sm font-medium text-cosmic-silver'>
            {description}
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <div className='space-y-3'>
              <p className='mb-2 font-bold text-cosmic-silver'>Four Pillars</p>
              <div className='space-y-2 text-sm'>
                <p className='text-cosmic-silver/80'>
                  <strong>Year:</strong> {yearElement} {yearAnimal}
                </p>
                <p className='text-cosmic-silver/80'>
                  <strong>Month:</strong> {monthAnimal}
                </p>
                <p className='text-cosmic-silver/80'>
                  <strong>Day:</strong> {dayAnimal}
                </p>
                <p className='text-cosmic-silver/80'>
                  <strong>Hour:</strong> {hourAnimal}
                </p>
              </div>
            </div>
            <div className='space-y-3'>
              <p className='mb-2 font-bold text-cosmic-silver'>Bazi Chart</p>
              <p className='mb-2 font-mono text-sm text-cosmic-silver/80 bg-red-900/10 p-2 rounded'>
                {fourPillars}
              </p>
              <p className='mb-2 font-bold text-cosmic-silver'>
                Elemental Balance
              </p>
              <p className='text-sm text-cosmic-silver/80'>
                {elementsAnalysis}
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <p className='mb-2 font-bold text-cosmic-silver'>
                Personality Traits
              </p>
              <p className='mb-4 text-sm text-cosmic-silver/80 bg-red-900/10 p-3 rounded'>
                {yearTraits}
              </p>
            </div>

            <div>
              <p className='mb-2 font-bold text-cosmic-silver'>
                Overall Summary
              </p>
              <p className='text-sm text-cosmic-silver/80 bg-red-900/10 p-3 rounded'>
                {personalitySummary}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChineseChart;
