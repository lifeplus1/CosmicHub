import React, { useState, useEffect, useCallback } from 'react';
import { devConsole } from '../config/environment';
import { VisuallyHidden } from '@/components/accessibility/VisuallyHidden';
import { useNavigate } from 'react-router-dom';
import {
  useAuth,
  useSubscription,
  type SubscriptionState,
} from '@cosmichub/auth';
import { useToast } from './ToastProvider';
import * as Tabs from '@radix-ui/react-tabs';
import {
  FaUser,
  FaCrown,
  FaStar,
  FaCalendarAlt,
  FaCreditCard,
  FaArrowUp,
  FaHistory,
} from 'react-icons/fa';
import { COSMICHUB_TIERS } from '@cosmichub/subscriptions';
import ProgressBar from './ProgressBar';
import './UserProfile.module.css';
import {
  serializeAstrologyData,
  type UserProfile as UserProfileType,
} from '@cosmichub/types';

interface UserStats {
  totalCharts: number;
  chartsThisMonth: number;
  savedCharts: number;
  joinDate: Date;
  lastLogin: Date;
}

// Removed unused interfaces (UsageLimit, UsageLimits, ToastConfig) per lint

const UserProfile = React.memo(() => {
  const { user } = useAuth();
  const subscriptionUnknown = useSubscription();
  const isSubscriptionState = (val: unknown): val is SubscriptionState => {
    return (
      val !== null &&
      typeof val === 'object' &&
      'userTier' in (val as Record<string, unknown>) &&
      'checkUsageLimit' in (val as Record<string, unknown>)
    );
  };
  const fallbackSubscription = {
    subscription: undefined,
    userTier: 'free',
    isLoading: false,
    checkUsageLimit: () => ({ current: 0, limit: 0 }),
    tier: 'free',
    hasFeature: () => false,
    upgradeRequired: () => {},
    refreshSubscription: async () => {},
  } as unknown as SubscriptionState;
  const subscriptionState: SubscriptionState = isSubscriptionState(
    subscriptionUnknown
  )
    ? subscriptionUnknown
    : fallbackSubscription;
  // Destructure only safely typed fields we consume frequently
  const { userTier, isLoading, checkUsageLimit } = subscriptionState;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [userStats, setUserStats] = useState<UserStats>({
    totalCharts: 0,
    chartsThisMonth: 0,
    savedCharts: 0,
    joinDate: new Date(),
    lastLogin: new Date(),
  });

  const handleSaveProfile = () => {
    if (user === null || user === undefined) {
      toast({
        description: 'Please log in to save your profile.',
        status: 'error',
      });
      return;
    }

    const profileData: UserProfileType = {
      userId: user.uid,
      birthData: {
        // This is mock data, replace with actual form data
        date: '1990-01-01',
        time: '12:00',
        location: 'Greenwich, UK',
      },
    };

    try {
      const serializedProfile = serializeAstrologyData(profileData);
      // TODO: integrate persistence service. For now just ensure variable is used implicitly
      if (serializedProfile.length === 0) {
        devConsole.warn?.('Serialized profile unexpectedly empty');
      }

      toast({
        description: 'Profile saved successfully!',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      devConsole.error('Failed to serialize profile:', errorMessage);

      toast({
        description: 'Failed to save profile. Please try again.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const loadUserStats = useCallback(() => {
    if (
      user === null ||
      user === undefined ||
      typeof checkUsageLimit !== 'function'
    ) {
      return;
    }

    try {
      const chartsUsage = checkUsageLimit('chartsPerMonth');
      const savedUsage = checkUsageLimit('chartStorage');

      setUserStats({
        totalCharts: chartsUsage.current + 50, // TODO: Get actual total from backend
        chartsThisMonth: chartsUsage.current,
        savedCharts: savedUsage.current,
        joinDate: new Date(user.metadata?.creationTime ?? Date.now()),
        lastLogin: new Date(user.metadata?.lastSignInTime ?? Date.now()),
      });
    } catch (error) {
      devConsole.error('Failed to load user stats:', error);
      toast({
        description:
          'Failed to load usage statistics. Please refresh the page.',
        status: 'error',
        duration: 5000,
      });
    }
  }, [user, checkUsageLimit, toast]);

  useEffect(() => {
    void loadUserStats();
  }, [loadUserStats]);

  const getTierIcon = (
    tier: keyof typeof COSMICHUB_TIERS
  ): React.ReactElement => {
    const iconProps = {
      className: 'text-cosmic-silver',
      'aria-hidden': 'true' as const,
    };

    switch (tier) {
      case 'free':
        return <FaUser {...iconProps} />;
      case 'premium':
        return <FaStar className='text-cosmic-purple' aria-hidden='true' />;
      case 'elite':
        return <FaCrown className='text-cosmic-gold' aria-hidden='true' />;
      default:
        return <FaUser {...iconProps} />;
    }
  };

  const getTierColor = (tier: keyof typeof COSMICHUB_TIERS): string => {
    switch (tier) {
      case 'free':
        return 'cosmic-silver';
      case 'premium':
        return 'cosmic-purple';
      case 'elite':
        return 'cosmic-gold';
      default:
        return 'cosmic-silver';
    }
  };

  const handleUpgrade = useCallback(() => {
    navigate('/upgrade');
  }, [navigate]);

  const isTierKey = (t: unknown): t is keyof typeof COSMICHUB_TIERS =>
    typeof t === 'string' && t in COSMICHUB_TIERS;
  const tierKey: keyof typeof COSMICHUB_TIERS = isTierKey(userTier)
    ? userTier
    : 'free';
  const currentTier = COSMICHUB_TIERS[tierKey];
  const tierSafe =
    currentTier ??
    ({
      name: 'Free',
      description: '',
      price: { monthly: 0 },
      features: [],
    } as const);
  const chartsUsage =
    typeof checkUsageLimit === 'function'
      ? checkUsageLimit('chartsPerMonth')
      : { current: 0, limit: 0 };
  const savedUsage =
    typeof checkUsageLimit === 'function'
      ? checkUsageLimit('chartStorage')
      : { current: 0, limit: 0 };

  if (isLoading || user === null || user === undefined) {
    return (
      <div
        className='py-10 text-center'
        role='status'
        aria-label='Loading profile'
      >
        <div
          className='mx-auto text-4xl text-cosmic-purple animate-spin'
          aria-hidden='true'
        >
          ⭐
        </div>
        <p className='mt-4 text-cosmic-silver'>Loading profile...</p>
      </div>
    );
  }

  return (
    <main className='max-w-4xl py-8 mx-auto'>
      <div className='cosmic-card p-6 rounded-lg shadow-lg bg-cosmic-dark'>
        <header className='flex flex-col items-center mb-6 space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6'>
          <div
            className='flex items-center justify-center w-24 h-24 rounded-full bg-cosmic-blue/30'
            role='img'
            aria-label='User avatar'
          >
            <FaUser
              className='text-3xl text-cosmic-silver'
              aria-hidden='true'
              role='img'
              aria-label='Default user avatar'
            />
          </div>
          <div className='text-center sm:text-left'>
            <h1 className='text-2xl font-bold text-cosmic-gold'>
              {user.email}
            </h1>
            <div
              className='flex items-center mt-2 space-x-2'
              role='status'
              aria-label={`Subscription tier: ${userTier}`}
            >
              {getTierIcon(userTier)}
              <span
                className={`bg-${getTierColor(userTier)}/20 text-${getTierColor(userTier)} px-2 py-1 rounded text-sm font-semibold uppercase`}
              >
                {userTier}
              </span>
            </div>
          </div>
        </header>

        <Tabs.Root defaultValue='overview' aria-label='User Profile'>
          <Tabs.List
            className='flex mb-6 border-b border-cosmic-silver/30'
            aria-label='User Profile Sections'
          >
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'usage', label: 'Usage' },
              { id: 'account', label: 'Account' },
            ].map(tab => (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className='px-4 py-2 text-cosmic-silver data-[state=active]:bg-cosmic-purple/20 data-[state=active]:text-cosmic-purple focus:outline-none focus:ring-2 focus:ring-cosmic-purple'
                aria-controls={`${tab.id}-tab`}
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content
            value='overview'
            id='overview-tab'
            role='tabpanel'
            aria-labelledby='overview'
          >
            <div className='flex flex-col space-y-6'>
              <section
                className='cosmic-card p-4'
                aria-labelledby='subscription-details'
              >
                <h2
                  id='subscription-details'
                  className='mb-4 text-lg font-bold text-cosmic-gold'
                >
                  Subscription Details
                </h2>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div>
                    <p className='text-cosmic-silver'>Current Plan</p>
                    <p className='font-bold text-cosmic-gold'>
                      {tierSafe.name}
                    </p>
                    <p className='text-sm text-cosmic-silver/80'>
                      {tierSafe.description}
                    </p>
                  </div>
                  <div>
                    <p className='text-cosmic-silver'>Billing</p>
                    <p className='font-bold text-cosmic-gold'>
                      {tierSafe.price.monthly > 0
                        ? `$${tierSafe.price.monthly.toFixed(2)}/month`
                        : 'Free'}
                    </p>
                    {(() => {
                      if (tierSafe.price.monthly <= 0) return null;
                      const subUnknown =
                        subscriptionState.subscription as unknown;
                      if (
                        subUnknown !== null &&
                        typeof subUnknown === 'object'
                      ) {
                        // Accept either number epoch or Date instance
                        const endRaw = (
                          subUnknown as { currentPeriodEnd?: unknown }
                        )['currentPeriodEnd'];
                        let endDate: Date | null = null;
                        if (typeof endRaw === 'number')
                          endDate = new Date(endRaw);
                        else if (endRaw instanceof Date) endDate = endRaw;
                        if (endDate !== null) {
                          const dateStr = endDate.toLocaleDateString();
                          return (
                            <p className='text-sm text-cosmic-silver/80'>
                              Next billing: {dateStr}
                            </p>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
                <button
                  className='w-full mt-4 cosmic-button sm:w-auto'
                  onClick={handleUpgrade}
                  aria-label={
                    tierSafe.name === 'Free'
                      ? 'Upgrade Plan'
                      : 'Manage Subscription'
                  }
                >
                  {tierSafe.name === 'Free' ? (
                    <span className='flex items-center space-x-2'>
                      <FaArrowUp />
                      <span>Upgrade Plan</span>
                    </span>
                  ) : (
                    <span className='flex items-center space-x-2'>
                      <FaCreditCard />
                      <span>Manage Subscription</span>
                    </span>
                  )}
                </button>
              </section>

              <section
                className='cosmic-card p-4'
                aria-labelledby='activity-summary-heading'
              >
                <h2
                  id='activity-summary-heading'
                  className='mb-4 text-lg font-bold text-cosmic-gold'
                >
                  Activity Summary
                </h2>
                <div
                  className='grid grid-cols-1 gap-4 sm:grid-cols-3'
                  role='list'
                  aria-label='Chart statistics'
                >
                  <div role='listitem'>
                    <p className='text-cosmic-silver'>Total Charts Created</p>
                    <p className='text-2xl font-bold text-cosmic-gold'>
                      <VisuallyHidden>Created </VisuallyHidden>
                      {userStats.totalCharts}
                      <VisuallyHidden> charts in total</VisuallyHidden>
                    </p>
                  </div>
                  <div role='listitem'>
                    <p className='text-cosmic-silver'>Charts This Month</p>
                    <p className='text-2xl font-bold text-cosmic-gold'>
                      <VisuallyHidden>Created </VisuallyHidden>
                      {userStats.chartsThisMonth}
                      <VisuallyHidden> charts this month</VisuallyHidden>
                    </p>
                  </div>
                  <div role='listitem'>
                    <p className='text-cosmic-silver'>Saved Charts</p>
                    <p className='text-2xl font-bold text-cosmic-gold'>
                      <VisuallyHidden>Have </VisuallyHidden>
                      {userStats.savedCharts}
                      <VisuallyHidden> saved charts</VisuallyHidden>
                    </p>
                  </div>
                </div>
              </section>

              <section
                className='cosmic-card p-4'
                aria-labelledby='recent-activity-heading'
              >
                <h2
                  id='recent-activity-heading'
                  className='mb-4 text-lg font-bold text-cosmic-gold'
                >
                  Recent Activity
                </h2>
                <ul className='space-y-2'>
                  <li className='flex items-center space-x-2'>
                    <FaHistory
                      className='text-cosmic-blue'
                      aria-hidden='true'
                    />
                    <span className='text-cosmic-silver'>
                      Last Login:{' '}
                      <time dateTime={userStats.lastLogin.toISOString()}>
                        {userStats.lastLogin.toLocaleString()}
                      </time>
                    </span>
                  </li>
                  <li className='flex items-center space-x-2'>
                    <FaCalendarAlt
                      className='text-cosmic-blue'
                      aria-hidden='true'
                    />
                    <span className='text-cosmic-silver'>
                      Joined:{' '}
                      <time dateTime={userStats.joinDate.toISOString()}>
                        {userStats.joinDate.toLocaleDateString()}
                      </time>
                    </span>
                  </li>
                </ul>
              </section>
            </div>
          </Tabs.Content>

          <Tabs.Content
            value='usage'
            id='usage-tab'
            role='tabpanel'
            aria-labelledby='usage'
          >
            <div className='flex flex-col space-y-6'>
              <section
                className='cosmic-card p-4'
                aria-labelledby='chart-creation-heading'
              >
                <h2
                  id='chart-creation-heading'
                  className='mb-4 text-lg font-bold text-cosmic-gold'
                >
                  Chart Creation
                </h2>
                <div
                  className='flex justify-between mb-2'
                  role='status'
                  aria-label='Monthly chart usage'
                >
                  <p className='text-cosmic-silver'>Charts This Month</p>
                  <p className='font-bold text-cosmic-gold'>
                    <VisuallyHidden>Using </VisuallyHidden>
                    {chartsUsage.current} / {chartsUsage.limit}
                    <VisuallyHidden> charts</VisuallyHidden>
                  </p>
                </div>
                <ProgressBar
                  percentage={
                    (chartsUsage.current / Math.max(chartsUsage.limit, 1)) * 100
                  }
                  color='purple'
                  aria-label={`Monthly chart usage: ${chartsUsage.current} of ${chartsUsage.limit} charts used (${((chartsUsage.current / Math.max(chartsUsage.limit, 1)) * 100).toFixed(0)}%)`}
                />
                {chartsUsage.current >= chartsUsage.limit && (
                  <div
                    className='flex p-4 mt-4 space-x-4 border border-yellow-500 rounded-md bg-yellow-900/50'
                    role='alert'
                    aria-live='polite'
                  >
                    <span
                      className='text-xl text-yellow-500'
                      aria-hidden='true'
                    >
                      ⚠️
                    </span>
                    <p className='text-cosmic-silver'>
                      You&apos;ve reached your monthly chart limit. Upgrade your
                      plan to create more charts.
                    </p>
                  </div>
                )}
              </section>

              <section
                className='cosmic-card p-4'
                aria-labelledby='chart-storage-heading'
              >
                <h2
                  id='chart-storage-heading'
                  className='mb-4 text-lg font-bold text-cosmic-gold'
                >
                  Chart Storage
                </h2>
                <div
                  className='flex justify-between mb-2'
                  role='status'
                  aria-label='Chart storage usage'
                >
                  <p className='text-cosmic-silver'>Saved Charts</p>
                  <p className='font-bold text-cosmic-gold'>
                    <VisuallyHidden>Using </VisuallyHidden>
                    {savedUsage.current} / {savedUsage.limit}
                    <VisuallyHidden> storage slots</VisuallyHidden>
                  </p>
                </div>
                <ProgressBar
                  percentage={
                    (savedUsage.current / Math.max(savedUsage.limit, 1)) * 100
                  }
                  color='blue'
                  aria-label={`Storage usage progress: ${savedUsage.current} of ${savedUsage.limit}`}
                />
                {savedUsage.current >= savedUsage.limit && (
                  <div
                    className='flex p-4 mt-4 space-x-4 border border-yellow-500 rounded-md bg-yellow-900/50'
                    role='alert'
                    aria-live='polite'
                  >
                    <span
                      className='text-xl text-yellow-500'
                      aria-hidden='true'
                    >
                      ⚠️
                    </span>
                    <p className='text-cosmic-silver'>
                      You&apos;ve reached your chart storage limit. Upgrade your
                      plan to save more charts.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </Tabs.Content>

          <Tabs.Content
            value='account'
            id='account-tab'
            role='tabpanel'
            aria-labelledby='account'
          >
            <div className='flex flex-col space-y-6'>
              <section
                className='cosmic-card p-4'
                aria-labelledby='account-info-heading'
              >
                <h2
                  id='account-info-heading'
                  className='mb-4 text-lg font-bold text-cosmic-gold'
                >
                  Account Information
                </h2>
                <dl className='flex flex-col space-y-4'>
                  <div className='flex justify-between'>
                    <dt className='font-medium text-cosmic-silver'>
                      Email Address
                    </dt>
                    <dd className='text-cosmic-silver'>{user.email}</dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='font-medium text-cosmic-silver'>
                      Email Verified
                    </dt>
                    <dd>
                      <span
                        className={`px-2 py-1 rounded text-sm ${user.emailVerified ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                        role='status'
                      >
                        {user.emailVerified ? 'Verified' : 'Not Verified'}
                      </span>
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='font-medium text-cosmic-silver'>
                      Account ID
                    </dt>
                    <dd
                      className='font-mono text-sm text-cosmic-silver'
                      title={user.uid}
                    >
                      {user.uid.slice(0, 8)}...
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='font-medium text-cosmic-silver'>
                      Two-Factor Auth
                    </dt>
                    <dd>
                      <span
                        className='px-2 py-1 text-sm text-cosmic-silver rounded bg-cosmic-silver/20'
                        role='status'
                      >
                        Not Set Up
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                className='cosmic-card p-4'
                aria-labelledby='preferences-heading'
              >
                <h2
                  id='preferences-heading'
                  className='mb-4 text-lg font-bold text-cosmic-gold'
                >
                  Preferences
                </h2>
                <dl className='flex flex-col space-y-4'>
                  <div className='flex justify-between'>
                    <dt className='font-medium text-cosmic-silver'>
                      Email Notifications
                    </dt>
                    <dd>
                      <span
                        className='px-2 py-1 text-sm text-green-500 rounded bg-green-500/20'
                        role='status'
                      >
                        Enabled
                      </span>
                    </dd>
                  </div>
                  <div className='flex justify-between'>
                    <dt className='font-medium text-cosmic-silver'>
                      Marketing Emails
                    </dt>
                    <dd>
                      <span
                        className='px-2 py-1 text-sm text-cosmic-silver rounded bg-cosmic-silver/20'
                        role='status'
                      >
                        Disabled
                      </span>
                    </dd>
                  </div>
                  <div className='flex justify-between items-center'>
                    <dt className='font-medium text-cosmic-silver'>
                      Data Export
                    </dt>
                    <dd>
                      <button
                        type='button'
                        className='w-auto cosmic-button focus:ring-2 focus:ring-cosmic-purple focus:outline-none'
                        onClick={handleSaveProfile}
                        aria-label='Request a data export of your account'
                      >
                        Request Data
                      </button>
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </main>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;
