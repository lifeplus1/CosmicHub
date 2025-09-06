import React from 'react';
import { featureFlags } from '../../config/featureFlags';
import * as Tabs from '@radix-ui/react-tabs';
import { ChartErrorBoundary } from '@cosmichub/ui';
import type { MultiSystemChartData, LoadedChartState } from './types';
import type { UnifiedBirthData } from '@cosmichub/types';
import WesternChart from './WesternChart';
import VedicChart from './VedicChart';
import ChineseChart from './ChineseChart';
import MayanChart from './MayanChart';
import UranianChart from './UranianChart';
import SynthesisChart from './SynthesisChart';
import SpiritualChart from './SpiritualChart';
import PsychologyChart, { type PsychologyChartData } from './PsychologyChart';
import TCMChart from './TCMChart';
import ExtractedSystemsNavigation from './ExtractedSystemsNavigation';

interface MultiSystemChartProps {
  chartData?: MultiSystemChartData;
  birthData?: UnifiedBirthData;
  // showComparison prop reserved for future comparative views (currently unused)
  showComparison?: boolean;
  isLoading?: boolean;
  /**
   * Optional list of tab value ids to render (used when embedding a single-domain view like standalone TCM page)
   * If omitted, all tabs are shown.
   */
  overrideVisibleTabs?: string[];
}

