import React from 'react';

interface ChallengeCardProps {
  label: string;
  number: number;
  period: string;
  meaning: string;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  label,
  number,
  period,
  meaning,
}) => (
  <div className='p-4 rounded-md bg-gray-50'>
    <p className='mb-1 font-bold'>
      {label} Challenge ({period})
    </p>
    <span className='px-2 py-1 mr-2 text-sm text-white bg-blue-500 rounded'>
      {number}
    </span>
    <p className='mt-2 text-sm'>{meaning}</p>
  </div>
);

export default ChallengeCard;
