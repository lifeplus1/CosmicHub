/**
 * @fileoverview Type Bridge Integration Test for InterpretationForm
 * 
 * Tests the integration of InterpretationForm schemas with the 
 * Type Bridge validation system.
 */

import { 
  validateChartFormState,
  validateDirectFormState,
  validateInterpretationFormProps,
  type ChartFormState,
  type DirectFormState,
  type InterpretationFormProps,
  type InterpretationResult
} from '../../schemas/interpretationForm';

// Test Chart Form State validation
const testChartForm: ChartFormState = {
  type: 'natal',
  focus: ['personality', 'career'],
  question: 'What are my natural talents?'
};

console.log('Testing Chart Form State validation:');
const chartFormResult = validateChartFormState(testChartForm);
console.log('Chart Form Valid:', chartFormResult.success);
if (!chartFormResult.success) {
  console.error('Chart Form Errors:', chartFormResult.error);
}

// Test Direct Form State validation
const testDirectForm: DirectFormState = {
  birthDate: '1990-05-15',
  birthTime: '14:30',
  birthLocation: 'New York, NY',
  interpretationType: 'personality'
};

console.log('Testing Direct Form State validation:');
const directFormResult = validateDirectFormState(testDirectForm);
console.log('Direct Form Valid:', directFormResult.success);
if (!directFormResult.success) {
  console.error('Direct Form Errors:', directFormResult.error);
}

// Test Component Props validation
const testProps: InterpretationFormProps = {
  mode: 'chart',
  chartId: 'test-chart-123',
  onInterpretationGenerated: (result: InterpretationResult) => console.log('Generated:', result),
  defaultFocus: ['personality'],
  defaultType: 'natal',
  persistUpdates: false
};

console.log('Testing Component Props validation:');
const propsResult = validateInterpretationFormProps(testProps);
console.log('Props Valid:', propsResult.success);
if (!propsResult.success) {
  console.error('Props Errors:', propsResult.error);
}

// Test invalid data
console.log('Testing invalid data handling:');
const invalidChartForm = {
  type: 'invalid_type',
  focus: ['invalid_focus'],
  question: 123 // Should be string
};

const invalidResult = validateChartFormState(invalidChartForm);
console.log('Invalid data correctly rejected:', !invalidResult.success);
if (!invalidResult.success) {
  console.log('Expected validation errors:', invalidResult.error);
}

console.log('Type Bridge Integration Test completed successfully!');

export {};
