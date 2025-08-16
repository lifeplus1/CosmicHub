import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button } from '@cosmichub/ui';
import { useToast } from './ToastProvider';
import { useAuth } from '@cosmichub/auth';
import { db } from '@cosmichub/config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface ChartPreferencesData {
  chartStyle: 'western' | 'vedic';
  houseSystem: 'placidus' | 'whole-sign' | 'equal-house';
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

const ChartPreferences: React.FC = React.memo(() => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<ChartPreferencesData>({
    chartStyle: 'western',
    houseSystem: 'placidus',
    notifications: true,
    theme: 'dark',
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
        if (userData.chartPreferences) {
          setPreferences(prev => ({
            ...prev,
            ...userData.chartPreferences
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      toast({
        description: 'Failed to load your preferences',
        status: 'error'
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
        description: 'You must be logged in to save preferences',
        status: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Save preferences to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        chartPreferences: preferences,
        updatedAt: new Date()
      }, { merge: true });

      toast({
        description: 'Preferences saved successfully',
        status: 'success'
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        description: 'Failed to save preferences. Please try again.',
        status: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [preferences, user?.uid, toast]);

  return (
    <div className="space-y-6">
      {isLoadingPreferences ? (
        <Card title="Chart Preferences">
          <div className="flex items-center justify-center py-8">
            <div className="text-cosmic-silver">Loading preferences...</div>
          </div>
        </Card>
      ) : (
        <Card title="Chart Preferences">
          <div className="space-y-4">
          <div>
            <label htmlFor="chartStyle" className="block text-cosmic-silver mb-2">
              Chart Style
            </label>
            <select
              id="chartStyle"
              value={preferences.chartStyle}
              onChange={(e) => handlePreferenceChange('chartStyle', e.target.value)}
              className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
              aria-label="Select chart style"
            >
              <option value="western">Western Tropical</option>
              <option value="vedic">Vedic Sidereal</option>
            </select>
          </div>

          <div>
            <label htmlFor="houseSystem" className="block text-cosmic-silver mb-2">
              House System
            </label>
            <select
              id="houseSystem"
              value={preferences.houseSystem}
              onChange={(e) => handlePreferenceChange('houseSystem', e.target.value)}
              className="w-full p-2 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
              aria-label="Select house system"
            >
              <option value="placidus">Placidus</option>
              <option value="whole-sign">Whole Sign</option>
              <option value="equal-house">Equal House</option>
            </select>
          </div>

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
          </div>
        </Card>
      )}

      <div className="text-center">
        <Button 
          onClick={handleSavePreferences} 
          variant="primary"
          disabled={isLoading || !user}
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
});

ChartPreferences.displayName = 'ChartPreferences';

export default ChartPreferences;
