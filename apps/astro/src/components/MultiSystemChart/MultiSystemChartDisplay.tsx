import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { MultiSystemChartData } from './types';
import type { UnifiedBirthData } from '@cosmichub/types';
import WesternChart from './WesternChart';
import VedicChart from './VedicChart';
import ChineseChart from './ChineseChart';
import MayanChart from './MayanChart';
import UranianChart from './UranianChart';
import SynthesisChart from './SynthesisChart';
import SpiritualChart from './SpiritualChart';
import TCMChart from './TCMChart';
import PsychologyChart from './PsychologyChart';

interface MultiSystemChartProps {
  chartData?: MultiSystemChartData;
  birthData?: UnifiedBirthData;
  // showComparison prop reserved for future comparative views (currently unused)
  showComparison?: boolean;
  isLoading?: boolean;
}

// Error Boundary Component
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Multi-system chart component error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className='cosmic-card bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30'>
            <div className='p-6 text-center'>
              <h3 className='font-bold text-red-400 mb-2'>
                Chart Display Error
              </h3>
              <p className='text-cosmic-silver/70 text-sm'>
                There was an error displaying this chart section.
              </p>
              <button
                onClick={() =>
                  this.setState({ hasError: false, error: undefined })
                }
                className='mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm'
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export const MultiSystemChartDisplay: React.FC<MultiSystemChartProps> = ({
  chartData,
  birthData,
  // maintain API surface while unused
  showComparison: _showComparison = false,
  isLoading = false,
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
      : undefined,
  };

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

        {/* Multi-System Tabs with Error Boundaries */}
        <Tabs.Root defaultValue='western' className='w-full'>
          <Tabs.List className='flex flex-wrap gap-2 mb-6 bg-cosmic-black/30 p-2 rounded-lg'>
            <Tabs.Trigger
              value='western'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              ♌ Western
            </Tabs.Trigger>
            <Tabs.Trigger
              value='vedic'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🕉️ Vedic
            </Tabs.Trigger>
            <Tabs.Trigger
              value='chinese'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🐉 Chinese
            </Tabs.Trigger>
            <Tabs.Trigger
              value='mayan'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🌞 Mayan
            </Tabs.Trigger>
            <Tabs.Trigger
              value='uranian'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              ⚡ Uranian
            </Tabs.Trigger>
            <Tabs.Trigger
              value='spiritual'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🔮 Spiritual
            </Tabs.Trigger>
            <Tabs.Trigger
              value='tcm'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🌿 TCM
            </Tabs.Trigger>
            <Tabs.Trigger
              value='psychology'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              🧠 Psychology
            </Tabs.Trigger>
            <Tabs.Trigger
              value='synthesis'
              className='flex-1 min-w-fit py-2 px-4 rounded-md text-sm font-medium transition-all data-[state=active]:bg-cosmic-purple/30 data-[state=active]:text-cosmic-gold hover:bg-cosmic-purple/10 text-cosmic-silver'
            >
              ⚖️ Synthesis
            </Tabs.Trigger>
          </Tabs.List>          <Tabs.Content value='western' className='pt-4'>
            <ChartErrorBoundary>
              <WesternChart data={displayData.western_tropical} />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='vedic' className='pt-4'>
            <ChartErrorBoundary>
              <VedicChart data={displayData.vedic_sidereal ?? {}} />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='chinese' className='pt-4'>
            <ChartErrorBoundary>
              <ChineseChart data={displayData.chinese ?? {}} />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='mayan' className='pt-4'>
            <ChartErrorBoundary>
              <MayanChart data={displayData.mayan ?? {}} />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='uranian' className='pt-4'>
            <ChartErrorBoundary>
              <UranianChart data={displayData.uranian ?? {}} />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='spiritual' className='pt-4'>
            <ChartErrorBoundary>
              <SpiritualChart
                chartData={displayData.spiritual_systems ?? {}}
                _birthData={birthData}
                isLoading={false}
              />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='tcm' className='pt-4'>
            <ChartErrorBoundary>
              <TCMChart
                data={displayData.tcm as any ?? {}}
                birthData={birthData}
                isLoading={false}
              />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='psychology' className='pt-4'>
            <ChartErrorBoundary>
              <PsychologyChart
                data={displayData.psychology as any ?? {}}
                birthData={birthData}
                isLoading={false}
              />
            </ChartErrorBoundary>
          </Tabs.Content>

          <Tabs.Content value='synthesis' className='pt-4'>
            <ChartErrorBoundary>
              <SynthesisChart data={displayData.synthesis ?? {}} />
            </ChartErrorBoundary>
          </Tabs.Content>
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
