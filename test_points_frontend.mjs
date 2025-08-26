// Test script to verify frontend points processing
import fetch from 'node-fetch';

async function testFrontendPointsProcessing() {
  try {
    console.log('🧪 Testing frontend points processing...');
    
    // Fetch data from backend
    const response = await fetch('http://localhost:8000/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        year: 2000,
        month: 1,
        day: 1,
        hour: 12,
        minute: 0,
        city: "New York"
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Backend response received:');
    console.log(`  Planets: ${Object.keys(data.planets || {}).length}`);
    console.log(`  Asteroids: ${Object.keys(data.asteroids || {}).length}`);
    console.log(`  Points: ${Object.keys(data.points || {}).length}`);
    console.log(`  Houses: ${(data.houses || []).length}`);
    console.log(`  Angles: ${Object.keys(data.angles || {}).length}`);
    
    // Test points processing
    const points = data.points || {};
    console.log('\n📍 Points details:');
    for (const [name, pointData] of Object.entries(points)) {
      console.log(`  ${name}:`, pointData);
    }
    
    // Test asteroids processing 
    const asteroids = data.asteroids || {};
    console.log('\n🌟 Asteroids details:');
    for (const [name, asteroidData] of Object.entries(asteroids)) {
      console.log(`  ${name}:`, asteroidData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendPointsProcessing();
