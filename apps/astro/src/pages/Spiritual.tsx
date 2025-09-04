import React from 'react';
import MultiSystemChartDisplay from '../components/MultiSystemChart';
import { useSpiritualChartData } from '../routes/hooks/useSpiritualChartData';
import DomainPageFrame from '../components/layout/DomainPageFrame';

const SpiritualPage: React.FC = () => {
  const { data, isLoading, error, refresh } = useSpiritualChartData({ autoLoad: true });
  return (
    <DomainPageFrame title='Spiritual Systems' onRefresh={refresh} isRefreshing={isLoading} error={error}>
      <React.Suspense fallback={<div>Loading spiritual systems...</div>}>
        <MultiSystemChartDisplay overrideVisibleTabs={['spiritual']} isLoading={isLoading} />
      </React.Suspense>
    </DomainPageFrame>
  );
};
SpiritualPage.displayName = 'SpiritualPage';
export default SpiritualPage;
