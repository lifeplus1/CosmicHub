import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { MultiSystemChartData } from './types';
import type { ChartBirthData } from '@cosmichub/types';
import WesternChart from './WesternChart';
import VedicChart from './VedicChart';
import ChineseChart from './ChineseChart';
import MayanChart from './MayanChart';
import UranianChart from './UranianChart';
import SynthesisChart from './SynthesisChart';

interface MultiSystemChartProps {
  chartData?: MultiSystemChartData;
  birthData?: ChartBirthData;
  // showComparison prop reserved for future comparative views (currently unused)
  showComparison?: boolean;
  isLoading?: boolean;
}

export const MultiSystemChartDisplay: React.FC<MultiSystemChartProps> = ({
  chartData,
  birthData,
  // maintain API surface while unused
  showComparison: _showComparison = false,
  isLoading = false,
}) => {
  const bgColor = 'purple-50';
  const cardBg = 'white';

  if (isLoading) {
    return (
      <div className={`p-4 bg-${bgColor} rounded-lg`}>
        <p className='text-center text-cosmic-silver'>
          Calculating multi-system chart...
        </p>
      </div>
    );
  }

  if (!chartData && !birthData) {
    return (
      <div className='p-4 border border-yellow-500 rounded-md bg-yellow-900/50'>
        <div className='text-center'>
          <h3 className='font-bold text-cosmic-silver'>No Chart Data</h3>
          <p className='text-cosmic-silver/70'>
            Please calculate a chart to see the multi-system analysis.
          </p>
        </div>
      </div>
    );
  }

  // If we have birthData but no chartData, show a placeholder message
  const displayData = chartData ?? {
    birth_info: birthData
      ? {
          date: `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`,
          time: `${String(birthData.hour).padStart(2, '0')}:${String(birthData.minute).padStart(2, '0')}`,
          location: {
            latitude: birthData.lat,
            longitude: birthData.lon,
            timezone: birthData.timezone,
          },
        }
      : undefined,
  };

  return (
    <div className={`bg-${bgColor} rounded-lg p-4`}>
      <div className='flex flex-col space-y-6'>
        {/* Birth Information Header */}
        <div className={`cosmic-card bg-${cardBg}`}>
          <div className='p-4'>
            <h2 className='mb-4 text-lg font-bold text-center text-cosmic-gold'>
              Multi-System Astrological Analysis
            </h2>
            {displayData.birth_info && (
              <div className='flex flex-wrap justify-center gap-4'>
                <p className='text-cosmic-silver'>
                  <strong>Date:</strong> {displayData.birth_info.date}
                </p>
                <p className='text-cosmic-silver'>
                  <strong>Time:</strong> {displayData.birth_info.time}
                </p>
                <p className='text-cosmic-silver'>
                  <strong>Coordinates:</strong>{' '}
                  {displayData.birth_info.location?.latitude?.toFixed(2)}°,{' '}
                  {displayData.birth_info.location?.longitude?.toFixed(2)}°
                </p>
                <p className='text-cosmic-silver'>
                  <strong>Timezone:</strong>{' '}
                  {displayData.birth_info.location?.timezone}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Multi-System Tabs */}
        <Tabs.Root>
          <Tabs.List className='flex flex-wrap'>
            <Tabs.Trigger
              value='western'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple'
            >
              Western Tropical
            </Tabs.Trigger>
            <Tabs.Trigger
              value='vedic'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple'
            >
              Vedic Sidereal
            </Tabs.Trigger>
            <Tabs.Trigger
              value='chinese'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple'
            >
              Chinese
            </Tabs.Trigger>
            <Tabs.Trigger
              value='mayan'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple'
            >
              Mayan
            </Tabs.Trigger>
            <Tabs.Trigger
              value='uranian'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple'
            >
              Uranian
            </Tabs.Trigger>
            <Tabs.Trigger
              value='synthesis'
              className='px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple'
            >
              Synthesis
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value='western' className='pt-4'>
            <WesternChart data={displayData.western_tropical} />
          </Tabs.Content>
          <Tabs.Content value='vedic' className='pt-4'>
            <VedicChart data={displayData.vedic_sidereal ?? {}} />
          </Tabs.Content>
          <Tabs.Content value='chinese' className='pt-4'>
            <ChineseChart data={displayData.chinese ?? {}} />
          </Tabs.Content>
          <Tabs.Content value='mayan' className='pt-4'>
            <MayanChart data={displayData.mayan ?? {}} />
          </Tabs.Content>
          <Tabs.Content value='uranian' className='pt-4'>
            <UranianChart data={displayData.uranian ?? {}} />
          </Tabs.Content>
          <Tabs.Content value='synthesis' className='pt-4'>
            <SynthesisChart data={displayData.synthesis ?? {}} />
          </Tabs.Content>
        </Tabs.Root>

        {/* Footer with methodology */}
        <div
          className={`cosmic-card bg-${cardBg} border border-cosmic-silver/30`}
        >
          <div className='p-4'>
            <p className='text-sm text-center text-cosmic-silver'>
              This analysis combines Western tropical astrology, Vedic sidereal
              calculations, Chinese Four Pillars, Mayan sacred calendar, and
              Uranian midpoint techniques to provide a comprehensive
              astrological perspective.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSystemChartDisplay;
