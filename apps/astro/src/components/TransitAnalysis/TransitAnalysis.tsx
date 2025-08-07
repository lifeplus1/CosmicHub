import React, { Suspense } from 'react';
import FeatureGuard from '../FeatureGuard';
import TransitTabs from './transit-analysis/TransitTabs';
import { TabLoader } from './transit-analysis/TabLoader';
import { useTransitAnalysis } from './transit-analysis/useTransitAnalysis';
import type { BirthData } from '../../types';

interface TransitAnalysisProps {
  birthData: BirthData;
}

const TransitAnalysis: React.FC<TransitAnalysisProps> = ({ birthData }) => {
  const { activeTab, setActiveTab, transitResults, lunarTransits, loading, loadingLunar, dateRange, setDateRange, calculateTransits, calculateLunarTransits } = useTransitAnalysis(birthData);

  return (
    <FeatureGuard feature="transitAnalysis">
      <div className="max-w-6xl p-6 mx-auto">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-cosmic-gold">Transit Analysis</h1>
          <p className="leading-relaxed text-cosmic-silver">
            Explore how current planetary movements influence your natal chart. 
            Transit analysis reveals timing for opportunities, challenges, and personal growth.
          </p>
        </div>
        <Suspense fallback={<TabLoader />}>
          <TransitTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            transitResults={transitResults}
            lunarTransits={lunarTransits}
            loading={loading}
            loadingLunar={loadingLunar}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onCalculateTransits={calculateTransits}
            onCalculateLunar={calculateLunarTransits}
          />
        </Suspense>
      </div>
    </FeatureGuard>
  );
};

export default TransitAnalysis;