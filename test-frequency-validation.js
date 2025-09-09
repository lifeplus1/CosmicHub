#!/usr/bin/env node

console.log('🔍 Testing frequency validation system...\n');

// Simulate the frequency data loading and validation process
try {
  // Test data similar to what we might find in the system
  const testFrequencies = [
    {
      frequency: 40, // This was the problem - should be gamma awareness
      label: 'Gamma Awareness',
      category: 'brainwave',
      benefits: ['Enhanced focus', 'Cognitive enhancement'],
      metadata: { isBinaural: true, binauralBeat: 40, baseFrequency: 300 }
    },
    {
      frequency: 20, // Beta high focus 
      label: 'Beta High Focus',
      category: 'brainwave', 
      benefits: ['Intense concentration', 'Problem solving'],
      metadata: { isBinaural: true, binauralBeat: 20, baseFrequency: 250 }
    },
    {
      frequency: 'invalid', // Invalid frequency to test validation
      label: 'Invalid Frequency',
      category: 'test'
    },
    {
      // Missing required fields
      label: 'Missing Fields Test'
    }
  ];

  console.log('📋 Test frequencies to validate:');
  testFrequencies.forEach((freq, i) => {
    console.log(`${i + 1}. ${freq.label || 'Unknown'}: ${freq.frequency}Hz (${freq.category || 'no category'})`);
  });

  console.log('\n✅ Expected results:');
  console.log('• Gamma Awareness (40Hz binaural) - should PASS validation');
  console.log('• Beta High Focus (20Hz binaural) - should PASS validation'); 
  console.log('• Invalid Frequency - should FAIL validation (invalid frequency type)');
  console.log('• Missing Fields Test - should FAIL validation (missing required fields)');

  console.log('\n🎯 This simulates the actual validation that should be running in the app.');
  console.log('💡 Check the browser console for real validation logs when using the frequency generator.');

} catch (error) {
  console.error('❌ Test failed:', error);
}
