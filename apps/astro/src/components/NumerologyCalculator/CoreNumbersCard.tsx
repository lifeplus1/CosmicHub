import React from 'react';

interface CoreNumberCardProps {
  title: string;
  number: number;
  meaning: string;
  components?: { month: number; day: number; year: number };
}

const CoreNumberCard: React.FC<CoreNumberCardProps> = ({
  title,
  number,
  meaning,
  components,
}) => (
  <div className='cosmic-card'>
    <div className='p-4'>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='font-bold text-md'>{title}</h3>
        <span className='px-3 py-1 text-lg text-white rounded-full bg-cosmic-purple'>
          {number}
        </span>
      </div>
      <p className='text-cosmic-silver'>{meaning}</p>
      {components && (
        <p className='mt-2 text-sm text-cosmic-silver/80'>
          Calculation: {components.month} + {components.day} + {components.year}{' '}
          = {number}
        </p>
      )}
    </div>
  </div>
);

export default CoreNumberCard;
