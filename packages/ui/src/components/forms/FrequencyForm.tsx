/**
 * Frequency Form Component
 * Form for frequency and audio settings
 */

import React, { useState } from 'react';

interface FrequencyFormProps {
  onSubmit?: (frequency: number, type: string) => void;
  initialFrequency?: number;
  className?: string;
}

export const FrequencyForm: React.FC<FrequencyFormProps> = ({
  onSubmit,
  initialFrequency = 440,
  className = '',
}) => {
  const [frequency, setFrequency] = useState(initialFrequency);
  const [type, setType] = useState('solfeggio');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(frequency, type);
  };

  return (
    <form className={`frequency-form ${className}`} onSubmit={handleSubmit}>
      <div className='form-container p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Frequency Settings</h3>
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='frequency'
              className='block text-sm font-medium mb-1'
            >
              Frequency (Hz):
            </label>
            <input
              id='frequency'
              type='number'
              value={frequency}
              onChange={e => setFrequency(Number(e.target.value))}
              className='w-full p-2 border rounded'
              min='20'
              max='20000'
            />
          </div>
          <div>
            <label htmlFor='type' className='block text-sm font-medium mb-1'>
              Type:
            </label>
            <select
              id='type'
              value={type}
              onChange={e => setType(e.target.value)}
              className='w-full p-2 border rounded'
            >
              <option value='solfeggio'>Solfeggio</option>
              <option value='binaural'>Binaural</option>
              <option value='custom'>Custom</option>
            </select>
          </div>
          <button
            type='submit'
            className='w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Apply Settings
          </button>
        </div>
      </div>
    </form>
  );
};

export default FrequencyForm;
