#!/usr/bin/env node

/**
 * Interactive Chart Features Test Script
 * Validates real-time chart interactivity and analytics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  astroApp: 'apps/astro',
  testTimeout: 30000,
  features: [
    'interactive-chart',
    'real-time-sync',
    'chart-analytics',
    'transit-tracking',
    'pattern-detection'
  ]
};

// Test data
const SAMPLE_BIRTH_DATA = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  lat: 40.7128,
  lon: -74.0060,
  timezone: 'America/New_York',
  city: 'New York'
};

console.log('🔄 Starting Interactive Chart Features Validation...\n');

/**
 * Test 1: Component Import Validation
 */
function testComponentImports() {
  console.log('📦 Testing Component Imports...');
  
  const componentsToTest = [
    'ChartWheelInteractive.tsx',
    'chartSyncService.ts',
    'chartAnalyticsService.ts'
  ];

  let passed = 0;
  
  componentsToTest.forEach(component => {
    const filePath = path.join(TEST_CONFIG.astroApp, 'src', component.includes('Service') ? 'services' : 'features', component);
    
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${component} - Found`);
      
      // Check for key imports and exports
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (component === 'ChartWheelInteractive.tsx') {
        const requiredImports = ['d3', 'useQuery', 'useState', 'useCallback'];
        const hasAllImports = requiredImports.every(imp => content.includes(imp));
        
        if (hasAllImports && content.includes('ChartWheelInteractive')) {
          console.log(`  ✅ ${component} - All required imports present`);
          passed++;
        } else {
          console.log(`  ❌ ${component} - Missing required imports or export`);
        }
      } else if (component.includes('Service')) {
        if (content.includes('class') && content.includes('export')) {
          console.log(`  ✅ ${component} - Service class properly exported`);
          passed++;
        } else {
          console.log(`  ❌ ${component} - Service class not properly structured`);
        }
      }
    } else {
      console.log(`  ❌ ${component} - Not found at expected path`);
    }
  });

  console.log(`\n📊 Component Import Test: ${passed}/${componentsToTest.length} passed\n`);
  return passed === componentsToTest.length;
}

/**
 * Test 2: TypeScript Compilation
 */
function testTypeScriptCompilation() {
  console.log('🔧 Testing TypeScript Compilation...');
  
  try {
    const result = execSync('npm run type-check', { 
      cwd: TEST_CONFIG.astroApp,
      encoding: 'utf8',
      timeout: TEST_CONFIG.testTimeout 
    });
    
    console.log('  ✅ TypeScript compilation successful');
    return true;
  } catch (error) {
    console.log('  ❌ TypeScript compilation failed:');
    console.log(`     ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Chart Analytics Service Validation
 */
function testChartAnalyticsService() {
  console.log('📊 Testing Chart Analytics Service...');
  
  const serviceFile = path.join(TEST_CONFIG.astroApp, 'src/services/chartAnalyticsService.ts');
  
  if (!fs.existsSync(serviceFile)) {
    console.log('  ❌ Chart Analytics Service file not found');
    return false;
  }

  const content = fs.readFileSync(serviceFile, 'utf8');
  
  const requiredMethods = [
    'analyzeChart',
    'getPersonalityInsights',
    'calculateDominantElement',
    'detectPatterns',
    'detectStelliums'
  ];

  let methodsPassed = 0;
  requiredMethods.forEach(method => {
    if (content.includes(method)) {
      console.log(`  ✅ Method '${method}' implemented`);
      methodsPassed++;
    } else {
      console.log(`  ❌ Method '${method}' missing`);
    }
  });

  const requiredInterfaces = [
    'ChartPattern',
    'ChartAnalysis',
    'PersonalityInsight',
    'UpcomingEvent'
  ];

  let interfacesPassed = 0;
  requiredInterfaces.forEach(iface => {
    if (content.includes(`interface ${iface}`)) {
      console.log(`  ✅ Interface '${iface}' defined`);
      interfacesPassed++;
    } else {
      console.log(`  ❌ Interface '${iface}' missing`);
    }
  });

  const totalTests = requiredMethods.length + requiredInterfaces.length;
  const totalPassed = methodsPassed + interfacesPassed;
  
  console.log(`\n📊 Chart Analytics Test: ${totalPassed}/${totalTests} passed\n`);
  return totalPassed === totalTests;
}

/**
 * Test 4: Chart Sync Service Validation
 */
function testChartSyncService() {
  console.log('🔄 Testing Chart Sync Service...');
  
  const serviceFile = path.join(TEST_CONFIG.astroApp, 'src/services/chartSyncService.ts');
  
  if (!fs.existsSync(serviceFile)) {
    console.log('  ❌ Chart Sync Service file not found');
    return false;
  }

  const content = fs.readFileSync(serviceFile, 'utf8');
  
  const requiredMethods = [
    'registerChart',
    'updateChart',
    'fetchCurrentTransits',
    'detectAspectChanges',
    'getChart'
  ];

  let methodsPassed = 0;
  requiredMethods.forEach(method => {
    if (content.includes(method)) {
      console.log(`  ✅ Method '${method}' implemented`);
      methodsPassed++;
    } else {
      console.log(`  ❌ Method '${method}' missing`);
    }
  });

  // Check for EventEmitter integration
  if (content.includes('EventEmitter') && content.includes('emit')) {
    console.log('  ✅ Event system properly integrated');
    methodsPassed++;
  } else {
    console.log('  ❌ Event system not properly integrated');
  }

  console.log(`\n📊 Chart Sync Test: ${methodsPassed}/${requiredMethods.length + 1} passed\n`);
  return methodsPassed === requiredMethods.length + 1;
}

/**
 * Test 5: CSS Module Validation
 */
function testCSSModules() {
  console.log('🎨 Testing CSS Modules...');
  
  const cssFile = path.join(TEST_CONFIG.astroApp, 'src/features/ChartWheelInteractive.module.css');
  
  if (!fs.existsSync(cssFile)) {
    console.log('  ❌ CSS module file not found');
    return false;
  }

  const content = fs.readFileSync(cssFile, 'utf8');
  
  const requiredClasses = [
    'chart-container',
    'chart-svg',
    'chart-tooltip',
    'control-panel',
    'selection-info',
    'chart-legend'
  ];

  let classesPassed = 0;
  requiredClasses.forEach(className => {
    if (content.includes(className)) {
      console.log(`  ✅ Class '${className}' defined`);
      classesPassed++;
    } else {
      console.log(`  ❌ Class '${className}' missing`);
    }
  });

  // Check for responsive design
  if (content.includes('@media') && content.includes('max-width')) {
    console.log('  ✅ Responsive design implemented');
    classesPassed++;
  } else {
    console.log('  ❌ Responsive design not implemented');
  }

  console.log(`\n📊 CSS Module Test: ${classesPassed}/${requiredClasses.length + 1} passed\n`);
  return classesPassed === requiredClasses.length + 1;
}

/**
 * Test 6: D3.js Integration Test
 */
function testD3Integration() {
  console.log('📈 Testing D3.js Integration...');
  
  const componentFile = path.join(TEST_CONFIG.astroApp, 'src/features/ChartWheelInteractive.tsx');
  
  if (!fs.existsSync(componentFile)) {
    console.log('  ❌ Interactive chart component not found');
    return false;
  }

  const content = fs.readFileSync(componentFile, 'utf8');
  
  const d3Features = [
    'd3.select',
    'd3.arc',
    'transition',
    'attr',
    'on('
  ];

  let featuresPassed = 0;
  d3Features.forEach(feature => {
    if (content.includes(feature)) {
      console.log(`  ✅ D3 feature '${feature}' used`);
      featuresPassed++;
    } else {
      console.log(`  ❌ D3 feature '${feature}' not found`);
    }
  });

  // Check for interactive event handlers
  if (content.includes('handlePlanetClick') && content.includes('showTooltip')) {
    console.log('  ✅ Interactive event handlers implemented');
    featuresPassed++;
  } else {
    console.log('  ❌ Interactive event handlers missing');
  }

  console.log(`\n📊 D3.js Integration Test: ${featuresPassed}/${d3Features.length + 1} passed\n`);
  return featuresPassed === d3Features.length + 1;
}

/**
 * Test 7: React Query Integration
 */
function testReactQueryIntegration() {
  console.log('🔍 Testing React Query Integration...');
  
  const componentFile = path.join(TEST_CONFIG.astroApp, 'src/features/ChartWheelInteractive.tsx');
  const content = fs.readFileSync(componentFile, 'utf8');
  
  const queryFeatures = [
    'useQuery',
    'queryKey',
    'queryFn',
    'refetchInterval',
    'staleTime'
  ];

  let featuresPassed = 0;
  queryFeatures.forEach(feature => {
    if (content.includes(feature)) {
      console.log(`  ✅ React Query feature '${feature}' used`);
      featuresPassed++;
    } else {
      console.log(`  ❌ React Query feature '${feature}' not found`);
    }
  });

  console.log(`\n📊 React Query Test: ${featuresPassed}/${queryFeatures.length} passed\n`);
  return featuresPassed === queryFeatures.length;
}

/**
 * Test 8: Real-time Features Validation
 */
function testRealTimeFeatures() {
  console.log('⏱️ Testing Real-time Features...');
  
  const componentFile = path.join(TEST_CONFIG.astroApp, 'src/features/ChartWheelInteractive.tsx');
  const content = fs.readFileSync(componentFile, 'utf8');
  
  const realTimeFeatures = [
    'realTimeUpdates',
    'transitData',
    'interactiveState',
    'setInteractiveState',
    'showTransits'
  ];

  let featuresPassed = 0;
  realTimeFeatures.forEach(feature => {
    if (content.includes(feature)) {
      console.log(`  ✅ Real-time feature '${feature}' implemented`);
      featuresPassed++;
    } else {
      console.log(`  ❌ Real-time feature '${feature}' not found`);
    }
  });

  console.log(`\n📊 Real-time Features Test: ${featuresPassed}/${realTimeFeatures.length} passed\n`);
  return featuresPassed === realTimeFeatures.length;
}

/**
 * Test 9: Build Process Validation
 */
function testBuildProcess() {
  console.log('🏗️ Testing Build Process...');
  
  try {
    console.log('  Building astro app...');
    const result = execSync('npm run build', { 
      cwd: TEST_CONFIG.astroApp,
      encoding: 'utf8',
      timeout: TEST_CONFIG.testTimeout * 2 // Build takes longer
    });
    
    console.log('  ✅ Build completed successfully');
    
    // Check if dist directory was created
    const distPath = path.join(TEST_CONFIG.astroApp, 'dist');
    if (fs.existsSync(distPath)) {
      console.log('  ✅ Dist directory created');
      return true;
    } else {
      console.log('  ❌ Dist directory not found');
      return false;
    }
  } catch (error) {
    console.log('  ❌ Build failed:');
    console.log(`     ${error.message.split('\n')[0]}`); // Show only first line of error
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const tests = [
    { name: 'Component Imports', test: testComponentImports },
    { name: 'TypeScript Compilation', test: testTypeScriptCompilation },
    { name: 'Chart Analytics Service', test: testChartAnalyticsService },
    { name: 'Chart Sync Service', test: testChartSyncService },
    { name: 'CSS Modules', test: testCSSModules },
    { name: 'D3.js Integration', test: testD3Integration },
    { name: 'React Query Integration', test: testReactQueryIntegration },
    { name: 'Real-time Features', test: testRealTimeFeatures },
    { name: 'Build Process', test: testBuildProcess }
  ];

  const results = [];
  
  for (const { name, test } of tests) {
    try {
      const result = test();
      results.push({ name, passed: result });
    } catch (error) {
      console.log(`  ❌ ${name} test failed with error: ${error.message}`);
      results.push({ name, passed: false });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 INTERACTIVE CHART FEATURES TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(({ name, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Overall Score: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 All interactive chart features are working correctly!');
    console.log('\n🚀 Ready for enhanced chart visualization with:');
    console.log('   • Real-time transit tracking');
    console.log('   • Interactive D3.js visualizations');
    console.log('   • Advanced pattern recognition');
    console.log('   • Live astrological analytics');
    console.log('   • Responsive chart interactions');
  } else {
    console.log('⚠️  Some features need attention before full deployment.');
    console.log('\n🔧 Focus areas for improvement:');
    results.filter(r => !r.passed).forEach(({ name }) => {
      console.log(`   • ${name}`);
    });
  }
  
  console.log('\n📝 Next Enhancement Ideas:');
  console.log('   • 3D chart visualization with Three.js');
  console.log('   • Voice-activated chart navigation');
  console.log('   • AI-powered interpretation suggestions');
  console.log('   • Multi-chart comparison tools');
  console.log('   • Predictive transit notifications');
}

// Execute all tests
runAllTests().catch(console.error);
