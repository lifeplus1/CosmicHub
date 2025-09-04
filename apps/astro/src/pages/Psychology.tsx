import React from 'react';
import MultiSystemChartDisplay from '../components/MultiSystemChart';
import { usePsychologyChartData } from '../routes/hooks/usePsychologyChartData';
import DomainPageFrame from '../components/layout/DomainPageFrame';

const PsychologyPage: React.FC = () => {
  const { data, isLoading, error, refresh } = usePsychologyChartData();
  return (
    <DomainPageFrame title='Psychology Profile' onRefresh={refresh} isRefreshing={isLoading} error={error}>
      <React.Suspense fallback={<div>Loading psychology systems...</div>}>
        <MultiSystemChartDisplay overrideVisibleTabs={['psychology']} isLoading={isLoading} />
      </React.Suspense>
    </DomainPageFrame>
  );
};
PsychologyPage.displayName = 'PsychologyPage';
export default PsychologyPage;
