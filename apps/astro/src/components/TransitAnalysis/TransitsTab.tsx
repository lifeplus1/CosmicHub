import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import TransitsTab from './TransitsTab';
import LunarCyclesTab from './LunarCyclesTab';
import DateRangeForm from './DateRangeForm';
import type { TransitResult, LunarTransitResult, DateRange } from './types';

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
        <TransitsTab
          transitResults={transitResults}
          loading={loading}
          dateRange={dateRange}
          onCalculateTransits={onCalculateTransits}
        />
      </Tabs.Content>
      <Tabs.Content value="lunar" className="focus:outline-none">
        <LunarCyclesTab
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