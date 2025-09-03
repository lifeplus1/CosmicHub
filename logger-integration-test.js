// Logger Integration Test - Run this in your browser console
// Paste this into browser dev tools to test error boundary logger integration

console.log('🔍 Starting Logger Integration Test...');

// Test 1: Basic Console
console.log('✅ Standard console.log works');
console.warn('⚠️ Standard console.warn works');
console.error('❌ Standard console.error works');

// Test 2: Check if devConsole is available
if (typeof window !== 'undefined' && window.devConsole) {
  console.log('✅ devConsole is available globally');
  
  if (window.devConsole.log) window.devConsole.log('✅ devConsole.log works');
  if (window.devConsole.warn) window.devConsole.warn('⚠️ devConsole.warn works');
  if (window.devConsole.error) window.devConsole.error('❌ devConsole.error works');
} else {
  console.log('⚠️ devConsole not available globally (this is expected)');
}

// Test 3: Simulate Error Boundary logging
const testErrorBoundaryLogging = () => {
  console.group('🔥 Error Boundary Logger Test');
  
  // This simulates what the enhanced error boundary will do
  try {
    // Try to use devConsole if available
    if (typeof globalThis !== 'undefined' && globalThis.devConsole) {
      globalThis.devConsole.error?.('[ErrorBoundary] Test error logged through devConsole');
    } else {
      console.error('[ErrorBoundary] Test error logged through fallback console');
    }
    console.log('✅ Error boundary logging test completed');
  } catch (error) {
    console.error('[ErrorBoundary] Logger test failed:', error);
  }
  
  console.groupEnd();
};

testErrorBoundaryLogging();

console.log('🎯 Logger Integration Test Completed - Check output above');
