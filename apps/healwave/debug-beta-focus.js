// Debug script to test Beta High Focus validation
import { safeValidateFrequencyData } from './src/schemas/frequencySchemas.js';

const testFrequency = {
  frequency: 25,
  amplitude: 0.7,
  phase: 0,
  label: 'Beta High Focus',
  color: '#84cc16',
  category: 'brainwave',
  timestamp: Date.now(),
  benefits: ['High performance', 'Problem solving', 'Peak alertness']
};

console.log('Testing Beta High Focus frequency:', testFrequency);
const result = safeValidateFrequencyData(testFrequency);
console.log('Validation result:', result);
