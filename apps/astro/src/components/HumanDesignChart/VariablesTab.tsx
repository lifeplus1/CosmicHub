import React from 'react';
import type { TabProps } from './types';

const VariablesTab: React.FC<TabProps> = ({ humanDesignData }) => {
  return (
    <div className="cosmic-card">
      <div className="p-4">
        <h2 className="text-lg font-bold">Variables (PHS)</h2>
        <p className="text-gray-700">Primary Health System</p>
      </div>
      <div className="p-4">
        <p className="mb-6 text-lg">
          {humanDesignData.variables.description}
        </p>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-cosmic-silver">Digestion</p>
            <p className="font-bold text-md">{humanDesignData.variables.digestion}</p>
          </div>
          <div>
            <p className="text-cosmic-silver">Environment</p>
            <p className="font-bold text-md">{humanDesignData.variables.environment}</p>
          </div>
          <div>
            <p className="text-cosmic-silver">Awareness</p>
            <p className="font-bold text-md">{humanDesignData.variables.awareness}</p>
          </div>
          <div>
            <p className="text-cosmic-silver">Perspective</p>
            <p className="font-bold text-md">{humanDesignData.variables.perspective}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariablesTab;
