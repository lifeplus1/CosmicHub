import React from 'react';
import type { Systems } from './types';

const SystemsDisplay: React.FC<{ systems: Systems }> = ({ systems }) => (
  <div className='flex flex-col space-y-6'>
    <div className='cosmic-card'>
      <div className='p-4'>
        <h3 className='mb-4 text-lg font-bold'>Pythagorean System</h3>
        <p className='mb-4 text-cosmic-silver'>{systems.pythagorean.system}</p>
        <div className='grid grid-cols-3 gap-2 mb-4'>
          {Object.entries(systems.pythagorean.letter_values).map(
            ([letter, values]) => (
              <div
                key={letter}
                className='p-2 text-center rounded-md bg-gray-50'
              >
                <p className='font-bold'>{letter}</p>
                <p className='text-sm'>{values.join(', ')}</p>
              </div>
            )
          )}
        </div>
        <p className='mb-2 text-cosmic-silver'>
          Total Value: {systems.pythagorean.total_value}
        </p>
        <div className='flex flex-col space-y-2'>
          {systems.pythagorean.characteristics.map((char, index) => (
            <p key={index} className='text-cosmic-silver'>
              {char}
            </p>
          ))}
        </div>
      </div>
    </div>
    <div className='cosmic-card'>
      <div className='p-4'>
        <h3 className='mb-4 text-lg font-bold'>Chaldean System</h3>
        <p className='mb-4 text-cosmic-silver'>{systems.chaldean.system}</p>
        <div className='grid grid-cols-3 gap-2 mb-4'>
          {Object.entries(systems.chaldean.letter_values).map(
            ([letter, values]) => (
              <div
                key={letter}
                className='p-2 text-center rounded-md bg-gray-50'
              >
                <p className='font-bold'>{letter}</p>
                <p className='text-sm'>{values.join(', ')}</p>
              </div>
            )
          )}
        </div>
        <p className='mb-2 text-cosmic-silver'>
          Total Value: {systems.chaldean.total_value}
        </p>
        <p className='mb-2 text-cosmic-silver'>
          Chaldean Number: {systems.chaldean.chaldean_number}
        </p>
        <p className='text-cosmic-silver'>{systems.chaldean.meaning}</p>
      </div>
    </div>
  </div>
);

export default SystemsDisplay;
