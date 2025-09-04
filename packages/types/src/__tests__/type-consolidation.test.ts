// Test file to verify type consolidation
import type { 
  PlanetData, 
  ChartData, 
  ChartType,
  Planet, 
  House, 
  Aspect 
} from '../index';

// Test that the consolidated types work correctly
const testPlanetData: PlanetData = {
  name: 'sun',
  sign: 'aries',
  house: 1, // number
  degree: 15.5,
  aspects: [{ type: 'trine', target: 'moon', orb: 3.2 }]
};

const testPlanet: Planet = {
  name: 'moon',
  sign: 'cancer', 
  degree: 10.3,
  position: 100.3,
  house: '4', // string
  retrograde: false
};

const testChartData: ChartData = {
  planets: [testPlanetData],
  asteroids: [],
  angles: [],
  houses: [],
  aspects: []
};

const testChartType: ChartType = 'natal';

const testHouse: House = {
  house: 1,
  number: 1,
  sign: 'aries',
  degree: 0,
  cusp: 0,
  ruler: 'mars'
};

const testAspect: Aspect = {
  planet1: 'sun',
  planet2: 'moon', 
  type: 'trine',
  orb: 3.2,
  applying: 'separating'
};

console.log('Type consolidation test passed!');
console.log('PlanetData:', testPlanetData);
console.log('Planet:', testPlanet);
console.log('ChartData:', testChartData);
console.log('ChartType:', testChartType);
console.log('House:', testHouse);
console.log('Aspect:', testAspect);
