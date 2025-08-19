import React from 'react';
import { Sign } from './types';

const signs: Sign[] = [
  { name: 'Aries', element: 'Fire', modality: 'Cardinal', traits: 'Energetic, pioneering, assertive' },
  { name: 'Taurus', element: 'Earth', modality: 'Fixed', traits: 'Stable, sensual, persistent' },
  { name: 'Gemini', element: 'Air', modality: 'Mutable', traits: 'Curious, adaptable, communicative' },
  { name: 'Cancer', element: 'Water', modality: 'Cardinal', traits: 'Nurturing, intuitive, protective' },
  { name: 'Leo', element: 'Fire', modality: 'Fixed', traits: 'Creative, confident, generous' },
  { name: 'Virgo', element: 'Earth', modality: 'Mutable', traits: 'Analytical, practical, detail-oriented' },
  { name: 'Libra', element: 'Air', modality: 'Cardinal', traits: 'Harmonious, diplomatic, social' },
  { name: 'Scorpio', element: 'Water', modality: 'Fixed', traits: 'Intense, transformative, passionate' },
  { name: 'Sagittarius', element: 'Fire', modality: 'Mutable', traits: 'Adventurous, philosophical, optimistic' },
  { name: 'Capricorn', element: 'Earth', modality: 'Cardinal', traits: 'Ambitious, disciplined, practical' },
  { name: 'Aquarius', element: 'Air', modality: 'Fixed', traits: 'Innovative, humanitarian, independent' },
  { name: 'Pisces', element: 'Water', modality: 'Mutable', traits: 'Compassionate, imaginative, spiritual' }
];

const getElementColor = (element: string): string => {
  switch (element.toLowerCase()) {
    case 'fire': return 'red-500';
    case 'earth': return 'green-500';
    case 'air': return 'blue-500';
    case 'water': return 'cyan-500';
    default: return 'gray-500';
  }
};

const SignsTab: React.FC = React.memo(() => {
  return (
    <div className="flex flex-col space-y-6">
      <h3 className="mb-4 text-2xl font-bold text-gold-300">The 12 Zodiac Signs</h3>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {signs.map((sign, index) => (
          <div key={index} className="shadow-lg cosmic-card rounded-xl">
            <div className="p-4 pt-2">
              <h4 className="mb-3 font-bold text-md text-gold-300">{sign.name}</h4>
              <div className="flex mb-3 space-x-2">
                <span className={`bg-${getElementColor(sign.element)}/20 text-${getElementColor(sign.element)} px-2 py-1 rounded text-xs`}>
                  {sign.element}
                </span>
                <span className="px-2 py-1 text-xs border rounded bg-gold-100/20 text-gold-300 border-gold-300/30">
                  {sign.modality}
                </span>
              </div>
              <p className="text-sm text-cosmic-silver">{sign.traits}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SignsTab.displayName = 'SignsTab';

export default SignsTab