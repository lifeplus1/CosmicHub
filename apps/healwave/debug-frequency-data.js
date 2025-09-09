// Simple test to debug frequency data loading
// This will run in Node.js environment to test the data structure

// Mock browser-specific globals for Node.js testing
global.window = {};
global.document = { addEventListener: () => {} };
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

// Try to load and test the frequency data
async function testFrequencyData() {
  try {
    console.log('🔍 Loading unifiedFrequencyData...');
    
    // Import the frequency data module
    const { getUnifiedFrequencyPresets, getAllHealingFrequencies, HEALING_FREQUENCIES } = 
      await import('./src/data/unifiedFrequencyData.ts');
    
    console.log('✅ Successfully imported unifiedFrequencyData');
    
    // Test HEALING_FREQUENCIES structure
    console.log('📊 HEALING_FREQUENCIES structure:');
    console.log('  - Keys:', Object.keys(HEALING_FREQUENCIES));
    console.log('  - Solfeggio count:', HEALING_FREQUENCIES.solfeggio?.length || 0);
    console.log('  - Rife count:', HEALING_FREQUENCIES.rife?.length || 0);
    console.log('  - Planetary count:', HEALING_FREQUENCIES.planetary?.length || 0);
    console.log('  - Stellar count:', HEALING_FREQUENCIES.stellar?.length || 0);
    
    // Test getAllHealingFrequencies
    console.log('\n🧪 Testing getAllHealingFrequencies...');
    const allHealing = getAllHealingFrequencies();
    console.log('  - Total healing frequencies:', allHealing?.length || 0);
    if (allHealing && allHealing.length > 0) {
      console.log('  - First 3:', allHealing.slice(0, 3).map(f => ({ freq: f.frequency, name: f.name, cat: f.category })));
    }
    
    // Test getUnifiedFrequencyPresets
    console.log('\n🎯 Testing getUnifiedFrequencyPresets...');
    const presets = getUnifiedFrequencyPresets();
    console.log('  - Total unified presets:', presets?.length || 0);
    if (presets && presets.length > 0) {
      console.log('  - First 3:', presets.slice(0, 3).map(f => ({ freq: f.frequency, name: f.name, cat: f.category })));
      
      // Group by category
      const categories = {};
      presets.forEach(p => {
        if (!categories[p.category]) categories[p.category] = 0;
        categories[p.category]++;
      });
      console.log('  - Categories:', categories);
    }
    
    console.log('\n✅ All tests completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing frequency data:', error.message);
    console.error('   Stack:', error.stack);
  }
}

testFrequencyData();
