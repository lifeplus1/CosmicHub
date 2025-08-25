import React from 'react';

interface KarmicDisplayProps {
  type: 'debt' | 'lesson';
  numbers: number[];
  meanings: string[];
}

const KarmicDisplay: React.FC<KarmicDisplayProps> = ({
  type,
  numbers,
  meanings,
}) => (
  <div
    className={`p-4 border border-${type === 'debt' ? 'yellow' : 'blue'}-500 rounded-md bg-${type === 'debt' ? 'yellow' : 'blue'}-900/50`}
  >
    <div className='flex mb-2 space-x-4'>
      <span
        className={`text-xl text-${type === 'debt' ? 'yellow' : 'blue'}-500`}
      >
        {type === 'debt' ? '⚠️' : 'ℹ️'}
      </span>
      <div>
        <h4 className='font-bold text-white'>
          {type === 'debt' ? 'Karmic Debts' : 'Karmic Lessons'}
        </h4>
        <p className='text-white/80'>Numbers: {numbers.join(', ')}</p>
      </div>
    </div>
    <div className='flex flex-col space-y-1'>
      {meanings.map((meaning, index) => (
        <p key={index} className='text-sm text-white/80'>
          • {meaning}
        </p>
      ))}
    </div>
  </div>
);

export default KarmicDisplay;
