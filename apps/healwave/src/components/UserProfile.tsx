import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useSubscription } from '@cosmichub/auth';
import * as Tabs from '@radix-ui/react-tabs';
import { FaUser, FaCrown, FaStar, FaCalendarAlt, FaHeadphones, FaCreditCard, FaArrowUp, FaHistory } from 'react-icons/fa';
import { HEALWAVE_TIERS } from '@cosmichub/subscriptions';
import ProgressBar from './ProgressBar';

interface UserStats {
  totalSessions: number;
  sessionsThisMonth: number;
  favoriteFrequencies: number;
  joinDate: Date;
  lastSession: Date;
}

interface SubscriptionUsage { current: number; limit: number; }
interface SubscriptionInfo { currentPeriodEnd?: string | number | Date | null | undefined; name?: string; price?: { monthly?: number | null | undefined }; }
interface SubscriptionHookData {
  subscription?: SubscriptionInfo | null;
  userTier: string;
  isLoading: boolean;
  checkUsageLimit?: (key: string) => SubscriptionUsage | undefined;
}

const UserProfile: React.FC = React.memo(() => {
  const { user } = useAuth();
  const subscriptionData = useSubscription() as unknown as SubscriptionHookData; // Narrowing locally; upstream hook lacks exported type
  const navigate = useNavigate();
  const { subscription, userTier, isLoading, checkUsageLimit } = subscriptionData;

  const [userStats, setUserStats] = useState<UserStats>({
    totalSessions: 0,
    sessionsThisMonth: 0,
    favoriteFrequencies: 0,
    joinDate: new Date(),
    lastSession: new Date(),
  });

  const loadUserStats = useCallback((): void => {
    if (user !== null && user !== undefined && typeof checkUsageLimit === 'function') {
      const usage = checkUsageLimit('sessionsPerDay') ?? { current: 0, limit: 0 };
      const creation = user.metadata?.creationTime;
      const joinDate = typeof creation === 'string' ? new Date(creation) : new Date();
      setUserStats({
        totalSessions: usage.current + 25,
        sessionsThisMonth: usage.current,
        favoriteFrequencies: 8,
        joinDate,
        lastSession: new Date()
      });
    }
  }, [user, checkUsageLimit]);

  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  const getTierIcon = (tier: keyof typeof HEALWAVE_TIERS): React.ReactNode => {
    switch (tier) {
      case 'free': return <FaUser className="text-cosmic-silver" aria-hidden="true" />;
      case 'premium': return <FaStar className="text-cosmic-purple" aria-hidden="true" />;
      case 'clinical': return <FaCrown className="text-cosmic-gold" aria-hidden="true" />;
      default: return <FaUser className="text-cosmic-silver" aria-hidden="true" />;
    }
  };

  const getTierColor = (tier: keyof typeof HEALWAVE_TIERS): string => {
    switch (tier) {
      case 'free': return 'cosmic-silver';
      case 'premium': return 'cosmic-purple';
      case 'clinical': return 'cosmic-gold';
      default: return 'cosmic-silver';
    }
  };

  const handleUpgrade = useCallback((): void => {
    navigate('/upgrade');
  }, [navigate]);

  const currentTier = HEALWAVE_TIERS[userTier as keyof typeof HEALWAVE_TIERS];
  const sessionUsage: SubscriptionUsage = typeof checkUsageLimit === 'function'
    ? (checkUsageLimit('sessionsPerDay') ?? { current: 0, limit: 2 })
    : { current: 0, limit: 2 };

  if (isLoading === true || user === null || user === undefined) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto text-4xl text-cosmic-purple animate-spin" aria-hidden="true">🎵</div>
        <p className="mt-4 text-cosmic-silver">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl py-8 mx-auto">
      <div className="cosmic-card p-6 rounded-lg shadow-lg bg-cosmic-dark">
        <div className="flex flex-col items-center mb-6 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-cosmic-blue/30">
            <FaHeadphones className="text-3xl text-cosmic-silver" aria-hidden="true" />
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
                    <p className="font-bold text-cosmic-gold">{currentTier?.name || 'Free'}</p>
                    <p className="text-sm text-cosmic-silver/80">
                      {currentTier?.name === 'Free' 
                        ? 'Basic binaural beat access'
                        : currentTier?.name === 'HealWave Pro'
                        ? 'Full therapeutic frequency library'
                        : 'Clinical-grade audio therapy tools'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-cosmic-silver">Billing</p>
                    <p className="font-bold text-cosmic-gold">
                      {currentTier?.price?.monthly !== undefined && currentTier.price.monthly !== null && currentTier.price.monthly > 0 ? `$${currentTier.price.monthly}/month` : 'Free'}
                    </p>
                      {currentTier?.price?.monthly !== undefined && currentTier.price.monthly !== null && currentTier.price.monthly > 0 && subscription?.currentPeriodEnd !== null && subscription?.currentPeriodEnd !== undefined && (
                        <p className="text-sm text-cosmic-silver/80">
                          Next billing: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      )}
                  </div>
                </div>
                <button
                  className="w-full mt-4 cosmic-button sm:w-auto"
                  onClick={handleUpgrade}
                  aria-label={currentTier?.name === 'Free' ? 'Upgrade Plan' : 'Manage Subscription'}
                >
                  {currentTier?.name === 'Free' ? (
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
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Session Summary</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-cosmic-silver">Total Sessions</p>
                    <p className="text-2xl font-bold text-cosmic-gold">{userStats.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-cosmic-silver">Sessions This Month</p>
                    <p className="text-2xl font-bold text-cosmic-gold">{userStats.sessionsThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-cosmic-silver">Favorite Frequencies</p>
                    <p className="text-2xl font-bold text-cosmic-gold">{userStats.favoriteFrequencies}</p>
                  </div>
                </div>
              </div>

              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Recent Activity</h3>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <FaHistory className="text-cosmic-blue" aria-hidden="true" />
                    <span className="text-cosmic-silver">Last Session: {userStats.lastSession.toLocaleString()}</span>
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
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Daily Sessions</h3>
                <div className="flex justify-between mb-2">
                  <p className="text-cosmic-silver">Sessions Today</p>
                  <p className="font-bold text-cosmic-gold">{sessionUsage.current} / {sessionUsage.limit}</p>
                </div>
                <ProgressBar
                  percentage={(sessionUsage.current / Math.max(sessionUsage.limit, 1)) * 100}
                  color="purple"
                />
                {sessionUsage.limit > 0 && sessionUsage.current >= sessionUsage.limit && (
                  <div className="flex p-4 mt-4 space-x-4 border border-yellow-500 rounded-md bg-yellow-900/50">
                    <span className="text-xl text-yellow-500" aria-hidden="true">⚠️</span>
                    <p className="text-cosmic-silver">You&apos;ve reached your daily session limit. Upgrade your plan for unlimited sessions.</p>
                  </div>
                )}
              </div>

              {currentTier?.name === 'Free' && (
                <div className="cosmic-card p-4">
                  <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Session Duration</h3>
                  <div className="flex justify-between mb-2">
                    <p className="text-cosmic-silver">Max Duration</p>
                    <p className="font-bold text-cosmic-gold">20 minutes per session</p>
                  </div>
                  <ProgressBar
                    percentage={100}
                    color="blue"
                  />
                  <div className="flex p-4 mt-4 space-x-4 border border-blue-500 rounded-md bg-blue-900/50">
                    <span className="text-xl text-blue-500" aria-hidden="true">ℹ️</span>
                    <p className="text-cosmic-silver">Free plan includes 20-minute session limit. Upgrade for unlimited session length.</p>
                  </div>
                </div>
              )}
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
                </div>
              </div>

              <div className="cosmic-card p-4">
                <h3 className="mb-4 text-lg font-bold text-cosmic-gold">Audio Preferences</h3>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Audio Quality</span>
                    <span className="px-2 py-1 text-sm text-cosmic-purple rounded bg-cosmic-purple/20">
                      {currentTier?.name === 'Free' ? 'Standard' : 'High-Fidelity'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Offline Mode</span>
                    <span className={`px-2 py-1 text-sm rounded ${
                      currentTier?.name === 'Free' 
                        ? 'text-cosmic-silver bg-cosmic-silver/20' 
                        : 'text-green-500 bg-green-500/20'
                    }`}>
                      {currentTier?.name === 'Free' ? 'Not Available' : 'Available'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-cosmic-silver">Session Notifications</span>
                    <span className="px-2 py-1 text-sm text-green-500 rounded bg-green-500/20">Enabled</span>
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
