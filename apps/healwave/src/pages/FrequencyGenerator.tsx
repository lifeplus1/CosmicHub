import React from 'react';
import { HealWaveFrequencyGenerator } from '../components/FrequencyGenerator';

const FrequencyGenerator: React.FC = () => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8 text-center'>
        Frequency Generator
      </h1>
      <HealWaveFrequencyGenerator />
    </div>
  );
};

export default FrequencyGenerator;
