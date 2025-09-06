import React from 'react';
import { MultiSystemChartDisplay } from '../components/MultiSystemChart/MultiSystemChartDisplay';
import { useSynthesisChartData } from '../routes/hooks/useSynthesisChartData';
import DomainPageFrame from '../components/layout/DomainPageFrame';

const SynthesisPage: React.FC = () => {
  const { data: _data, isLoading, error, refresh } = useSynthesisChartData();
  
  return (
    <DomainPageFrame 
      title='Integration Overview' 
      onRefresh={refresh} 
      isRefreshing={isLoading} 
      error={error}
    >
      <React.Suspense fallback={<div>Loading synthesis systems...</div>}>
        <MultiSystemChartDisplay 
          overrideVisibleTabs={['synthesis']} 
          isLoading={isLoading} 
        />
      </React.Suspense>
    </DomainPageFrame>
  );
};

SynthesisPage.displayName = 'SynthesisPage';
export default SynthesisPage;
