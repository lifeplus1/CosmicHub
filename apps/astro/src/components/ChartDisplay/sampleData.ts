import type { AstrologyChart } from '@cosmichub/types';

// Sample chart data extracted from ChartDisplay (used when no valid data is provided)
export const sampleChartData: AstrologyChart = {
  planets: [
    { name: 'Sun', sign: 'Gemini', degree: 28.42, position: 88.42, house: '10', retrograde: false, aspects: [] },
    { name: 'Moon', sign: 'Pisces', degree: 15.18, position: 345.18, house: '7', retrograde: false, aspects: [] },
    { name: 'Mercury', sign: 'Gemini', degree: 22.35, position: 82.35, house: '10', retrograde: false, aspects: [] },
    { name: 'Venus', sign: 'Taurus', degree: 8.56, position: 38.56, house: '9', retrograde: false, aspects: [] },
    { name: 'Mars', sign: 'Virgo', degree: 12.23, position: 162.23, house: '1', retrograde: false, aspects: [] },
    { name: 'Jupiter', sign: 'Cancer', degree: 25.47, position: 115.47, house: '11', retrograde: false, aspects: [] }
  ],
  houses: [
    { house: 1, number: 1, cusp: 155.23, sign: 'Virgo', degree: 0, ruler: 'Mercury' },
    { house: 2, number: 2, cusp: 188.45, sign: 'Libra', degree: 0, ruler: 'Venus' },
    { house: 3, number: 3, cusp: 222.18, sign: 'Scorpio', degree: 0, ruler: 'Mars' },
    { house: 4, number: 4, cusp: 268.15, sign: 'Sagittarius', degree: 0, ruler: 'Jupiter' },
    { house: 5, number: 5, cusp: 285.33, sign: 'Capricorn', degree: 0, ruler: 'Saturn' },
    { house: 6, number: 6, cusp: 322.44, sign: 'Aquarius', degree: 0, ruler: 'Uranus' },
    { house: 7, number: 7, cusp: 335.23, sign: 'Pisces', degree: 0, ruler: 'Neptune' },
    { house: 8, number: 8, cusp: 8.45, sign: 'Aries', degree: 0, ruler: 'Mars' },
    { house: 9, number: 9, cusp: 42.18, sign: 'Taurus', degree: 0, ruler: 'Venus' },
    { house: 10, number: 10, cusp: 88.15, sign: 'Gemini', degree: 0, ruler: 'Mercury' },
    { house: 11, number: 11, cusp: 105.33, sign: 'Cancer', degree: 0, ruler: 'Moon' },
    { house: 12, number: 12, cusp: 142.44, sign: 'Leo', degree: 0, ruler: 'Sun' }
  ],
  aspects: [
    { planet1: 'Sun', planet2: 'Moon', type: 'Trine', orb: 2.5, applying: 'Applying' },
    { planet1: 'Sun', planet2: 'Mars', type: 'Square', orb: 1.8, applying: 'Applying' },
    { planet1: 'Venus', planet2: 'Jupiter', type: 'Trine', orb: 3.2, applying: 'Separating' },
    { planet1: 'Moon', planet2: 'Venus', type: 'Sextile', orb: 0.9, applying: 'Exact' }
  ],
  asteroids: [
    { name: 'Chiron', sign: 'Cancer', degree: 18.45, house: '11' },
    { name: 'Lilith', sign: 'Scorpio', degree: 29.12, house: '3' },
    { name: 'Ceres', sign: 'Leo', degree: 6.38, house: '12' }
  ],
  angles: [
    { name: 'Ascendant', sign: 'Virgo', degree: 5.23, position: 155.23 },
    { name: 'Midheaven', sign: 'Gemini', degree: 28.15, position: 88.15 },
    { name: 'Descendant', sign: 'Pisces', degree: 5.23, position: 335.23 },
    { name: 'IC', sign: 'Sagittarius', degree: 28.15, position: 268.15 }
  ]
};
