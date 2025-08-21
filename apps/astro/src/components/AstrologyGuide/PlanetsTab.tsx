import React from 'react';
import type { Planet } from './types';

const planets: Planet[] = [
  { name: 'Sun', symbol: '☉', meaning: 'Core identity, ego, life purpose' },
  { name: 'Moon', symbol: '☽', meaning: 'Emotions, instincts, subconscious' },
  { name: 'Mercury', symbol: '☿', meaning: 'Communication, thinking, learning' },
  { name: 'Venus', symbol: '♀', meaning: 'Love, beauty, values, relationships' },
  { name: 'Mars', symbol: '♂', meaning: 'Action, drive, passion, energy' },
  { name: 'Jupiter', symbol: '♃', meaning: 'Growth, expansion, wisdom, luck' },
  { name: 'Saturn', symbol: '♄', meaning: 'Structure, discipline, lessons, karma' },
  { name: 'Uranus', symbol: '♅', meaning: 'Innovation, rebellion, sudden change' },
  { name: 'Neptune', symbol: '♆', meaning: 'Spirituality, dreams, illusion, intuition' },
  { name: 'Pluto', symbol: '♇', meaning: 'Transformation, power, rebirth, depth' }
];

const PlanetsTab: React.FC = React.memo(() => {
  return (
    <div className="flex flex-col space-y-6">
      <h3 className="text-2xl font-bold text-gold-300 mb-4">The Planets</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {planets.map((planet, index) => (
          <div key={index} className="cosmic-card rounded-xl shadow-lg">
            <div className="p-4 pt-2">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xl text-gold-400">{planet.symbol}</p>
                <h4 className="text-md font-bold text-gold-300">{planet.name}</h4>
              </div>
              <p className="text-sm text-cosmic-silver">{planet.meaning}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

PlanetsTab.displayName = 'PlanetsTab';

export default PlanetsTab;
