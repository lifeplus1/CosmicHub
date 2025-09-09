// Quick debug script to test individual validations
import { isPlanet, isAngle } from './packages/types/src/type-guards.ts';

const samplePlanet = {
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
};

const sampleAngles = {
  ascendant: 0,
  midheaven: 90,
  descendant: 180,
  imumcoeli: 270
};

console.log('Planet data:', JSON.stringify(samplePlanet, null, 2));
console.log('isPlanet result:', isPlanet(samplePlanet));

console.log('\nAngles data:', JSON.stringify(sampleAngles, null, 2));
console.log('isAngle result:', isAngle(sampleAngles));

// Let's test each field individually for planets
console.log('\nPlanet field checks:');
console.log('name:', typeof samplePlanet.name, '==', 'string', ':', typeof samplePlanet.name === 'string');
console.log('sign:', typeof samplePlanet.sign, '==', 'string', ':', typeof samplePlanet.sign === 'string');
console.log('degree:', typeof samplePlanet.degree, '==', 'number', ':', typeof samplePlanet.degree === 'number');
console.log('position:', typeof samplePlanet.position, '==', 'number', ':', typeof samplePlanet.position === 'number');
console.log('house:', typeof samplePlanet.house, '==', 'number', ':', typeof samplePlanet.house === 'number');
console.log('retrograde:', typeof samplePlanet.retrograde, '==', 'boolean', ':', typeof samplePlanet.retrograde === 'boolean');
console.log('speed:', typeof samplePlanet.speed, '==', 'number', ':', typeof samplePlanet.speed === 'number');

// Let's test each field individually for angles
console.log('\nAngles field checks:');
console.log('ascendant:', typeof sampleAngles.ascendant, '==', 'number', ':', typeof sampleAngles.ascendant === 'number');
console.log('midheaven:', typeof sampleAngles.midheaven, '==', 'number', ':', typeof sampleAngles.midheaven === 'number');
console.log('descendant:', typeof sampleAngles.descendant, '==', 'number', ':', typeof sampleAngles.descendant === 'number');
console.log('imumcoeli:', typeof sampleAngles.imumcoeli, '==', 'number', ':', typeof sampleAngles.imumcoeli === 'number');
