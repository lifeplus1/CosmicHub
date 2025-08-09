import React from 'react';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import * as Accordion from '@radix-ui/react-accordion';
import { Aspect } from './types';

const aspects: Aspect[] = [
  { name: 'Conjunction', symbol: '☌', degree: 0, nature: 'Neutral/Intensifying', description: 'Blends energies powerfully' },
  { name: 'Sextile', symbol: '⚹', degree: 60, nature: 'Harmonious', description: 'Opportunities and flow' },
  { name: 'Square', symbol: '□', degree: 90, nature: 'Challenging', description: 'Tension and growth' },
  { name: 'Trine', symbol: '△', degree: 120, nature: 'Harmonious', description: 'Natural talents and ease' },
  { name: 'Opposition', symbol: '☍', degree: 180, nature: 'Challenging', description: 'Balance and awareness' }
];

const AspectsTab: React.FC = React.memo(() => {
  return (
    <div className="flex flex-col space-y-6">
      <h3 className="mb-4 text-2xl font-bold text-gold-300">Major Aspects</h3>
      <Accordion.Root type="multiple" className="w-full">
        {aspects.map((aspect, index) => (
          <Accordion.Item key={index} value={index.toString()}>
            <Accordion.Trigger className="flex justify-between p-4 rounded hover:bg-cosmic-purple/10">
              <div className="flex items-center space-x-2">
                <p className="text-xl text-gold-400">{aspect.symbol}</p>
                <h4 className="font-bold text-md text-gold-300">{aspect.name} ({aspect.degree}°)</h4>
              </div>
              <ChevronDownIcon className="text-gold-400" />
            </Accordion.Trigger>
            <Accordion.Content className="p-4">
              <div className="flex flex-col space-y-2">
                <span className={`bg-${aspect.nature.includes('Harmonious') ? 'green-500' : 'red-500'}/20 text-${aspect.nature.includes('Harmonious') ? 'green-500' : 'red-500'} px-2 py-1 rounded text-xs`}>
                  {aspect.nature}
                </span>
                <p className="text-cosmic-silver">{aspect.description}</p>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
});

AspectsTab.displayName = 'AspectsTab';

export default AspectsTab;