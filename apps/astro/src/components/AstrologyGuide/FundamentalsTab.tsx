import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { FaSun, FaStar, FaGlobe, FaMoon, FaClock, FaLightbulb } from 'react-icons/fa';
import { Fundamental } from './types';

const fundamentals: Fundamental[] = [
  {
    title: 'The Birth Chart',
    icon: FaSun,
    description: 'A snapshot of the sky at your exact moment of birth',
    details: [
      'Based on your birth date, time, and location',
      'Shows positions of planets, signs, and houses',
      'Forms the foundation of all astrological analysis',
      'Unique to you - like a cosmic fingerprint'
    ]
  },
  {
    title: 'The 12 Zodiac Signs',
    icon: FaStar,
    description: 'Energy patterns that color planetary influences',
    details: [
      'Aries through Pisces - each with unique characteristics',
      'Four elements: Fire, Earth, Air, Water',
      'Three modalities: Cardinal, Fixed, Mutable',
      'Signs show HOW planetary energies express'
    ]
  },
  {
    title: 'The Planets',
    icon: FaGlobe,
    description: 'Cosmic actors representing different life themes',
    details: [
      'Sun: Core identity and life purpose',
      'Moon: Emotions and instinctive responses',
      'Mercury: Communication and thinking',
      'Venus: Love, beauty, and values',
      'Mars: Action, drive, and passion',
      'Jupiter: Growth, wisdom, and expansion',
      'Saturn: Structure, discipline, and lessons',
      'Uranus, Neptune, Pluto: Generational influences'
    ]
  },
  {
    title: 'The 12 Houses',
    icon: FaMoon,
    description: 'Life areas where planetary energies play out',
    details: [
      '1st House: Self and appearance',
      '2nd House: Values and possessions',
      '3rd House: Communication and learning',
      '4th House: Home and family',
      '5th House: Creativity and romance',
      '6th House: Work and health',
      '7th House: Partnerships',
      '8th House: Transformation and shared resources',
      '9th House: Philosophy and travel',
      '10th House: Career and public life',
      '11th House: Friendships and hopes',
      '12th House: Subconscious and spirituality'
    ]
  },
  {
    title: 'Aspects',
    icon: FaClock,
    description: 'Angular relationships between planets',
    details: [
      'Conjunction: Blending energies (0°)',
      'Sextile: Harmony and opportunity (60°)',
      'Square: Tension and growth (90°)',
      'Trine: Flow and talent (120°)',
      'Opposition: Balance and awareness (180°)',
      'Aspects show how planetary energies interact'
    ]
  }
];

const FundamentalsTab: React.FC = React.memo(() => {
  return (
    <div className="flex flex-col space-y-6">
      <h3 className="mb-4 text-2xl font-bold text-gold-300">Astrology Fundamentals</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {fundamentals.map((item, index) => (
          <div key={index} className="overflow-hidden shadow-lg cosmic-card rounded-xl">
            <div className="py-4 bg-gradient-to-r from-gold-400/10 to-gold-400/0">
              <div className="flex items-center px-4 space-x-3">
                <item.icon className="text-2xl text-gold-400" />
                <h4 className="font-bold text-md text-gold-300">{item.title}</h4>
              </div>
            </div>
            <div className="p-4 pt-2">
              <p className="mb-4 text-cosmic-silver">{item.description}</p>
              <Accordion.Root type="single" collapsible>
                <Accordion.Item value={index.toString()}>
                  <Accordion.Trigger className="flex justify-between w-full p-2 rounded hover:bg-cosmic-purple/10">
                    <span className="text-sm font-medium text-gold-400">Learn More</span>
                    <ChevronDownIcon className="text-gold-400" />
                  </Accordion.Trigger>
                  <Accordion.Content className="p-4 pt-0">
                    <ul className="space-y-3">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-cosmic-silver">
                          <FaLightbulb className="text-xs text-gold-400" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

FundamentalsTab.displayName = 'FundamentalsTab';

export default FundamentalsTab;