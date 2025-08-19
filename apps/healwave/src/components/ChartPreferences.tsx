import React, { useState, useCallback, useEffect } from 'react';
/* eslint-disable no-console */
const devConsole = {
  log: import.meta.env.DEV ? console.log.bind(console) : undefined,
  warn: import.meta.env.DEV ? console.warn.bind(console) : undefined,
  error: console.error.bind(console)
};
/* eslint-enable no-console */
import { Card, Button } from '@cosmichub/ui';
import { useToast } from './ToastProvider';
import { useAuth } from '@cosmichub/auth';
import { db } from '@cosmichub/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface ChartPreferencesData {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  sessionReminders: boolean;
  audioQuality: 'standard' | 'high' | 'lossless';
}

const ChartPreferences: React.FC = React.memo(() => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ChartPreferencesData>({
    theme: 'dark',
    notifications: true,
    sessionReminders: true,
    audioQuality: 'high',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  // Load user preferences on mount
  useEffect(() => {
    if (user?.uid) {
      loadUserPreferences();
    } else {
      setIsLoadingPreferences(false);
    }
  }, [user?.uid]);

  const loadUserPreferences = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoadingPreferences(true);
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.healwavePreferences) {
          setPreferences(prev => ({
            ...prev,
            ...userData.healwavePreferences
          }));
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
  devConsole.error('Failed to load user preferences:', error);
      toast({
        message: 'Failed to load your preferences',
        type: 'error'
      });
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [user?.uid, toast]);

  const handlePreferenceChange = useCallback((key: keyof ChartPreferencesData, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleSavePreferences = useCallback(async () => {
    if (!user?.uid) {
      toast({
        message: 'You must be logged in to save preferences',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Save preferences to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        healwavePreferences: preferences,
        updatedAt: new Date()
      }, { merge: true });

      toast({
        message: 'Preferences saved successfully',
        type: 'success'
      });
    } catch (error) {
      // eslint-disable-next-line no-console
  devConsole.error('Failed to save preferences:', error);
      toast({
        message: 'Failed to save preferences',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, preferences, toast]);

  return (
    <div className="space-y-6">
      <Card title="HealWave Preferences">
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-cosmic-silver mb-2">
              Theme
            </label>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => handlePreferenceChange('theme', e.target.value)}
              className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
              aria-label="Select theme"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label htmlFor="audioQuality" className="block text-cosmic-silver mb-2">
              Audio Quality
            </label>
            <select
              id="audioQuality"
              value={preferences.audioQuality}
              onChange={(e) => handlePreferenceChange('audioQuality', e.target.value)}
              className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
              aria-label="Select audio quality"
            >
              <option value="standard">Standard (128kbps)</option>
              <option value="high">High (256kbps)</option>
              <option value="lossless">Lossless (FLAC)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="notifications"
              checked={preferences.notifications}
              onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="notifications" className="text-cosmic-silver">
              Email notifications
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sessionReminders"
              checked={preferences.sessionReminders}
              onChange={(e) => handlePreferenceChange('sessionReminders', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="sessionReminders" className="text-cosmic-silver">
              Session reminders
            </label>
          </div>
        </div>
      </Card>

      <div className="text-center">
        <Button 
          onClick={handleSavePreferences} 
          variant="primary"
          disabled={isLoading || isLoadingPreferences || !user}
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
        {isLoadingPreferences && (
          <p className="mt-2 text-sm text-cosmic-silver/70">Loading your preferences...</p>
        )}
        {!user && (
          <p className="mt-2 text-sm text-cosmic-silver/70">Sign in to save preferences</p>
        )}
      </div>
    </div>
  );
});

ChartPreferences.displayName = 'ChartPreferences';

export default ChartPreferences;
