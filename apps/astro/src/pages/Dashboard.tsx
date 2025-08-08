import React from 'react';
import { useAuth } from '@cosmichub/auth';
import { isFeatureEnabled } from '@cosmichub/config';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cosmic-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4">
          Welcome to CosmicHub
        </h1>
        <p className="text-xl text-cosmic-silver">
          {user ? `Hello, ${user.email}!` : 'Your cosmic journey begins here'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="hover:bg-cosmic-purple/10 transition-colors"><h3 className="mb-4 text-lg font-semibold">Birth Chart</h3>
          <p className="text-cosmic-silver mb-4">
            Generate your personalized astrological birth chart
          </p>
          <button 
            onClick={() => window.location.href = '/chart'}
            className="px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-lg transition-colors"
          >
            Create Chart
          </button>
        </div>

        {isFeatureEnabled('healwave') && (
          <div className="hover:bg-cosmic-purple/10 transition-colors"><h3 className="mb-4 text-lg font-semibold">Healwave Integration</h3>
            <p className="text-cosmic-silver mb-4">
              Access personalized healing frequencies based on your chart
            </p>
            <button 
              onClick={() => window.location.href = '/healwave'}
              className="px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-lg transition-colors"
            >
              Explore Healwave
            </button>
          </div>
        )}

        <div className="hover:bg-cosmic-purple/10 transition-colors"><h3 className="mb-4 text-lg font-semibold">Your Profile</h3>
          <p className="text-cosmic-silver mb-4">
            Manage your account and preferences
          </p>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="px-4 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-white rounded-lg transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>

      {user && (
        <div className="mt-8">
          <div className="bg-cosmic-dark/50"><h3 className="mb-4 text-lg font-semibold">Recent Activity</h3>
            <p className="text-cosmic-silver">
              Your recent charts and sessions will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
