import React from 'react';
import { Card, Button } from '@cosmichub/ui';
import { useAuth } from '@cosmichub/auth';
import { useNavigate } from 'react-router-dom';

const ProfileSimple: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <h1 className="text-3xl font-bold text-cosmic-gold">Profile</h1>
      
      <Card title="Account Overview">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-cosmic-silver">Email</span>
            <span className="text-cosmic-gold">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cosmic-silver">Account ID</span>
            <span className="text-cosmic-gold font-mono text-sm">{user.uid.slice(0, 8)}...</span>
          </div>
        </div>
      </Card>

      <Card title="Subscription">
        <div className="text-center space-y-4">
          <p className="text-cosmic-silver">Free Tier</p>
          <Button onClick={() => navigate('/upgrade')} variant="primary">
            Upgrade to Premium
          </Button>
        </div>
      </Card>
      
      <div className="text-center mt-6">
        <Button onClick={handleSignOut} variant="secondary">
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default ProfileSimple;
