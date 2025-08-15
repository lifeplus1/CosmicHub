import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@cosmichub/auth';
import { Card, Button } from '@cosmichub/ui';
import * as Tabs from '@radix-ui/react-tabs';
import { FaUser, FaArrowUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import ProgressBar from '../components/ProgressBar';

// Lazy load preferences component
const ChartPreferences = React.lazy(() => import('../components/ChartPreferences'));

interface UserStats {
  totalCharts: number;
  chartsThisMonth: number;
  savedCharts: number;
  joinDate: Date;
  lastLogin: Date;
}

const Profile: React.FC = React.memo(() => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    totalCharts: 0,
    chartsThisMonth: 0,
    savedCharts: 0,
    joinDate: new Date(),
    lastLogin: new Date(),
  });

  const loadUserStats = useCallback(async () => {
    if (user) {
      // Simulate fetching stats from Firestore
      setUserStats({
        totalCharts: 50,
        chartsThisMonth: 10,
        savedCharts: 5,
        joinDate: new Date(user.metadata?.creationTime || Date.now()),
        lastLogin: new Date(),
      });
    }
  }, [user]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast({ message: 'Signed out successfully', type: 'success' });
      navigate('/login');
    } catch {
      toast({ message: 'Error signing out', type: 'error' });
    }
  }, [signOut, navigate, toast]);

  const handleUpgrade = useCallback(() => {
    navigate('/upgrade');
  }, [navigate]);

  if (!user) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto text-4xl text-cosmic-purple animate-spin" aria-hidden="true">⭐</div>
        <p className="mt-4 text-cosmic-silver">Please sign in to view your profile</p>
        <Button onClick={() => navigate('/login')} variant="primary" className="mt-4">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl py-8 mx-auto">
      <div className="cosmic-card p-6 rounded-lg shadow-lg bg-cosmic-dark">
        <div className="flex flex-col items-center mb-6 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-cosmic-blue/30">
            <FaUser className="text-3xl text-cosmic-silver" aria-hidden="true" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-cosmic-gold">{user.email}</h2>
            <span className="bg-cosmic-purple/20 text-cosmic-purple px-2 py-1 rounded text-sm font-semibold uppercase">
              Free Tier
            </span>
          </div>
        </div>

        <Tabs.Root defaultValue="overview" className="space-y-6">
          <Tabs.List className="flex mb-6 border-b border-cosmic-silver/30" aria-label="Profile Tabs">
            <Tabs.Trigger
              value="overview"
              className="px-4 py-2 text-cosmic-silver data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple"
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="usage"
              className="px-4 py-2 text-cosmic-silver data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple"
            >
              Usage
            </Tabs.Trigger>
            <Tabs.Trigger
              value="preferences"
              className="px-4 py-2 text-cosmic-silver data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple"
            >
              Preferences
            </Tabs.Trigger>
            <Tabs.Trigger
              value="account"
              className="px-4 py-2 text-cosmic-silver data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple"
            >
              Account
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview">
            <div className="space-y-6">
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
                  <div className="flex justify-between">
                    <span className="text-cosmic-silver">Joined</span>
                    <span className="text-cosmic-gold">{userStats.joinDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
              <Card title="Activity Summary">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-cosmic-silver">Total Charts</p>
                    <p className="text-2xl font-bold text-cosmic-gold">{userStats.totalCharts}</p>
                  </div>
                  <div>
                    <p className="text-cosmic-silver">Charts This Month</p>
                    <p className="text-2xl font-bold text-cosmic-gold">{userStats.chartsThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-cosmic-silver">Saved Charts</p>
                    <p className="text-2xl font-bold text-cosmic-gold">{userStats.savedCharts}</p>
                  </div>
                </div>
              </Card>
            </div>
          </Tabs.Content>

          <Tabs.Content value="usage">
            <div className="space-y-6">
              <Card title="Chart Creation">
                <div className="flex justify-between mb-2">
                  <p className="text-cosmic-silver">Charts This Month</p>
                  <p className="font-bold text-cosmic-gold">{userStats.chartsThisMonth} / 50</p>
                </div>
                <ProgressBar
                  percentage={(userStats.chartsThisMonth / 50) * 100}
                  color="purple"
                />
              </Card>
              <Card title="Chart Storage">
                <div className="flex justify-between mb-2">
                  <p className="text-cosmic-silver">Saved Charts</p>
                  <p className="font-bold text-cosmic-gold">{userStats.savedCharts} / 10</p>
                </div>
                <ProgressBar
                  percentage={(userStats.savedCharts / 10) * 100}
                  color="blue"
                />
              </Card>
            </div>
          </Tabs.Content>

          <Tabs.Content value="preferences">
            <React.Suspense fallback={<div className="text-cosmic-silver">Loading preferences...</div>}>
              <ChartPreferences />
            </React.Suspense>
          </Tabs.Content>

          <Tabs.Content value="account">
            <Card title="Subscription">
              <div className="text-center space-y-4">
                <p className="text-cosmic-silver">You are currently on the Free plan</p>
                <Button onClick={handleUpgrade} variant="primary">
                  <FaArrowUp className="mr-2" /> Upgrade to Premium
                </Button>
              </div>
            </Card>
            <div className="text-center mt-6">
              <Button onClick={handleSignOut} variant="secondary">
                Sign Out
              </Button>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
});

Profile.displayName = 'Profile';

export default Profile;
