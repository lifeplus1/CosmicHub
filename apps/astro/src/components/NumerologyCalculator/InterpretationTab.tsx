import React from 'react';
import type { Interpretation } from './types';

interface InterpretationTabProps {
  interpretation: Interpretation;
}

const InterpretationTab: React.FC<InterpretationTabProps> = ({
  interpretation,
}) => (
  <div className='flex flex-col p-4 space-y-6'>
    {Object.entries(interpretation).map(([key, value]) => (
      <div key={key} className='border-l-4 border-purple-500 cosmic-card'>
        <div className='p-4'>
          <div className='flex flex-col space-y-2'>
            <h3 className='font-bold text-purple-600 capitalize text-md'>
              {key.replace('_', ' ')}
            </h3>
            <p className='text-cosmic-silver'>{value}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default InterpretationTab;
