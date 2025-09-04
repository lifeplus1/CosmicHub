import React from 'react';
import MultiSystemChartDisplay from '../components/MultiSystemChart';
import { useTCMChartData } from '../routes/hooks/useTCMChartData';
import DomainPageFrame from '../components/layout/DomainPageFrame';

/**
 * Standalone TCM Page
 * - Will eventually replace the TCM tab inside MultiSystemChartDisplay
 * - Uses isolated data hook for clean separation & code-splitting
 */
const TCMPage: React.FC = () => {
  const { data, isLoading, error, refresh } = useTCMChartData();

  return (
    <DomainPageFrame
      title='TCM Analysis'
      onRefresh={refresh}
      isRefreshing={isLoading}
      error={error}
    >
      <React.Suspense fallback={<div>Loading TCM visualization...</div>}>
        <MultiSystemChartDisplay
          birthData={data?.normalizedBirthData}
          overrideVisibleTabs={['tcm']}
          isLoading={isLoading}
        />
      </React.Suspense>
    </DomainPageFrame>
  );
};

TCMPage.displayName = 'TCMPage';
export default TCMPage;
