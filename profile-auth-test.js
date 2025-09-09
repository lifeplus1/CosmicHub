// 🧪 Quick Authentication Test for Profile Loading
// Run this in the browser console at http://localhost:3000

console.log('🔍 Starting Profile Loading Debug...');

// Step 1: Clear any existing auth state
console.log('🧹 Clearing existing auth state...');
sessionStorage.removeItem('cosmichub_mock_user');
localStorage.removeItem('cosmichub_mock_user');

// Step 2: Set up proper mock user
console.log('🧪 Setting up test user...');
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

// Save to sessionStorage
try {
  sessionStorage.setItem('cosmichub_mock_user', JSON.stringify(testUser));
  console.log('✅ Test user saved to sessionStorage');
} catch (error) {
  console.error('❌ Failed to save test user:', error);
}

// Step 3: Navigate to profile after a short delay
console.log('🔄 Navigating to profile page...');
setTimeout(() => {
  window.location.href = '/profile';
}, 500);

// Alternative: If the above doesn't work, try this manual reload approach
window.testProfileManual = function() {
  console.log('🔄 Manual profile test...');
  
  // Force reload to apply auth state
  window.location.reload();
  
  // After reload, navigate to profile
  setTimeout(() => {
    if (window.location.pathname !== '/profile') {
      window.location.href = '/profile';
    }
  }, 1000);
};

console.log('If profile still doesn\'t load, run: testProfileManual()');
