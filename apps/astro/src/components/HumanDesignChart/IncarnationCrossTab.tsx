import React from 'react';
import type { TabProps } from './types';

const IncarnationCrossTab: React.FC<TabProps> = ({ humanDesignData }) => {
  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h2 className="text-lg font-bold">{humanDesignData.incarnation_cross.name}</h2>
        <p className="text-gray-700">Your Life Purpose</p>
      </div>
      <div className="p-4">
        <p className="mb-6 text-lg">
          {humanDesignData.incarnation_cross.description}
        </p>
        
        <h3 className="mb-4 font-bold text-md">Cross Gates</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(humanDesignData.incarnation_cross.gates).map(([position, gate]) => (
            <div key={position}>
              <p className="capitalize text-cosmic-silver">{position.replace('_', ' ')}</p>
              <p className="font-bold">Gate {gate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncarnationCrossTab;
