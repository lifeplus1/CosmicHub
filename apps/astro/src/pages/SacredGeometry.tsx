import React from 'react';
import { SacredGeometryDemo } from '../components/demos/SacredGeometryDemo';
import DomainPageFrame from '../components/layout/DomainPageFrame';

const SacredGeometryPage: React.FC = () => {
  return (
    <DomainPageFrame 
      title='Sacred Geometry Visualization' 
      onRefresh={() => window.location.reload()} 
      isRefreshing={false} 
      error={null}
    >
      <div className="min-h-screen bg-gray-950">
        <SacredGeometryDemo />
      </div>
    </DomainPageFrame>
  );
};

SacredGeometryPage.displayName = 'SacredGeometryPage';
export default SacredGeometryPage;
