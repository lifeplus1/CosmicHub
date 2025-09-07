/**
 * Birth Data Form Component
 * Form for collecting birth information
 */

import React, { useState } from 'react';

interface BirthData {
  date: string;
  time: string;
  location: string;
}

interface BirthDataFormProps {
  onSubmit?: (data: BirthData) => void;
  initialData?: Partial<BirthData>;
  className?: string;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({
  onSubmit,
  initialData,
  className = '',
}) => {
  const [data, setData] = useState<BirthData>({
    date: initialData?.date ?? '',
    time: initialData?.time ?? '',
    location: initialData?.location ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(data);
  };

  return (
    <form className={`birth-data-form ${className}`} onSubmit={handleSubmit}>
      <div className='form-container p-4 border rounded-lg'>
        <h3 className='text-lg font-semibold mb-4'>Birth Information</h3>
        <div className='space-y-4'>
          <div>
            <label htmlFor='date' className='block text-sm font-medium mb-1'>
              Birth Date:
            </label>
            <input
              id='date'
              type='date'
              value={data.date}
              onChange={e =>
                setData(prev => ({ ...prev, date: e.target.value }))
              }
              className='w-full p-2 border rounded'
            />
          </div>
          <div>
            <label htmlFor='time' className='block text-sm font-medium mb-1'>
              Birth Time:
            </label>
            <input
              id='time'
              type='time'
              value={data.time}
              onChange={e =>
                setData(prev => ({ ...prev, time: e.target.value }))
              }
              className='w-full p-2 border rounded'
            />
          </div>
          <div>
            <label
              htmlFor='location'
              className='block text-sm font-medium mb-1'
            >
              Birth Location:
            </label>
            <input
              id='location'
              type='text'
              value={data.location}
              onChange={e =>
                setData(prev => ({ ...prev, location: e.target.value }))
              }
              className='w-full p-2 border rounded'
              placeholder='City, Country'
            />
          </div>
          <button
            type='submit'
            className='w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700'
           aria-label="Interactive button">
            Submit
          </button>
        </div>
      </div>
    </form>
  );
};


// Memoize for performance
const MemoizedBirthDataForm = React.memo(BirthDataForm);
MemoizedBirthDataForm.displayName = 'BirthDataForm';
export default MemoizedBirthDataForm;