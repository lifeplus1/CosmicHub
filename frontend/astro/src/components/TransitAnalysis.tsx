import React, { useState, lazy, Suspense } from 'react';
import { useToast } from './ToastProvider';
import * as Tabs from '@radix-ui/react-tabs';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import FeatureGuard from './FeatureGuard';
import type { BirthData } from '../types';
import type { 
  TransitResult, 
  LunarTransitResult, 
  DateRange 
} from './TransitAnalysis/types';

// Lazy load tab components for better performance
const TransitsTab = lazy(() => import('./TransitAnalysis/TransitsTab'));
const LunarCyclesTab = lazy(() => import('./TransitAnalysis/LunarCyclesTab'));

interface TransitAnalysisProps {
  birthData: BirthData;
}

// Loading component for Suspense fallback
const TabLoader: React.FC = () => (
  <div className="cosmic-card">
    <div className="p-6 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cosmic-gold"></div>
        <span className="text-cosmic-silver">Loading...</span>
      </div>
    </div>
  </div>
);

const TransitAnalysis: React.FC<TransitAnalysisProps> = ({ birthData }) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>('transits');
  const [transitResults, setTransitResults] = useState<TransitResult | null>(null);
  const [lunarTransits, setLunarTransits] = useState<LunarTransitResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingLunar, setLoadingLunar] = useState<boolean>(false);
  
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const { showToast } = useToast();

  // Date range change handler
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate transits function
  const calculateTransits = async () => {
    if (!birthData) {
      showToast('Birth data is required for transit calculations', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/astro/transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birth_date: birthData.birthDate,
          birth_time: birthData.birthTime,
          birth_location: birthData.birthLocation,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Transit calculation failed: ${response.statusText}`);
      }

      const data: TransitResult = await response.json();
      setTransitResults(data);
      showToast('Transit analysis completed successfully!', 'success');
    } catch (error) {
      console.error('Error calculating transits:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate transits';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate lunar transits function
  const calculateLunarTransits = async () => {
    if (!birthData) {
      showToast('Birth data is required for lunar transit calculations', 'error');
      return;
    }

    setLoadingLunar(true);
    try {
      const response = await fetch('/api/v1/astro/lunar-transits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birth_date: birthData.birthDate,
          birth_time: birthData.birthTime,
          birth_location: birthData.birthLocation,
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        }),
      });

      if (!response.ok) {
        throw new Error(`Lunar transit calculation failed: ${response.statusText}`);
      }

      const data: LunarTransitResult = await response.json();
      setLunarTransits(data);
      showToast('Lunar transit analysis completed successfully!', 'success');
    } catch (error) {
      console.error('Error calculating lunar transits:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate lunar transits';
      showToast(errorMessage, 'error');
    } finally {
      setLoadingLunar(false);
    }
  };

  return (
    <FeatureGuard feature="transitAnalysis">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cosmic-gold mb-4">
            Transit Analysis
          </h1>
          <p className="text-cosmic-silver leading-relaxed">
            Explore how current planetary movements influence your natal chart. 
            Transit analysis reveals timing for opportunities, challenges, and personal growth.
          </p>
        </div>

        <Tabs.Root 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Tab Navigation */}
          <Tabs.List className="flex p-1 bg-cosmic-deep-purple/30 backdrop-blur-sm rounded-lg border border-cosmic-purple/20">
            <Tabs.Trigger
              value="transits"
              className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-cosmic-purple data-[state=active]:text-white data-[state=active]:shadow-sm text-cosmic-silver hover:text-white hover:bg-cosmic-purple/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-cosmic-deep-purple"
            >
              <FaCalendarAlt className="mr-2" />
              Planet Transits
            </Tabs.Trigger>
            <Tabs.Trigger
              value="lunar"
              className="flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-cosmic-purple data-[state=active]:text-white data-[state=active]:shadow-sm text-cosmic-silver hover:text-white hover:bg-cosmic-purple/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-cosmic-deep-purple"
            >
              <FaClock className="mr-2" />
              Lunar Cycles
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab Content */}
          <Suspense fallback={<TabLoader />}>
            <Tabs.Content value="transits" className="focus:outline-none">
              <TransitsTab
                transitResults={transitResults}
                loading={loading}
                dateRange={dateRange}
                onDateChange={handleDateChange}
                onCalculateTransits={calculateTransits}
              />
            </Tabs.Content>

            <Tabs.Content value="lunar" className="focus:outline-none">
              <LunarCyclesTab
                lunarTransits={lunarTransits}
                loadingLunar={loadingLunar}
                dateRange={dateRange}
                onDateChange={handleDateChange}
                onCalculateLunar={calculateLunarTransits}
              />
            </Tabs.Content>
          </Suspense>
        </Tabs.Root>
      </div>
    </FeatureGuard>
  );
};

export default TransitAnalysis;
