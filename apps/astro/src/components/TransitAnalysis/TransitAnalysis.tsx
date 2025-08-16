import React, { Suspense } from 'react';
import FeatureGuard from '../FeatureGuard';
import TransitTabs from './TransitsTab';  // Note: TransitTabs component is in TransitsTab.tsx file
import { TabLoader } from './TabLoader';
import { useTransitAnalysis } from './useTransitAnalysis';
import type { TransitBirthData } from './types';

export interface TransitAnalysisProps {
  birthData: TransitBirthData;
}

const TransitAnalysis: React.FC<TransitAnalysisProps> = ({ birthData }) => {
  const { 
    activeTab, 
    setActiveTab, 
    transitResults, 
    lunarTransits, 
    loading, 
    loadingLunar, 
    error,
    dateRange, 
    setDateRange, 
    calculateTransits, 
    calculateLunarTransits,
    clearError,
    isValidDateRange,
    transitSummary,
    lunarSummary,
    hasResults
  } = useTransitAnalysis(birthData);

  return (
    <FeatureGuard feature="transitAnalysis" requiredTier="premium">
      <div className="max-w-6xl p-6 mx-auto">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-cosmic-gold">Transit Analysis</h1>
          <p className="leading-relaxed text-cosmic-silver">
            Explore how current planetary movements influence your natal chart. 
            Transit analysis reveals timing for opportunities, challenges, and personal growth.
          </p>
          {!isValidDateRange && (
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                Please select a valid date range (max 1 year) to calculate transits.
              </p>
            </div>
          )}
        </div>
        
        <Suspense fallback={<TabLoader />}>
          <TransitTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            transitResults={transitResults}
            lunarTransits={lunarTransits}
            loading={loading}
            loadingLunar={loadingLunar}
            error={error}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onCalculateTransits={calculateTransits}
            onCalculateLunar={calculateLunarTransits}
            onClearError={clearError}
            transitSummary={transitSummary}
            lunarSummary={lunarSummary}
          />
        </Suspense>
        
        {hasResults && (
          <div className="mt-8 p-4 bg-cosmic-deep-purple/20 rounded-lg border border-cosmic-purple/20">
            <h3 className="text-lg font-semibold text-cosmic-gold mb-2">
              Analysis Complete
            </h3>
            <p className="text-cosmic-silver text-sm">
              Your transit analysis is ready. Use the tabs above to explore planetary transits 
              and lunar cycles for your selected date range. Results are cached for faster subsequent access.
            </p>
          </div>
        )}
      </div>
    </FeatureGuard>
  );
};

export default TransitAnalysis;