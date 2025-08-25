import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  FaCalendarAlt,
  FaClock,
  FaSpinner,
  FaExclamationTriangle,
} from 'react-icons/fa';
import DateRangeForm from './DateRangeForm';
import type { TransitResult, LunarTransitResult, DateRange } from './types';

// Enhanced components with better UI and error handling
const TransitsTabContent: React.FC<{
  transitResults: TransitResult[];
  loading: boolean;
  error: string | null;
  dateRange: DateRange;
  onCalculateTransits: () => void;
  onClearError: () => void;
  transitSummary: {
    total: number;
    major: number;
    challenging: number;
    harmonious: number;
    intensity: number;
  };
}> = ({
  transitResults,
  loading,
  error,
  dateRange,
  onCalculateTransits,
  onClearError,
  transitSummary,
}) => (
  <div className='cosmic-card'>
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-cosmic-gold'>
          Planet Transits
        </h3>
        <span className='text-sm text-cosmic-silver'>
          {dateRange.startDate} to {dateRange.endDate}
        </span>
      </div>

      {error !== null && (
        <div className='mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg'>
          <div className='flex items-center gap-2 text-red-400'>
            <FaExclamationTriangle className='flex-shrink-0' />
            <span className='text-sm'>{error}</span>
            <button
              onClick={onClearError}
              className='ml-auto text-xs hover:text-red-300 transition-colors'
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onCalculateTransits}
        disabled={loading}
        className='mb-4 cosmic-button flex items-center gap-2'
      >
        {loading && <FaSpinner className='animate-spin' />}
        {loading ? 'Calculating...' : 'Calculate Transits'}
      </button>

      {transitResults.length > 0 && (
        <div className='space-y-4'>
          {/* Summary Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-cosmic-deep-purple/30 rounded-lg'>
            <div className='text-center'>
              <div className='text-xl font-bold text-cosmic-gold'>
                {transitSummary.total}
              </div>
              <div className='text-xs text-cosmic-silver'>Total Aspects</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-green-400'>
                {transitSummary.harmonious}
              </div>
              <div className='text-xs text-cosmic-silver'>Harmonious</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-red-400'>
                {transitSummary.challenging}
              </div>
              <div className='text-xs text-cosmic-silver'>Challenging</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-cosmic-purple'>
                {transitSummary.intensity}%
              </div>
              <div className='text-xs text-cosmic-silver'>Avg Intensity</div>
            </div>
          </div>

          {/* Transit Results */}
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {transitResults.slice(0, 10).map(transit => (
              <div
                key={transit.id}
                className='p-3 bg-cosmic-deep-purple/20 rounded-lg border border-cosmic-purple/20'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-medium text-cosmic-gold'>
                    {transit.planet} {transit.aspect} {transit.natal_planet}
                  </span>
                  <span className='text-xs text-cosmic-silver'>
                    {transit.date}
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      transit.energy === 'harmonious'
                        ? 'bg-green-900/30 text-green-400'
                        : transit.energy === 'challenging'
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-cosmic-purple/30 text-cosmic-silver'
                    }`}
                  >
                    {transit.energy}
                  </span>
                  <span className='text-cosmic-silver'>
                    Intensity: {Math.round(transit.intensity)}%
                  </span>
                </div>
                {typeof transit.description === 'string' &&
                  transit.description.length > 0 && (
                    <p className='text-xs text-cosmic-silver mt-2'>
                      {transit.description}
                    </p>
                  )}
              </div>
            ))}
            {transitResults.length > 10 && (
              <div className='text-center text-cosmic-silver text-sm py-2'>
                Showing first 10 of {transitResults.length} transits
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

const LunarCyclesTabContent: React.FC<{
  lunarTransits: LunarTransitResult[];
  loadingLunar: boolean;
  error: string | null;
  dateRange: DateRange;
  onCalculateLunar: () => void;
  onClearError: () => void;
  lunarSummary: {
    total: number;
    newMoons: number;
    fullMoons: number;
    averageIntensity: number;
  };
}> = ({
  lunarTransits,
  loadingLunar,
  error,
  dateRange,
  onCalculateLunar,
  onClearError,
  lunarSummary,
}) => (
  <div className='cosmic-card'>
    <div className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-cosmic-gold'>Lunar Cycles</h3>
        <span className='text-sm text-cosmic-silver'>
          {dateRange.startDate} to {dateRange.endDate}
        </span>
      </div>

      {error !== null && (
        <div className='mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg'>
          <div className='flex items-center gap-2 text-red-400'>
            <FaExclamationTriangle className='flex-shrink-0' />
            <span className='text-sm'>{error}</span>
            <button
              onClick={onClearError}
              className='ml-auto text-xs hover:text-red-300 transition-colors'
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onCalculateLunar}
        disabled={loadingLunar}
        className='mb-4 cosmic-button flex items-center gap-2'
      >
        {loadingLunar && <FaSpinner className='animate-spin' />}
        {loadingLunar ? 'Calculating...' : 'Calculate Lunar Cycles'}
      </button>

      {lunarTransits.length > 0 && (
        <div className='space-y-4'>
          {/* Summary Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-cosmic-deep-purple/30 rounded-lg'>
            <div className='text-center'>
              <div className='text-xl font-bold text-cosmic-gold'>
                {lunarSummary.total}
              </div>
              <div className='text-xs text-cosmic-silver'>Total Days</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-blue-400'>
                {lunarSummary.newMoons}
              </div>
              <div className='text-xs text-cosmic-silver'>New Moons</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-yellow-400'>
                {lunarSummary.fullMoons}
              </div>
              <div className='text-xs text-cosmic-silver'>Full Moons</div>
            </div>
            <div className='text-center'>
              <div className='text-xl font-bold text-cosmic-purple'>
                {lunarSummary.averageIntensity}%
              </div>
              <div className='text-xs text-cosmic-silver'>Avg Intensity</div>
            </div>
          </div>

          {/* Lunar Transit Results */}
          <div className='space-y-3 max-h-96 overflow-y-auto'>
            {lunarTransits.slice(0, 10).map((lunar, index) => (
              <div
                key={`${lunar.date}-${index}`}
                className='p-3 bg-cosmic-deep-purple/20 rounded-lg border border-cosmic-purple/20'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-medium text-cosmic-gold'>
                    {lunar.phase}
                  </span>
                  <span className='text-xs text-cosmic-silver'>
                    {lunar.date}
                  </span>
                </div>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-cosmic-silver'>
                    Moon in {lunar.moon_sign}
                  </span>
                  <span className='text-cosmic-silver'>
                    Intensity: {Math.round(lunar.intensity)}%
                  </span>
                </div>
                <div className='mt-2'>
                  <span className='px-2 py-1 rounded text-xs bg-cosmic-purple/30 text-cosmic-silver'>
                    {lunar.energy}
                  </span>
                </div>
                {typeof lunar.description === 'string' &&
                  lunar.description.length > 0 && (
                    <p className='text-xs text-cosmic-silver mt-2'>
                      {lunar.description}
                    </p>
                  )}
              </div>
            ))}
            {lunarTransits.length > 10 && (
              <div className='text-center text-cosmic-silver text-sm py-2'>
                Showing first 10 of {lunarTransits.length} lunar transits
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

interface TransitTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  transitResults: TransitResult[];
  lunarTransits: LunarTransitResult[];
  loading: boolean;
  loadingLunar: boolean;
  error: string | null;
  dateRange: DateRange;
  setDateRange: (dateRange: DateRange) => void;
  onCalculateTransits: () => void;
  onCalculateLunar: () => void;
  onClearError: () => void;
  transitSummary: {
    total: number;
    major: number;
    challenging: number;
    harmonious: number;
    intensity: number;
  };
  lunarSummary: {
    total: number;
    newMoons: number;
    fullMoons: number;
    averageIntensity: number;
  };
}

const TransitTabs: React.FC<TransitTabsProps> = ({
  activeTab,
  setActiveTab,
  transitResults,
  lunarTransits,
  loading,
  loadingLunar,
  error,
  dateRange,
  setDateRange,
  onCalculateTransits,
  onCalculateLunar,
  onClearError,
  transitSummary,
  lunarSummary,
}) => {
  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={setActiveTab}
      className='space-y-6'
    >
      <Tabs.List className='flex p-1 border rounded-lg bg-cosmic-deep-purple/30 backdrop-blur-sm border-cosmic-purple/20'>
        <Tabs.Trigger
          value='transits'
          className='flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-cosmic-purple data-[state=active]:text-white data-[state=active]:shadow-sm text-cosmic-silver hover:text-white hover:bg-cosmic-purple/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-cosmic-deep-purple'
          aria-label='Planet Transits'
        >
          <FaCalendarAlt className='mr-2' />
          Planet Transits
          {transitResults.length > 0 && (
            <span className='ml-2 px-1.5 py-0.5 text-xs bg-cosmic-gold/20 text-cosmic-gold rounded'>
              {transitResults.length}
            </span>
          )}
        </Tabs.Trigger>
        <Tabs.Trigger
          value='lunar'
          className='flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-cosmic-purple data-[state=active]:text-white data-[state=active]:shadow-sm text-cosmic-silver hover:text-white hover:bg-cosmic-purple/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-cosmic-deep-purple'
          aria-label='Lunar Cycles'
        >
          <FaClock className='mr-2' />
          Lunar Cycles
          {lunarTransits.length > 0 && (
            <span className='ml-2 px-1.5 py-0.5 text-xs bg-cosmic-gold/20 text-cosmic-gold rounded'>
              {lunarTransits.length}
            </span>
          )}
        </Tabs.Trigger>
      </Tabs.List>

      <DateRangeForm dateRange={dateRange} setDateRange={setDateRange} />

      <Tabs.Content value='transits' className='focus:outline-none'>
        <TransitsTabContent
          transitResults={transitResults}
          loading={loading}
          error={error}
          dateRange={dateRange}
          onCalculateTransits={onCalculateTransits}
          onClearError={onClearError}
          transitSummary={transitSummary}
        />
      </Tabs.Content>

      <Tabs.Content value='lunar' className='focus:outline-none'>
        <LunarCyclesTabContent
          lunarTransits={lunarTransits}
          loadingLunar={loadingLunar}
          error={error}
          dateRange={dateRange}
          onCalculateLunar={onCalculateLunar}
          onClearError={onClearError}
          lunarSummary={lunarSummary}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default TransitTabs;
