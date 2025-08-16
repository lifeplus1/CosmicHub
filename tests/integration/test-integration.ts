#!/usr/bin/env node

/**
 * Integration Test Script - TypeScript
 * Tests frontend-backend communication
 */

interface TestData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface ChartData {
  planets?: Record<string, unknown>;
  houses?: Record<string, unknown>;
  aspects?: Array<unknown>;
}

interface HealthResponse {
  status: string;
}

interface TestResults {
  backendHealth: boolean;
  frontendHealth: boolean;
  backendDirect: boolean;
}

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:5174';

const testData: TestData = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  city: "New York",
  lat: 40.7128,
  lon: -74.0060,
  timezone: "America/New_York"
};

async function testBackendDirect(): Promise<boolean> {
  console.log('🧪 Testing Backend Direct API...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    if (!response.ok) {
      throw new Error(`Backend HTTP error: ${response.status}`);
    }
    
    const data: ChartData = await response.json();
    console.log('✅ Backend Direct: SUCCESS');
    console.log(`📊 Planets found: ${Object.keys(data.planets || {}).length}`);
    console.log(`🏠 Houses found: ${Object.keys(data.houses || {}).length}`);
    console.log(`🔗 Aspects found: ${(data.aspects || []).length}`);
    return true;
  } catch (error: any) {
    console.error('❌ Backend Direct: FAILED', error.message);
    return false;
  }
}

async function testFrontendHealth(): Promise<boolean> {
  console.log('🧪 Testing Frontend Health...');
  
  try {
    const response = await fetch(FRONTEND_URL);
    
    if (!response.ok) {
      throw new Error(`Frontend HTTP error: ${response.status}`);
    }
    
    console.log('✅ Frontend Health: SUCCESS');
    return true;
  } catch (error: any) {
    console.error('❌ Frontend Health: FAILED', error.message);
    return false;
  }
}

async function testBackendHealth(): Promise<boolean> {
  console.log('🧪 Testing Backend Health...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`Backend health HTTP error: ${response.status}`);
    }
    
    const data: HealthResponse = await response.json();
    console.log('✅ Backend Health: SUCCESS');
    console.log(`📊 Status: ${data.status}`);
    return true;
  } catch (error: any) {
    console.error('❌ Backend Health: FAILED', error.message);
    return false;
  }
}

async function runIntegrationTests(): Promise<boolean> {
  console.log('🚀 Running Integration Tests...\n');
  
  const results: TestResults = {
    backendHealth: await testBackendHealth(),
    frontendHealth: await testFrontendHealth(),
    backendDirect: await testBackendDirect()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 Integration is working! Frontend and Backend are communicating properly.');
    console.log('💡 Next steps: Proceed with feature development or additional testing.');
  } else {
    console.log('\n🔧 Issues detected. Please check the failed components.');
  }
  
  return allPassed;
}

export { runIntegrationTests, testBackendDirect, testFrontendHealth, testBackendHealth };

// For direct execution, uncomment the line below:
// runIntegrationTests().catch(console.error);
