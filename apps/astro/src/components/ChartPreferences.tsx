import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button } from '@cosmichub/ui';
import { useToast } from './ToastProvider';
import { useAuth } from '@cosmichub/auth';
import { db } from '@cosmichub/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { componentLogger } from '../utils/componentLogger';

import {
  type ChartStyle,
  type HouseSystem,
  type ThemeOption,
  type ChartPreferencesData,
  isChartPreferencesData,
  DEFAULT_PREFERENCES,
} from '../types/preferences';

// Stable user id validator extracted outside component so it isn't recreated each render
const isValidUserId = (userId: unknown): userId is string =>
  typeof userId === 'string' && userId.length > 0;

export interface ChartPreferencesProps {
  /** Optional override to preload preferences (primarily for Storybook / tests) */
  initialPreferences?: ChartPreferencesData;
  /** Called after successful save (for external analytics) */
  onSaved?: (prefs: ChartPreferencesData) => void;
}

const ChartPreferences: React.FC<ChartPreferencesProps> =
  function ChartPreferences({ initialPreferences, onSaved }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<ChartPreferencesData>(
      initialPreferences ?? DEFAULT_PREFERENCES
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

    // Derived stable user id & flags
    const userId = user?.uid;
    const hasValidUserId =
      userId !== undefined &&
      userId !== null &&
      typeof userId === 'string' &&
      userId.length > 0;
    const saveAriaLabel =
      isLoading === true
        ? 'Saving preferences'
        : hasValidUserId === true
          ? 'Save preferences'
          : 'Sign in to save preferences';
    const saveButtonDisabled = hasValidUserId === false || isLoading === true;

    const loadUserPreferences = useCallback(async (): Promise<void> => {
      const currentUid = user?.uid;
      if (!isValidUserId(currentUid)) {
        return;
      }

      try {
        setIsLoadingPreferences(true);
        if (currentUid === undefined || currentUid === null) {
          return;
        }
        const userDocRef = doc(db, 'users', currentUid);
        const userDoc = await getDoc(userDocRef);

        const isValidUserData = (
          data: unknown
        ): data is { chartPreferences: ChartPreferencesData } => {
          if (data === null || data === undefined || typeof data !== 'object')
            return false;
          const obj = data as { chartPreferences?: unknown };
          return (
            'chartPreferences' in obj &&
            obj.chartPreferences !== null &&
            obj.chartPreferences !== undefined &&
            isChartPreferencesData(obj.chartPreferences)
          );
        };

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (isValidUserData(userData)) {
            setPreferences(userData.chartPreferences);
          } else {
            componentLogger.warn(
              'ChartPreferences',
              'Invalid preferences data in Firestore',
              (userData as Record<string, unknown>)?.['chartPreferences']
            );
            setPreferences(DEFAULT_PREFERENCES);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load user preferences';

        componentLogger.error('ChartPreferences', errorMessage, error);
        toast({
          description: errorMessage,
          status: 'error',
        });
      } finally {
        setIsLoadingPreferences(false);
      }
      // NOTE: deps explanation:
      // userId: drives Firestore path & validity checks (derived above for stability)
      // toast: stable from provider; included for clarity (fires notifications on errors)
      // db/doc/getDoc imported functions are stable and excluded.
    }, [toast, user?.uid]);

    // Load user preferences on mount
    useEffect(() => {
      const userId = user?.uid;
      // Explicit check for userId existence and validity
      if (
        userId === null ||
        userId === undefined ||
        typeof userId !== 'string' ||
        userId.length === 0
      ) {
        setIsLoadingPreferences(false);
        return;
      }

      // Create an abort controller to handle cleanup
      const abortController = new AbortController();

      // Wrap async operation
      const loadPrefs = async () => {
        try {
          await loadUserPreferences();
        } catch (error) {
          // Only handle error if not aborted
          if (!abortController.signal.aborted) {
            componentLogger.error(
              'ChartPreferences',
              'Failed to load preferences on mount',
              error
            );
          }
        }
      };

      void loadPrefs();

      // Cleanup function
      return () => {
        abortController.abort();
      };
      // deps: userId (drives whether to attempt load) + loadUserPreferences (async loader)
    }, [loadUserPreferences, user?.uid]);

    const handlePreferenceChange = useCallback(
      <K extends keyof ChartPreferencesData>(
        key: K,
        value: ChartPreferencesData[K]
      ): void => {
        setPreferences(prev => ({
          ...prev,
          [key]: value,
        }));
        // deps: none (pure state updater using functional set)
      },
      []
    );

    const handleSavePreferences = useCallback(async (): Promise<void> => {
      const userId = user?.uid;
      // Explicit validation of userId with type guard
      if (
        userId === null ||
        userId === undefined ||
        typeof userId !== 'string' ||
        userId.length === 0
      ) {
        toast({
          description: 'You must be logged in to save preferences',
          status: 'error',
        });
        return;
      }

      try {
        setIsLoading(true);

        // Save preferences to Firestore
        const userDocRef = doc(db, 'users', userId);
        await setDoc(
          userDocRef,
          {
            chartPreferences: preferences,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        toast({
          description: 'Preferences saved successfully',
          status: 'success',
        });
      } catch (error) {
        // Default error message
        let errorMessage = 'Failed to save preferences. Please try again.';

        // Error instance with message
        if (
          error instanceof Error &&
          error.message !== undefined &&
          error.message !== null &&
          error.message.length > 0
        ) {
          errorMessage = error.message;
        }
        // String error
        else if (typeof error === 'string' && error.length > 0) {
          errorMessage = error;
        }
        // Unknown error type - use default message but log full error
        else if (error !== null && error !== undefined) {
          componentLogger.warn(
            'ChartPreferences',
            'Received non-standard error type',
            { error }
          );
        }

        componentLogger.error(
          'ChartPreferences',
          'Failed to save preferences',
          { error, preferences }
        );
        toast({
          description: errorMessage,
          status: 'error',
        });
      } finally {
        setIsLoading(false);
      }
      if (onSaved !== undefined && onSaved !== null) {
        onSaved(preferences);
      }
      // deps: preferences (data saved), userId (path), toast (notifications), onSaved (callback)
    }, [preferences, toast, onSaved, user?.uid]);

    return (
      <div
        className='space-y-6'
        aria-live='polite'
        role='form'
        aria-labelledby='chart-prefs-heading'
      >
        <h2 id='chart-prefs-heading' className='sr-only'>
          Chart Preferences
        </h2>
        {isLoadingPreferences ? (
          <Card title='Chart Preferences' aria-busy='true'>
            <div
              className='flex items-center justify-center py-8'
              role='status'
              aria-label='Loading user chart preferences'
            >
              <div className='text-cosmic-silver'>Loading preferences…</div>
            </div>
          </Card>
        ) : (
          <Card title='Chart Preferences'>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='chartStyle'
                  className='block text-cosmic-silver mb-2'
                >
                  Chart Style
                </label>
                <select
                  id='chartStyle'
                  value={preferences.chartStyle}
                  onChange={e =>
                    handlePreferenceChange(
                      'chartStyle',
                      e.target.value as ChartStyle
                    )
                  }
                  className='w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver'
                  aria-label='Select chart style'
                >
                  <option value='western'>Western Tropical</option>
                  <option value='vedic'>Vedic Sidereal</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='houseSystem'
                  className='block text-cosmic-silver mb-2'
                >
                  House System
                </label>
                <select
                  id='houseSystem'
                  value={preferences.houseSystem}
                  onChange={e =>
                    handlePreferenceChange(
                      'houseSystem',
                      e.target.value as HouseSystem
                    )
                  }
                  className='w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver'
                  aria-label='Select house system'
                >
                  <option value='placidus'>Placidus</option>
                  <option value='whole-sign'>Whole Sign</option>
                  <option value='equal-house'>Equal House</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor='theme'
                  className='block text-cosmic-silver mb-2'
                >
                  Theme
                </label>
                <select
                  id='theme'
                  value={preferences.theme}
                  onChange={e =>
                    handlePreferenceChange(
                      'theme',
                      e.target.value as ThemeOption
                    )
                  }
                  className='w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver'
                  aria-label='Select theme'
                >
                  <option value='dark'>Dark</option>
                  <option value='light'>Light</option>
                  <option value='auto'>Auto</option>
                </select>
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='notifications'
                  checked={preferences.notifications}
                  onChange={e =>
                    handlePreferenceChange('notifications', e.target.checked)
                  }
                  className='rounded'
                  aria-describedby='notifications-hint'
                />
                <label htmlFor='notifications' className='text-cosmic-silver'>
                  Email notifications
                </label>
                <span id='notifications-hint' className='sr-only'>
                  Enable or disable email notification features
                </span>
              </div>
            </div>
          </Card>
        )}

        <div className='text-center'>
          <Button
            onClick={() => {
              void handleSavePreferences();
            }}
            variant='primary'
            disabled={saveButtonDisabled}
            aria-disabled={saveButtonDisabled}
            aria-busy={isLoading}
            aria-label={saveAriaLabel}
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    );
  };

export default ChartPreferences;
