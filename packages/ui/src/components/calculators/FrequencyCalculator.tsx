/**
 * Frequency Calculator Component
 * Calculates healing frequencies and audio settings
 */

import React, { useState, memo, useCallback } from 'react';

interface FrequencyCalculatorProps {
  baseFrequency?: number;
  className?: string;
}

export const FrequencyCalculator: React.FC<FrequencyCalculatorProps> = memo(({
  baseFrequency = 440,
  className = '',
}) => {
  const [frequency, setFrequency] = useState(baseFrequency);

  const handleFrequencyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(Number(e.target.value));
  }, []);

  return (
    <div className={`frequency-calculator ${className}`}>
      <div className='calculator-container p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Frequency Calculator</h3>
        <div className='input-group mb-4'>
          <label
            htmlFor='frequency-input'
            className='block text-sm font-medium mb-2'
          >
            Base Frequency (Hz):
          </label>
          <input
            id='frequency-input'
            type='number'
            value={frequency}
            onChange={handleFrequencyChange}
            className='w-full p-2 border rounded'
            min='20'
            max='20000'
          />
        </div>
        <div className='results bg-gray-50 p-4 rounded'>
          <p className='text-gray-600'>
            Calculated healing frequencies for: {frequency}Hz
          </p>
        </div>
      </div>
    </div>
  );
});

FrequencyCalculator.displayName = 'FrequencyCalculator';

export default FrequencyCalculator;
