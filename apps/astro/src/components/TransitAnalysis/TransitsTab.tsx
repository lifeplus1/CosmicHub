import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import DateRangeForm from './DateRangeForm';
import type { TransitResult, LunarTransitResult, DateRange } from './types';

// Placeholder components
const TransitsTabContent: React.FC<{
  transitResults: TransitResult | null;
  loading: boolean;
  dateRange: DateRange;
  onCalculateTransits: () => void;
}> = ({ transitResults, loading, dateRange, onCalculateTransits }) => (
  <div className="cosmic-card">
    <div className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-cosmic-gold">Planet Transits</h3>
      <button
        onClick={onCalculateTransits}
        disabled={loading}
        className="mb-4 cosmic-button"
      >
        {loading ? 'Calculating...' : 'Calculate Transits'}
      </button>
      {transitResults && (
        <div className="space-y-2">
          <p className="text-cosmic-silver">Planet: {transitResults.planet}</p>
          <p className="text-cosmic-silver">Aspect: {transitResults.aspect}</p>
          <p className="text-cosmic-silver">Date: {transitResults.date}</p>
        </div>
      )}
    </div>
  </div>
);

const LunarCyclesTabContent: React.FC<{
  lunarTransits: LunarTransitResult | null;
  loadingLunar: boolean;
  dateRange: DateRange;
  onCalculateLunar: () => void;
}> = ({ lunarTransits, loadingLunar, dateRange, onCalculateLunar }) => (
  <div className="cosmic-card">
    <div className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-cosmic-gold">Lunar Cycles</h3>
      <button
        onClick={onCalculateLunar}
        disabled={loadingLunar}
        className="mb-4 cosmic-button"
      >
        {loadingLunar ? 'Calculating...' : 'Calculate Lunar Cycles'}
      </button>
      {lunarTransits && (
        <div className="space-y-2">
          <p className="text-cosmic-silver">Phase: {lunarTransits.phase}</p>
          <p className="text-cosmic-silver">Energy: {lunarTransits.energy}</p>
          <p className="text-cosmic-silver">Date: {lunarTransits.date}</p>
        </div>
      )}
    </div>
  </div>
);

interface TransitTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  transitResults: TransitResult | null;
  lunarTransits: LunarTransitResult | null;
  loading: boolean;
  loadingLunar: boolean;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  onCalculateTransits: () => void;
  onCalculateLunar: () => void;
}

const TransitTabs: React.FC<TransitTabsProps> = ({
  activeTab,
  setActiveTab,
  transitResults,
  lunarTransits,
  loading,
  loadingLunar,
  dateRange,
  setDateRange,
  onCalculateTransits,
  onCalculateLunar,
}) => {
  return (
    <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <Tabs.List className="flex p-1 border rounded-lg bg-cosmic-deep-purple/30 backdrop-blur-sm border-cosmic-purple/20">
        <Tabs.Trigger
          value="transits"
          className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-cosmic-purple data-[state=active]:text-white data-[state=active]:shadow-sm text-cosmic-silver hover:text-white hover:bg-cosmic-purple/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-cosmic-deep-purple"
          aria-label="Planet Transits"
        >
          <FaCalendarAlt className="mr-2" />
          Planet Transits
        </Tabs.Trigger>
        <Tabs.Trigger
          value="lunar"
          className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-cosmic-purple data-[state=active]:text-white data-[state=active]:shadow-sm text-cosmic-silver hover:text-white hover:bg-cosmic-purple/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-cosmic-deep-purple"
          aria-label="Lunar Cycles"
        >
          <FaClock className="mr-2" />
          Lunar Cycles
        </Tabs.Trigger>
      </Tabs.List>
      <DateRangeForm dateRange={dateRange} setDateRange={setDateRange} />
      <Tabs.Content value="transits" className="focus:outline-none">
        <TransitsTabContent
          transitResults={transitResults}
          loading={loading}
          dateRange={dateRange}
          onCalculateTransits={onCalculateTransits}
        />
      </Tabs.Content>
      <Tabs.Content value="lunar" className="focus:outline-none">
        <LunarCyclesTabContent
          lunarTransits={lunarTransits}
          loadingLunar={loadingLunar}
          dateRange={dateRange}
          onCalculateLunar={onCalculateLunar}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default TransitTabs;