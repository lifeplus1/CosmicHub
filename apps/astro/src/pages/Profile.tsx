import React from 'react';
import { useAuth } from '@cosmichub/auth';
import { Card, Button } from '@cosmichub/ui';

const Profile: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4">
          Your Profile
        </h1>
        <p className="text-xl text-cosmic-silver">
          Manage your account and preferences
        </p>
      </div>

      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Account Information">
            <div className="space-y-4">
              <div>
                <label className="block text-cosmic-silver mb-1">Email</label>
                <p className="text-cosmic-gold">{user.email}</p>
              </div>
              <div>
                <label className="block text-cosmic-silver mb-1">User ID</label>
                <p className="text-cosmic-gold text-sm font-mono">{user.uid}</p>
              </div>
              <div>
                <label className="block text-cosmic-silver mb-1">Account Created</label>
                <p className="text-cosmic-gold">
                  {user.metadata?.creationTime ? 
                    new Date(user.metadata.creationTime).toLocaleDateString() : 
                    'Unknown'
                  }
                </p>
              </div>
            </div>
          </Card>

          <Card title="Preferences">
            <div className="space-y-4">
              <div>
                <label className="block text-cosmic-silver mb-2">Chart Style</label>
                <select className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver">
                  <option>Western</option>
                  <option>Vedic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-cosmic-silver mb-2">House System</label>
                <select className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver">
                  <option>Placidus</option>
                  <option>Whole Sign</option>
                  <option>Equal House</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="notifications" className="rounded" />
                <label htmlFor="notifications" className="text-cosmic-silver">
                  Email notifications
                </label>
              </div>
            </div>
          </Card>

          <Card title="Subscription" className="md:col-span-2">
            <div className="text-center space-y-4">
              <p className="text-cosmic-silver">You are currently on the Free plan</p>
              <Button variant="primary">
                Upgrade to Premium
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <Card title="Please Sign In" className="text-center">
          <p className="text-cosmic-silver mb-4">
            Please sign in to view your profile
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Sign In
          </Button>
        </Card>
      )}

      {user && (
        <div className="text-center">
          <Button 
            variant="secondary" 
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
};

export default Profile;
