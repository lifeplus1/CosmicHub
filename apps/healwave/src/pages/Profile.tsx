import React from 'react';
import { useAuth } from '@cosmichub/auth';
import { Button } from '@cosmichub/ui';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import UserProfile from '../components/UserProfile';

const Profile: React.FC = React.memo(() => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
      toast({ message: 'Signed out successfully', type: 'success' });
      navigate('/login');
    } catch {
      toast({ message: 'Error signing out', type: 'error' });
    }
  }, [signOut, navigate, toast]);

  if (!user) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto text-4xl text-cosmic-purple animate-spin" aria-hidden="true">🎵</div>
        <p className="mt-4 text-cosmic-silver">Please sign in to view your profile</p>
        <Button onClick={() => navigate('/login')} variant="primary" className="mt-4">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-dark">
      <UserProfile />
      <div className="max-w-4xl mx-auto pb-8">
        <div className="text-center">
    <Button onClick={() => { void handleSignOut(); }} variant="secondary">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