export const MultiSystemChartDisplay: React.FC<MultiSystemChartProps> = ({
  chartData,
  birthData,
  // maintain API surface while unused
  showComparison: _showComparison = false,
  isLoading = false,
  overrideVisibleTabs,
}) => {
  if (isLoading) {
    return (
      <div className='cosmic-card p-6 rounded-lg'>
        <div className='flex items-center justify-center space-x-3'>
          <div className='w-5 h-5 border-b-2 border-cosmic-purple rounded-full animate-spin'></div>
          <p className='text-center text-cosmic-silver'>
            Calculating multi-system chart...
          </p>
        </div>
      </div>
    );
  }

  if (!chartData && !birthData) {
    return (
      <div className='p-6 border border-yellow-500 rounded-md bg-yellow-900/50'>
        <div className='text-center'>
          <h3 className='font-bold text-cosmic-silver'>No Chart Data</h3>
          <p className='text-cosmic-silver/70'>
            Please calculate a chart to see the multi-system analysis.
          </p>
        </div>
      </div>
    );
  }

  // Enhanced data preparation with better validation
  const displayData: MultiSystemChartData = chartData ?? {
    status: 'loaded',
    birth_info: birthData
      ? {
          date: `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`,
          time: `${String(birthData.hour).padStart(2, '0')}:${String(birthData.minute).padStart(2, '0')}`,
          location: {
            latitude: Number(birthData.lat),
            longitude: Number(birthData.lon),
            timezone: String(birthData.timezone ?? 'UTC'),
          },
        }
      : {
          date: '',
          time: '',
          location: {
            latitude: 0,
            longitude: 0,
            timezone: 'UTC',
          },
        },
    western_tropical: { planets: {}, aspects: [], houses: [], angles: [], calculation_metadata: { house_system: 'placidus', coordinate_system: 'geocentric', ephemeris_version: '1.0', calculated_at: new Date() } },
    lastUpdated: new Date(),
  };

  // Type guard for loaded state
  const isLoadedState = (data: MultiSystemChartData): data is LoadedChartState => {
    return data.status === 'loaded';
  };

  // Early return if not loaded state
  if (!isLoadedState(displayData)) {
    return (
      <div className='p-6 border border-yellow-500 rounded-md bg-yellow-900/50'>
        <div className='text-center'>
          <h3 className='font-bold text-cosmic-silver'>Chart Not Ready</h3>
          <p className='text-cosmic-silver/70'>
            Chart data is not in loaded state.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='cosmic-card bg-gradient-to-br from-cosmic-dark/80 to-cosmic-blue/80 rounded-lg p-4 border border-cosmic-silver/20'>
      <div className='flex flex-col space-y-6'>
        {/* Birth Information Header */}
        <div className='cosmic-card bg-gradient-to-br from-cosmic-purple/20 to-cosmic-gold/10 border border-cosmic-gold/20'>
          <div className='p-4'>
            <h2 className='mb-4 text-lg font-bold text-center text-cosmic-gold'>
              Multi-System Astrological Analysis
            </h2>
            {displayData.birth_info && (
              <div className='flex flex-wrap justify-center gap-4 text-sm'>
                <p className='text-cosmic-silver'>
                  <strong>Date:</strong> {displayData.birth_info.date}
                </p>
                <p className='text-cosmic-silver'>
                  <strong>Time:</strong> {displayData.birth_info.time}
                </p>
                {displayData.birth_info.location && (
                  <>
                    <p className='text-cosmic-silver'>
                      <strong>Coordinates:</strong>{' '}
                      {typeof displayData.birth_info.location.latitude ===
                      'number'
                        ? displayData.birth_info.location.latitude.toFixed(2)
                        : 'N/A'}
                      °,{' '}
                      {typeof displayData.birth_info.location.longitude ===
                      'number'
                        ? displayData.birth_info.location.longitude.toFixed(2)
                        : 'N/A'}
                      °
                    </p>
                    <p className='text-cosmic-silver'>
                      <strong>Timezone:</strong>{' '}
                      {displayData.birth_info.location.timezone ??
                        'Auto-detected'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Extracted Systems Navigation - show when tabs are deprecated or when filtering to core systems */}
        {(featureFlags.deprecateMultiSystemTabs && !overrideVisibleTabs) || 
         (overrideVisibleTabs && !overrideVisibleTabs.some(tab => ['psychology', 'spiritual', 'tcm', 'synthesis'].includes(tab))) ? (
          <ExtractedSystemsNavigation birthData={birthData} className="mb-6" />
        ) : null}

        {/* Multi-System Tabs with Error Boundaries */}
  <Tabs.Root defaultValue={overrideVisibleTabs?.[0] ?? 'western'} className='w-full'>
          <Tabs.List className='flex flex-wrap gap-2 mb-6 bg-cosmic-black/30 p-2 rounded-lg'>
      {(!overrideVisibleTabs || overrideVisibleTabs.includes('western')) && (
      <Tabs.Trigger
              value='western'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              ♌ Western
      </Tabs.Trigger>)}
      {(!overrideVisibleTabs || overrideVisibleTabs.includes('vedic')) && (
      <Tabs.Trigger
              value='vedic'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🕉️ Vedic
      </Tabs.Trigger>)}
      {(!overrideVisibleTabs || overrideVisibleTabs.includes('chinese')) && (
      <Tabs.Trigger
              value='chinese'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🐉 Chinese
      </Tabs.Trigger>)}
      {(!overrideVisibleTabs || overrideVisibleTabs.includes('mayan')) && (
      <Tabs.Trigger
              value='mayan'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🌞 Mayan
      </Tabs.Trigger>)}
      {(!overrideVisibleTabs || overrideVisibleTabs.includes('uranian')) && (
      <Tabs.Trigger
              value='uranian'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              ⚡ Uranian
      </Tabs.Trigger>)}
            {(!overrideVisibleTabs || overrideVisibleTabs.includes('spiritual')) && (!featureFlags.deprecateMultiSystemTabs || overrideVisibleTabs) && (
      <Tabs.Trigger
              value='spiritual'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🔮 Spiritual
      </Tabs.Trigger>)}
            {(!overrideVisibleTabs || overrideVisibleTabs.includes('tcm')) && (!featureFlags.deprecateMultiSystemTabs || overrideVisibleTabs) && (
      <Tabs.Trigger
              value='tcm'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🌿 TCM
      </Tabs.Trigger>)}
            {(!overrideVisibleTabs || overrideVisibleTabs.includes('psychology')) && (!featureFlags.deprecateMultiSystemTabs || overrideVisibleTabs) && (
      <Tabs.Trigger
              value='psychology'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🧠 Psychology
      </Tabs.Trigger>)}
      {(!overrideVisibleTabs || overrideVisibleTabs.includes('synthesis')) && (
      <Tabs.Trigger
              value='synthesis'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              ⚖️ Synthesis
      </Tabs.Trigger>)}
          </Tabs.List>          <Tabs.Content value='western' className='pt-4'>
            <ChartErrorBoundary>
              <WesternChart data={displayData.western_tropical} />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='vedic' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.vedic_sidereal ? (
                <VedicChart data={displayData.vedic_sidereal} />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No Vedic chart data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='chinese' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.chinese ? (
                <ChineseChart data={displayData.chinese} />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No Chinese chart data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='mayan' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.mayan ? (
                <MayanChart data={displayData.mayan} />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No Mayan chart data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='uranian' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.uranian ? (
                <UranianChart data={displayData.uranian} />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No Uranian chart data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>

          {(!overrideVisibleTabs || overrideVisibleTabs.includes('spiritual')) && (<Tabs.Content value='spiritual' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.spiritual_systems ? (
                <SpiritualChart
                  chartData={displayData.spiritual_systems}
                  _birthData={birthData}
                  isLoading={false}
                />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No spiritual systems data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>)}

          {(!overrideVisibleTabs || overrideVisibleTabs.includes('tcm')) && (<Tabs.Content value='tcm' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.tcm ? (
                <TCMChart
                  data={displayData.tcm}
                  birthData={birthData}
                  isLoading={false}
                />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No TCM chart data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>)}

          {(!overrideVisibleTabs || overrideVisibleTabs.includes('psychology')) && (<Tabs.Content value='psychology' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.psychology ? (
                <PsychologyChart
                  data={displayData.psychology as unknown as PsychologyChartData}
                  birthData={birthData}
                  isLoading={false}
                />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No psychology chart data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>)}

          {(!overrideVisibleTabs || overrideVisibleTabs.includes('synthesis')) && (<Tabs.Content value='synthesis' className='pt-4'>
            <ChartErrorBoundary>
              {displayData.synthesis ? (
                <SynthesisChart data={displayData.synthesis} />
              ) : (
                <div className='p-4 text-center text-cosmic-silver'>
                  No synthesis data available
                </div>
              )}
            </ChartErrorBoundary>
          </Tabs.Content>)}
        </Tabs.Root>

        {/* Footer with methodology */}
        <div className='cosmic-card bg-gradient-to-br from-cosmic-blue/20 to-cosmic-purple/10 border border-cosmic-silver/20'>
          <div className='p-4'>
            <p className='text-sm text-center text-cosmic-silver'>
              This analysis combines Western tropical astrology, Vedic sidereal
              calculations, Chinese Four Pillars, Mayan sacred calendar, Uranian
              techniques, spiritual consciousness systems (Tarot, Kabbalah),
              Traditional Chinese Medicine (Five Elements, meridians), psychology
              integration (MBTI, Enneagram), and synthesis methodologies to provide
              a comprehensive multi-dimensional perspective on your cosmic blueprint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSystemChartDisplay;
