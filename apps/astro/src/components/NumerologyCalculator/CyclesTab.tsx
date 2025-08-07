import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import ChallengeCard from './ChallengeCard';
import PinnacleCard from './PinnacleCard';
import PersonalYearCard from './PersonalYearCard';
import type { ChallengeNumbers, PinnacleNumbers, PersonalYear } from './types';

interface CyclesTabProps {
  challengeNumbers: ChallengeNumbers;
  pinnacleNumbers: PinnacleNumbers;
  personalYear: PersonalYear;
}

const CyclesTab: React.FC<CyclesTabProps> = ({ challengeNumbers, pinnacleNumbers, personalYear }) => (
  <div className="flex flex-col p-4 space-y-6">
    <Accordion.Root type="single" collapsible>
      <Accordion.Item value="challenges">
        <Accordion.Trigger className="flex justify-between w-full">
          <span className="font-bold">Challenge Numbers</span>
          <Accordion.Icon />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <div className="grid grid-cols-2 gap-4">
            <ChallengeCard label="First" number={challengeNumbers.first_challenge.number} period={challengeNumbers.first_challenge.period} meaning={challengeNumbers.meanings.first} />
            <ChallengeCard label="Second" number={challengeNumbers.second_challenge.number} period={challengeNumbers.second_challenge.period} meaning={challengeNumbers.meanings.second} />
            <ChallengeCard label="Third" number={challengeNumbers.third_challenge.number} period={challengeNumbers.third_challenge.period} meaning={challengeNumbers.meanings.third} />
            <ChallengeCard label="Fourth" number={challengeNumbers.fourth_challenge.number} period={challengeNumbers.fourth_challenge.period} meaning={challengeNumbers.meanings.fourth} />
          </div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="pinnacles">
        <Accordion.Trigger className="flex justify-between w-full">
          <span className="font-bold">Pinnacle Numbers</span>
          <Accordion.Icon />
        </Accordion.Trigger>
        <Accordion.Content className="pb-4">
          <div className="grid grid-cols-2 gap-4">
            <PinnacleCard label="First" number={pinnacleNumbers.first_pinnacle.number} period={pinnacleNumbers.first_pinnacle.period} meaning={pinnacleNumbers.meanings.first} />
            <PinnacleCard label="Second" number={pinnacleNumbers.second_pinnacle.number} period={pinnacleNumbers.second_pinnacle.period} meaning={pinnacleNumbers.meanings.second} />
            <PinnacleCard label="Third" number={pinnacleNumbers.third_pinnacle.number} period={pinnacleNumbers.third_pinnacle.period} meaning={pinnacleNumbers.meanings.third} />
            <PinnacleCard label="Fourth" number={pinnacleNumbers.fourth_pinnacle.number} period={pinnacleNumbers.fourth_pinnacle.period} meaning={pinnacleNumbers.meanings.fourth} />
          </div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
    <PersonalYearCard personalYear={personalYear} />
  </div>
);

export default CyclesTab;