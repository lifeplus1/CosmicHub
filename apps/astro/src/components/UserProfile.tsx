import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@cosmichub/auth';
import { useSubscription } from '@cosmichub/auth';
import { useToast } from './ToastProvider';
import * as Tabs from '@radix-ui/react-tabs';
import { FaUser, FaCrown, FaStar, FaCalendarAlt, FaChartLine, FaSave, FaCreditCard, FaCheck, FaTimes, FaArrowUp, FaHistory, FaCog } from 'react-icons/fa';
import { COSMICHUB_TIERS } from '../types/subscription';
import ProgressBar from './ProgressBar';
import './UserProfile.module.css';

interface UserStats {
  totalCharts: number;
  chartsThisMonth: number;
  savedCharts: number;
  joinDate: Date;
  lastLogin: Date;
}

const UserProfile: React.FC = React.memo(() => {
  const { user } = useAuth();
  const subscriptionData = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Type assertion for compatibility with existing code
  const { subscription, userTier, isLoading, checkUsageLimit } = subscriptionData as any;

  const [userStats, setUserStats] = useState<UserStats>({
    totalCharts: 0,
    chartsThisMonth: 0,
    savedCharts: 0,
    joinDate: new Date(),
    lastLogin: new Date(),
  });

  const loadUserStats = useCallback(async () => {
    if (user && checkUsageLimit) {
      const chartsUsage = checkUsageLimit('chartsPerMonth');
      const savedUsage = checkUsageLimit('chartStorage');
      setUserStats({
        totalCharts: chartsUsage.current + 50,
        chartsThisMonth: chartsUsage.current,
        savedCharts: savedUsage.current,
        joinDate: new Date(user.metadata?.creationTime || Date.now()),
        lastLogin: new Date(),
      });
    }
  }, [user, checkUsageLimit]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const getTierIcon = (tier: keyof typeof COSMICHUB_TIERS) => {
    switch (tier) {
      case 'free': return <FaUser className="text-cosmic-silver" aria-hidden="true" />;
      case 'premium': return <FaStar className="text-cosmic-purple" aria-hidden="true" />;
      case 'elite': return <FaCrown className="text-cosmic-gold" aria-hidden="true" />;
      default: return <FaUser className="text-cosmic-silver" aria-hidden="true" />;
    }
  };

  const getTierColor = (tier: keyof typeof COSMICHUB_TIERS) => {
    switch (tier) {
      case 'free': return 'cosmic-silver';
      case 'premium': return 'cosmic-purple';
      case 'elite': return 'cosmic-gold';
      default: return 'cosmic-silver';
    }
  };

  const handleUpgrade = useCallback(() => {
    navigate('/upgrade');
  }, [navigate]);

  const currentTier = COSMICHUB_TIERS[userTier as keyof typeof COSMICHUB_TIERS];
  const chartsUsage = checkUsageLimit ? checkUsageLimit('chartsPerMonth') : { current: 0, limit: 0 };
  const savedUsage = checkUsageLimit ? checkUsageLimit('chartStorage') : { current: 0, limit: 0 };

  if (isLoading || !user) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto text-4xl text-cosmic-purple animate-spin" aria-hidden="true">⭐</div>
        <p className="mt-4 text-cosmic-silver">Loading profile...</p>
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
            <div className="flex items-center mt-2 space-x-2">
              {getTierIcon(userTier)}
              <span className={`bg-${getTierColor(userTier)}/20 text-${getTierColor(userTier)} px-2 py-1 rounded text-sm font-semibold uppercase`}>
                {userTier}
              </span>
            </div>
          </div>
        </div>

        <Tabs.Root defaultValue="overview">
          <Tabs.List className="flex mb-6 border-b border-cosmic-silver/30" aria-label="User Profile Tabs">
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
              value="account"
              className="px-4 py-2 text-cosmic-silver data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple"
            >
              Account
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="overview">
            <div className="flex flex-col space-y-6">
              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Subscription Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-cosmic-silver">Current Plan</p>
                    <p className="font-bold text-cosmic-gold">{currentTier.name}</p>
                    <p className="text-sm text-cosmic-silver/80">{currentTier.description}</p>
                  </div>
                  <div>
                    <p className="text-cosmic-silver">Billing</p>
                    <p className="font-bold text-cosmic-gold">
                      {currentTier.price.monthly > 0 ? `$${currentTier.price.monthly}/month` : 'Free'}
                    </p>
                    {currentTier.price.monthly > 0 && (
                      <p className="text-sm text-cosmic-silver/80">
                        Next billing: {new Date(subscription?.currentPeriodEnd || Date.now()).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  className="w-full mt-4 cosmic-button sm:w-auto"
                  onClick={handleUpgrade}
                  aria-label={currentTier.name === 'Free' ? 'Upgrade Plan' : 'Manage Subscription'}
                >
                  {currentTier.name === 'Free' ? (
                    <span className="flex items-center space-x-2">
                      <FaArrowUp />
                      <span>Upgrade Plan</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <FaCreditCard />
                      <span>Manage Subscription</span>
                    </span>
                  )}
                </button>
              </div>

              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Activity Summary</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-cosmic-silver">Total Charts Created</p>
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
              </div>

              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Recent Activity</h3>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <FaHistory className="text-cosmic-blue" aria-hidden="true" />
                    <span className="text-cosmic-silver">Last Login: {userStats.lastLogin.toLocaleString()}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FaCalendarAlt className="text-cosmic-blue" aria-hidden="true" />
                    <span className="text-cosmic-silver">Joined: {userStats.joinDate.toLocaleDateString()}</span>
                  </li>
                </ul>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="usage">
            <div className="flex flex-col space-y-6">
              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Chart Creation</h3>
                <div className="flex justify-between mb-2">
                  <p className="text-cosmic-silver">Charts This Month</p>
                  <p className="font-bold text-cosmic-gold">{chartsUsage.current} / {chartsUsage.limit}</p>
                </div>
                <ProgressBar
                  percentage={(chartsUsage.current / Math.max(chartsUsage.limit, 1)) * 100}
                  color="purple"
                />
                {chartsUsage.current >= chartsUsage.limit && (
                  <div className="flex p-4 mt-4 space-x-4 border border-yellow-500 rounded-md bg-yellow-900/50">
                    <span className="text-xl text-yellow-500" aria-hidden="true">⚠️</span>
                    <p className="text-cosmic-silver">You've reached your monthly chart limit. Upgrade your plan to create more charts.</p>
                  </div>
                )}
              </div>

              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Chart Storage</h3>
                <div className="flex justify-between mb-2">
                  <p className="text-cosmic-silver">Saved Charts</p>
                  <p className="font-bold text-cosmic-gold">{savedUsage.current} / {savedUsage.limit}</p>
                </div>
                <ProgressBar
                  percentage={(savedUsage.current / Math.max(savedUsage.limit, 1)) * 100}
                  color="blue"
                />
                {savedUsage.current >= savedUsage.limit && (
                  <div className="flex p-4 mt-4 space-x-4 border border-yellow-500 rounded-md bg-yellow-900/50">
                    <span className="text-xl text-yellow-500" aria-hidden="true">⚠️</span>
                    <p className="text-cosmic-silver">You've reached your chart storage limit. Upgrade your plan to save more charts.</p>
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="account">
            <div className="flex flex-col space-y-6">
              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Account Information</h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Email Address</span>
                    <span className="text-cosmic-silver">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Email Verified</span>
                    <span className={`px-2 py-1 rounded text-sm ${user.emailVerified ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {user.emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Account ID</span>
                    <span className="font-mono text-sm text-cosmic-silver">{user.uid.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Two-Factor Auth</span>
                    <span className="px-2 py-1 text-sm text-cosmic-silver rounded bg-cosmic-silver/20">Not Set Up</span>
                  </div>
                </div>
              </div>

              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Preferences</h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Email Notifications</span>
                    <span className="px-2 py-1 text-sm text-green-500 rounded bg-green-500/20">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Marketing Emails</span>
                    <span className="px-2 py-1 text-sm text-cosmic-silver rounded bg-cosmic-silver/20">Disabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Data Export</span>
                    <button className="w-auto cosmic-button" aria-label="Request Data Export">
                      Request Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;
