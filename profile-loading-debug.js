// 🔍 Profile Loading Diagnostic Script
// Run this in the browser console while the profile page is stuck loading

console.log('🔍 Diagnosing Profile Loading Issue...\n');

// Step 1: Check auth state in sessionStorage
console.group('📱 1. Storage Check');
const sessionUser = sessionStorage.getItem('cosmichub_mock_user');
const localUser = localStorage.getItem('cosmichub_mock_user');

console.log('Session Storage:', sessionUser ? '✅ Found user' : '❌ No user');
console.log('Local Storage:', localUser ? '✅ Found user' : '❌ No user');

if (sessionUser) {
  try {
    const user = JSON.parse(sessionUser);
    console.log('User email:', user.email);
    console.log('User UID:', user.uid);
  } catch (e) {
    console.error('❌ Error parsing user:', e);
  }
}
console.groupEnd();

// Step 2: Check React component state
console.group('⚛️ 2. Component State');
// Access React DevTools if available
if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('React DevTools available');
} else {
  console.log('React DevTools not available');
}

// Check if we can access the React fiber
const rootElement = document.getElementById('root');
if (rootElement) {
  console.log('Root element found');
  
  // Look for loading indicators
  const loadingElements = document.querySelectorAll('[class*="loading"], [aria-label*="Loading"], [aria-label*="loading"]');
  console.log('Loading elements found:', loadingElements.length);
  
  if (loadingElements.length > 0) {
    console.log('Loading elements:', loadingElements);
  }
}
console.groupEnd();

// Step 3: Force auth state reset
console.group('🔧 3. Force Auth Reset');
window.forceAuthReset = function() {
  console.log('🧪 Setting up fresh auth state...');
  
  // Clear existing auth
  sessionStorage.removeItem('cosmichub_mock_user');
  localStorage.removeItem('cosmichub_mock_user');
  
  // Set new auth state
  const testUser = {
    uid: 'test-user-123',
    email: 'test@test.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: null,
    phoneNumber: null,
    providerId: 'mock',
    isAnonymous: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
  };
  
  sessionStorage.setItem('cosmichub_mock_user', JSON.stringify(testUser));
  console.log('✅ Fresh auth state set');
  
  // Force reload
  console.log('🔄 Reloading page...');
  window.location.reload();
};

window.skipToProfileTest = function() {
  console.log('🧪 Going to profile test page...');
  window.location.href = '/profile-test';
};
console.groupEnd();

// Step 4: Check for JavaScript errors
console.group('🚨 4. Error Detection');
const originalError = console.error;
const errorLog = [];

console.error = function(...args) {
  errorLog.push(args);
  originalError.apply(console, args);
};

setTimeout(() => {
  if (errorLog.length > 0) {
    console.log('❌ JavaScript errors detected:', errorLog);
  } else {
    console.log('✅ No JavaScript errors detected');
  }
}, 2000);
console.groupEnd();

console.log('\n🎯 QUICK ACTIONS:');
console.log('1. Run: forceAuthReset() - Reset auth and reload');
console.log('2. Run: skipToProfileTest() - Go to simple test page');
console.log('3. Check Network tab for failed requests');
console.log('4. Wait 5 seconds and check for errors above');

// Step 5: Auto-detect loading state issue
setTimeout(() => {
  console.group('⏰ 5. Auto-Diagnosis (5 second delay)');
  
  const stillLoading = document.querySelector('[aria-label*="Loading"], [class*="loading"]');
  if (stillLoading) {
    console.log('❌ Still showing loading state after 5 seconds');
    console.log('This indicates a loading state that never resolves');
    console.log('SOLUTION: Run forceAuthReset() to fix this');
  } else {
    console.log('✅ Loading state resolved or page navigated');
  }
  
  console.groupEnd();
}, 5000);
