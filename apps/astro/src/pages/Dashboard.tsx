import React from 'react';
import { useAuth } from '@cosmichub/auth';
import { Button, Card } from '@cosmichub/ui';
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
        <Card title="Birth Chart" className="hover:bg-cosmic-purple/10 transition-colors">
          <p className="text-cosmic-silver mb-4">
            Generate your personalized astrological birth chart
          </p>
          <Button onClick={() => window.location.href = '/chart'}>
            Create Chart
          </Button>
        </Card>

        {isFeatureEnabled('healwave') && (
          <Card title="Healwave Integration" className="hover:bg-cosmic-purple/10 transition-colors">
            <p className="text-cosmic-silver mb-4">
              Access personalized healing frequencies based on your chart
            </p>
            <Button onClick={() => window.location.href = '/healwave'}>
              Explore Healwave
            </Button>
          </Card>
        )}

        <Card title="Your Profile" className="hover:bg-cosmic-purple/10 transition-colors">
          <p className="text-cosmic-silver mb-4">
            Manage your account and preferences
          </p>
          <Button onClick={() => window.location.href = '/profile'}>
            View Profile
          </Button>
        </Card>
      </div>

      {user && (
        <div className="mt-8">
          <Card title="Recent Activity" className="bg-cosmic-dark/50">
            <p className="text-cosmic-silver">
              Your recent charts and sessions will appear here.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
