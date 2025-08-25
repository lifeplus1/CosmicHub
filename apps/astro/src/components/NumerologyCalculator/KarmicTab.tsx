import React from 'react';
import KarmicDisplay from './KarmicDisplay';
import type { KarmicNumbers } from './types';

interface KarmicTabProps {
  karmicNumbers: KarmicNumbers;
}

const KarmicTab: React.FC<KarmicTabProps> = ({ karmicNumbers }) => (
  <div className='flex flex-col p-4 space-y-6'>
    {karmicNumbers.karmic_debts.length > 0 && (
      <KarmicDisplay
        type='debt'
        numbers={karmicNumbers.karmic_debts}
        meanings={karmicNumbers.debt_meanings}
      />
    )}
    {karmicNumbers.karmic_lessons.length > 0 && (
      <KarmicDisplay
        type='lesson'
        numbers={karmicNumbers.karmic_lessons}
        meanings={karmicNumbers.lesson_meanings}
      />
    )}
    {karmicNumbers.karmic_debts.length === 0 &&
      karmicNumbers.karmic_lessons.length === 0 && (
        <div className='p-4 border border-green-500 rounded-md bg-green-900/50'>
          <div className='flex space-x-4'>
            <span className='text-xl text-green-500'>✅</span>
            <div>
              <h4 className='font-bold text-white'>Clear Karmic Path</h4>
              <p className='text-white/80'>
                You have no significant karmic debts or lessons indicated in
                your numerology chart.
              </p>
            </div>
          </div>
        </div>
      )}
  </div>
);

export default KarmicTab;
