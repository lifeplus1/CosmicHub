import React from 'react';
import { Card, Button } from '@cosmichub/ui';
import { useAuth } from '@cosmichub/auth';
import { useNavigate } from 'react-router-dom';

const ProfileSimple: React.FC = (): JSX.Element => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async (): Promise<void> => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold text-cosmic-gold">Profile</h1>
      
      <Card title="Account Overview">
        <div className="space-y-4" role="list" aria-label="Account details">
          <div className="flex justify-between" role="listitem" aria-labelledby="email-label">
            <span id="email-label" className="text-cosmic-silver">Email</span>
            <span className="text-cosmic-gold" aria-label={`User email address: ${user.email}`}>{user.email}</span>
          </div>
          <div className="flex justify-between" role="listitem" aria-labelledby="account-id-label">
            <span id="account-id-label" className="text-cosmic-silver">Account ID</span>
            <span className="text-cosmic-gold font-mono text-sm" aria-label={`User account ID: ${user.uid.slice(0, 8)}...`}>
              {user.uid.slice(0, 8)}...
            </span>
          </div>
        </div>
      </Card>

      <Card title="Subscription">
        <div className="text-center space-y-4" role="status" aria-label="Subscription status">
          <p className="text-cosmic-silver">Free Tier</p>
          <Button 
            onClick={() => navigate('/upgrade')} 
            variant="primary"
            aria-label="Upgrade to Premium subscription for additional features."
          >
            Upgrade to Premium
          </Button>
        </div>
      </Card>
      
      <div className="text-center mt-6">
        <Button 
          onClick={handleSignOut} 
          variant="secondary"
          aria-label="Sign out of your account and return to the login page."
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSimple;
