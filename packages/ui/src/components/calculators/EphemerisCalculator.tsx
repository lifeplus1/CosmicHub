/**
 * Ephemeris Calculator Component
 * Calculates planetary positions for given dates
 */

import React, { useState } from 'react';

interface EphemerisCalculatorProps {
  date?: string;
  className?: string;
}

export const EphemerisCalculator: React.FC<EphemerisCalculatorProps> = ({
  date,
  className = '',
}) => {
  const [selectedDate, setSelectedDate] = useState(date ?? '');

  return (
    <div className={`ephemeris-calculator ${className}`}>
      <div className='calculator-container p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Ephemeris Calculator</h3>
        <div className='input-group mb-4'>
          <label htmlFor='date-input' className='block text-sm font-medium mb-2'>
            Select Date:
          </label>
          <input
            id='date-input'
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='w-full p-2 border rounded'
          />
        </div>
        <div className='results bg-gray-50 p-4 rounded'>
          <p className='text-gray-600'>
            Planetary positions will be calculated for: {selectedDate || 'Select a date'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EphemerisCalculator;
