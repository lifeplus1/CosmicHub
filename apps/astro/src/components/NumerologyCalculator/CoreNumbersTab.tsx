import React from 'react';
import CoreNumberCard from './CoreNumberCard';
import type { CoreNumbers } from './types';

interface CoreNumbersTabProps {
  coreNumbers: CoreNumbers;
}

const CoreNumbersTab: React.FC<CoreNumbersTabProps> = ({ coreNumbers }) => (
  <div className="grid grid-cols-2 gap-4 p-4">
    <CoreNumberCard title="Life Path" number={coreNumbers.life_path.number} meaning={coreNumbers.life_path.meaning} components={coreNumbers.life_path.components} />
    <CoreNumberCard title="Destiny" number={coreNumbers.destiny.number} meaning={coreNumbers.destiny.meaning} />
    <CoreNumberCard title="Soul Urge" number={coreNumbers.soul_urge.number} meaning={coreNumbers.soul_urge.meaning} />
    <CoreNumberCard title="Personality" number={coreNumbers.personality.number} meaning={coreNumbers.personality.meaning} />
    <CoreNumberCard title="Birth Day" number={coreNumbers.birth_day.number} meaning={coreNumbers.birth_day.meaning} />
    <CoreNumberCard title="Attitude" number={coreNumbers.attitude.number} meaning={coreNumbers.attitude.meaning} />
    <CoreNumberCard title="Power Name" number={coreNumbers.power_name.number} meaning={coreNumbers.power_name.meaning} />
  </div>
);

export default CoreNumbersTab;