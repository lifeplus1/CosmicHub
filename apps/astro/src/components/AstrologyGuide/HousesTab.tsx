import React from 'react';
import type { House } from './types';

const houses: House[] = [
  { number: 1, area: 'Self, appearance, first impressions' },
  { number: 2, area: 'Values, possessions, self-worth' },
  { number: 3, area: 'Communication, learning, siblings' },
  { number: 4, area: 'Home, family, roots' },
  { number: 5, area: 'Creativity, romance, children' },
  { number: 6, area: 'Work, health, daily routines' },
  { number: 7, area: 'Partnerships, marriage, others' },
  { number: 8, area: 'Transformation, shared resources, intimacy' },
  { number: 9, area: 'Philosophy, travel, higher learning' },
  { number: 10, area: 'Career, public life, achievement' },
  { number: 11, area: 'Friendships, groups, hopes' },
  { number: 12, area: 'Subconscious, spirituality, hidden things' },
];

const HousesTab: React.FC = React.memo(() => {
  return (
    <div className='flex flex-col space-y-6'>
      <h3 className='mb-4 text-2xl font-bold text-gold-300'>The 12 Houses</h3>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        {houses.map((house, index) => (
          <div key={index} className='shadow-lg cosmic-card rounded-xl'>
            <div className='p-4 pt-2'>
              <h4 className='mb-2 font-bold text-md text-gold-300'>
                House {house.number}
              </h4>
              <p className='text-sm text-cosmic-silver'>{house.area}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

HousesTab.displayName = 'HousesTab';

export default HousesTab;
