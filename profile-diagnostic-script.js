// 🔍 HEALWAVE PROFILE LOADING DIAGNOSTIC SCRIPT
// Copy and paste this entire script into the browser console while on http://localhost:3000

console.log('🚀 Starting HealWave Profile Diagnostic...\n');

// Step 1: Check current URL and navigation
console.group('📍 1. URL & Navigation Check');
console.log('Current URL:', window.location.href);
console.log('Should be on port 3000:', window.location.port === '3000' ? '✅ YES' : '❌ NO - Port is ' + window.location.port);
console.groupEnd();

// Step 2: Check authentication state
console.group('🔐 2. Authentication State');
const sessionUser = sessionStorage.getItem('cosmichub_mock_user');
const localUser = localStorage.getItem('cosmichub_mock_user');

console.log('Session Storage User:', sessionUser ? '✅ Found' : '❌ Not found');
if (sessionUser) {
    try {
        const userData = JSON.parse(sessionUser);
        console.log('User Email:', userData.email);
        console.log('User UID:', userData.uid);
    } catch (e) {
        console.error('❌ Error parsing session user:', e);
    }
}

console.log('Local Storage User:', localUser ? '✅ Found' : '❌ Not found');
console.groupEnd();

// Step 3: Check React components and providers
console.group('⚛️ 3. React Component State');
const rootElement = document.getElementById('root');
if (rootElement) {
    console.log('Root element found:', '✅ YES');
    
    // Check if React is loaded
    if (window.React) {
        console.log('React loaded:', '✅ YES');
    } else {
        console.log('React loaded:', '❌ NO');
    }
} else {
    console.log('Root element found:', '❌ NO');
}
console.groupEnd();

// Step 4: Navigation and route testing
console.group('🧭 4. Navigation Test');
console.log('Current pathname:', window.location.pathname);

// Function to test navigation
window.testProfileNavigation = function() {
    console.log('🔄 Testing profile navigation...');
    window.history.pushState({}, '', '/profile');
    console.log('URL updated to:', window.location.href);
    
    // Trigger a popstate event to simulate navigation
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    setTimeout(() => {
        console.log('After navigation delay - checking page content...');
        const profileContent = document.querySelector('[data-testid="profile"], .profile, [class*="profile"]');
        if (profileContent) {
            console.log('✅ Profile content found');
        } else {
            console.log('❌ Profile content not found');
            // Check for any error messages
            const errorMessages = document.querySelectorAll('[class*="error"], [class*="loading"]');
            if (errorMessages.length > 0) {
                console.log('Found potential error/loading elements:', errorMessages);
            }
        }
    }, 1000);
};
console.groupEnd();

// Step 5: Mock authentication setup
console.group('🧪 5. Mock Authentication Setup');
window.setupMockAuth = function() {
    console.log('🔧 Setting up mock authentication...');
    
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
    
    try {
        sessionStorage.setItem('cosmichub_mock_user', JSON.stringify(mockUser));
        console.log('✅ Mock user stored successfully');
        console.log('Mock user data:', mockUser);
        
        // Trigger a page reload to apply the authentication
        console.log('🔄 Reloading page to apply authentication...');
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
    } catch (error) {
        console.error('❌ Failed to setup mock auth:', error);
    }
};
console.groupEnd();

// Step 6: Error detection
console.group('🚨 6. Error Detection');
// Listen for any JavaScript errors
window.addEventListener('error', (event) => {
    console.error('JavaScript Error Detected:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Listen for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise
    });
});

console.log('Error listeners set up ✅');
console.groupEnd();

// Step 7: Immediate diagnostics
console.group('🔬 7. Immediate Diagnostic Results');

// Check if any loading indicators are present
const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spin"], .animate-spin');
console.log('Loading elements found:', loadingElements.length);

// Check console for existing errors
const consoleErrors = [];
const originalError = console.error;
console.error = function(...args) {
    consoleErrors.push(args);
    originalError.apply(console, args);
};

// Check network requests (if available)
if (window.performance && window.performance.getEntriesByType) {
    const networkRequests = window.performance.getEntriesByType('resource');
    const failedRequests = networkRequests.filter(req => req.responseStatus >= 400);
    console.log('Failed network requests:', failedRequests.length);
    if (failedRequests.length > 0) {
        console.log('Failed requests details:', failedRequests);
    }
}

console.groupEnd();

// Summary and recommendations
console.group('📋 8. Quick Actions');
console.log('\n🎯 QUICK ACTIONS TO TRY:');
console.log('1. Run: setupMockAuth() - Sets up test user and reloads');
console.log('2. Run: testProfileNavigation() - Tests navigation to profile');
console.log('3. Navigate manually to: http://localhost:3000/profile');
console.log('4. Check Network tab in DevTools for failed requests');
console.log('5. Clear all storage: sessionStorage.clear(); localStorage.clear(); location.reload();');
console.groupEnd();

console.log('\n✨ Diagnostic script loaded! Try the Quick Actions above.');
console.log('If profile still doesn\'t load, check the Network tab for API failures or JavaScript errors.');
