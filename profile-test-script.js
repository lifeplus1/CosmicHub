// Quick Profile Loading Test Script
// Paste this in the browser console at http://localhost:3000

console.log('🚀 Starting Profile Loading Test...');

// Test 1: Check current auth state
console.log('📍 Current URL:', window.location.href);
const sessionUser = sessionStorage.getItem('cosmichub_mock_user');
console.log('🔐 Session User:', sessionUser ? 'Found' : 'Not found');

// Test 2: Set up mock authentication
function setupMockAuth() {
    const mockUser = {
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
    
    sessionStorage.setItem('cosmichub_mock_user', JSON.stringify(mockUser));
    console.log('✅ Mock user set in sessionStorage');
    return mockUser;
}

// Test 3: Navigate to profile
function testProfile() {
    setupMockAuth();
    console.log('🔄 Navigating to profile...');
    window.location.href = 'http://localhost:3000/profile';
}

// Test 4: Clear auth and test
function clearAuth() {
    sessionStorage.clear();
    localStorage.clear();
    console.log('🧹 Auth cleared');
    window.location.reload();
}

// Make functions available globally
window.testProfile = testProfile;
window.setupMockAuth = setupMockAuth;
window.clearAuth = clearAuth;

console.log('🎯 Test functions ready:');
console.log('- window.testProfile() - Set auth and go to profile');
console.log('- window.setupMockAuth() - Just set auth');
console.log('- window.clearAuth() - Clear everything');

// Auto-run if no existing auth
if (!sessionUser) {
    console.log('🧪 No existing auth found. Setting up mock auth...');
    setupMockAuth();
    if (window.location.pathname !== '/profile') {
        console.log('📍 Not on profile page. Run window.testProfile() to test.');
    }
} else {
    console.log('✅ Existing auth found. Profile should work.');
    if (window.location.pathname !== '/profile') {
        console.log('📍 Run: window.location.href = "/profile" to test.');
    }
}
