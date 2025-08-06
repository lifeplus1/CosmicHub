import React, { Suspense } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { MultiSystemChartData } from './types';

// Lazy load chart components for optimal performance
const WesternChart = React.lazy(() => import('./WesternChart'));
const VedicChart = React.lazy(() => import('./VedicChart'));
const ChineseChart = React.lazy(() => import('./ChineseChart'));
const MayanChart = React.lazy(() => import('./MayanChart'));
const UranianChart = React.lazy(() => import('./UranianChart'));
const SynthesisChart = React.lazy(() => import('./SynthesisChart'));

// Loading fallback component for lazy-loaded charts
const ChartLoadingFallback: React.FC = () => (
  <div className="cosmic-card p-6">
    <div className="flex items-center justify-center space-x-3">
      <div className="animate-spin text-cosmic-purple text-2xl">⭐</div>
      <p className="text-cosmic-silver">Loading chart...</p>
    </div>
  </div>
);

interface MultiSystemChartProps {
  chartData: MultiSystemChartData;
  isLoading?: boolean;
}

export const MultiSystemChartDisplay: React.FC<MultiSystemChartProps> = ({ chartData, isLoading = false }) => {
  const bgColor = "purple-50";
  const cardBg = "white";

  if (isLoading) {
    return (
      <div className={`p-4 bg-${bgColor} rounded-lg`}>
        <p className="text-center text-cosmic-silver">Calculating multi-system chart...</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="p-4 border border-yellow-500 rounded-md bg-yellow-900/50">
        <div className="flex space-x-4">
          <span className="text-xl text-yellow-500">⚠️</span>
          <div>
            <h3 className="font-bold text-white">No Chart Data</h3>
            <p className="text-white/80">Please calculate a chart to see the multi-system analysis.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-${bgColor} rounded-lg p-4`}>
      <div className="flex flex-col space-y-6">
        {/* Birth Information Header */}
        <div className={`cosmic-card bg-${cardBg}`}>
          <div className="p-4">
            <h2 className="mb-4 text-lg font-bold text-center text-purple-700">
              Multi-System Astrological Analysis
            </h2>
            {chartData.birth_info && (
              <div className="flex flex-wrap justify-center gap-4">
                <p className="text-cosmic-silver"><strong>Date:</strong> {chartData.birth_info.date}</p>
                <p className="text-cosmic-silver"><strong>Time:</strong> {chartData.birth_info.time}</p>
                <p className="text-cosmic-silver"><strong>Coordinates:</strong> {chartData.birth_info.location?.latitude?.toFixed(2)}°, {chartData.birth_info.location?.longitude?.toFixed(2)}°</p>
                <p className="text-cosmic-silver"><strong>Timezone:</strong> {chartData.birth_info.location?.timezone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Multi-System Tabs */}
        <Tabs.Root>
          <Tabs.List className="flex flex-wrap">
            <Tabs.Trigger value="western" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Western Tropical</Tabs.Trigger>
            <Tabs.Trigger value="vedic" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Vedic Sidereal</Tabs.Trigger>
            <Tabs.Trigger value="chinese" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Chinese</Tabs.Trigger>
            <Tabs.Trigger value="mayan" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Mayan</Tabs.Trigger>
            <Tabs.Trigger value="uranian" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Uranian</Tabs.Trigger>
            <Tabs.Trigger value="synthesis" className="px-4 py-2 data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple">Synthesis</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="western" className="pt-4">
            <Suspense fallback={<ChartLoadingFallback />}>
              <WesternChart data={chartData.western_tropical} />
            </Suspense>
          </Tabs.Content>
          <Tabs.Content value="vedic" className="pt-4">
            <Suspense fallback={<ChartLoadingFallback />}>
              <VedicChart data={chartData.vedic_sidereal ?? {}} />
            </Suspense>
          </Tabs.Content>
          <Tabs.Content value="chinese" className="pt-4">
            <Suspense fallback={<ChartLoadingFallback />}>
              <ChineseChart data={chartData.chinese ?? {}} />
            </Suspense>
          </Tabs.Content>
          <Tabs.Content value="mayan" className="pt-4">
            <Suspense fallback={<ChartLoadingFallback />}>
              <MayanChart data={chartData.mayan ?? {}} />
            </Suspense>
          </Tabs.Content>
          <Tabs.Content value="uranian" className="pt-4">
            <Suspense fallback={<ChartLoadingFallback />}>
              <UranianChart data={chartData.uranian ?? {}} />
            </Suspense>
          </Tabs.Content>
          <Tabs.Content value="synthesis" className="pt-4">
            <Suspense fallback={<ChartLoadingFallback />}>
              <SynthesisChart data={chartData.synthesis ?? {}} />
            </Suspense>
          </Tabs.Content>
        </Tabs.Root>

        {/* Footer with methodology */}
        <div className={`cosmic-card bg-${cardBg} border border-cosmic-silver/30`}>
          <div className="p-4">
            <p className="text-sm text-center text-white/80">
              This analysis combines Western tropical astrology, Vedic sidereal calculations, Chinese Four Pillars, 
              Mayan sacred calendar, and Uranian midpoint techniques to provide a comprehensive astrological perspective.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSystemChartDisplay;