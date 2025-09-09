import React from 'react';
import { useAuth } from '@cosmichub/auth';

const ProfileTest: React.FC = () => {
  const { user, loading } = useAuth();

  // Development debugging - log auth state
  React.useEffect(() => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
       
      // ProfileTest - Auth state logging removed for production
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cosmic-dark">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">Not Authenticated</h1>
          <button
            onClick={() => {
              // Manual mock login for testing
              const mockUser = {
                uid: 'test-user-123',
                email: 'test@test.com',
                emailVerified: true,
                displayName: 'Test User',
              };
              sessionStorage.setItem('cosmichub_mock_user', JSON.stringify(mockUser));
              window.location.reload();
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Login as Test User
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-dark p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-white mb-6">Profile Test - Success! ✅</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl text-white mb-4">User Information:</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Display Name:</strong> {user.displayName ?? 'Not set'}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => window.location.href = '/profile'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-4"
          >
            Try Real Profile Page
          </button>
          
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear Auth & Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTest;
