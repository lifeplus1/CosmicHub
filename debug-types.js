// Debug the type validation issues
import { isAstrologyChart, isPlanet, isAngle } from './packages/types/dist/type-guards.js';

const sampleChart = {
  planets: {
    sun: {
      name: 'Sun',
      position: 120.5,
      degree: 120.5,
      sign: 'Leo',
      house: 5,
      retrograde: false,
      speed: 1.0,
      dignity: 'domicile',
      element: 'fire',
      modality: 'fixed'
    }
  },
  houses: [],
  aspects: [],
  asteroids: {},
  angles: {
    ascendant: 0,
    midheaven: 90,
    descendant: 180,
    imumcoeli: 270
  },
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  julian_day: 2451545.0,
  house_system: 'placidus',
  chart_metadata: {
    calculation_timestamp: '2023-01-01T00:00:00Z',
    ephemeris_source: 'swiss',
    coordinate_system: 'tropical'
  }
};

console.log('Testing individual type guards:');
console.log('Planet data:', sampleChart.planets.sun);
console.log('isPlanet(sampleChart.planets.sun):', isPlanet(sampleChart.planets.sun));
console.log('Angle data:', sampleChart.angles);
console.log('isAngle(sampleChart.angles):', isAngle(sampleChart.angles));
console.log('isAstrologyChart(sampleChart):', isAstrologyChart(sampleChart));
