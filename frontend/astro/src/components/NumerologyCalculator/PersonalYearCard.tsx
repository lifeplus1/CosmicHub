import React from 'react';
import type { PersonalYear } from './types';

interface PersonalYearCardProps {
  personalYear: PersonalYear;
}

const PersonalYearCard: React.FC<PersonalYearCardProps> = ({ personalYear }) => (
  <div className="cosmic-card">
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-md">Personal Year {personalYear.year}</h3>
        <span className="px-4 py-2 text-xl text-white bg-orange-500 rounded-full">{personalYear.number}</span>
      </div>
      <p className="mt-4 text-cosmic-silver">{personalYear.meaning}</p>
    </div>
  </div>
);

export default PersonalYearCard;