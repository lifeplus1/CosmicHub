import React, { useState, useCallback } from 'react';
import { Card, Button } from '@cosmichub/ui';
import { useToast } from './ToastProvider';

interface ChartPreferencesData {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  sessionReminders: boolean;
  audioQuality: 'standard' | 'high' | 'lossless';
}

const ChartPreferences: React.FC = React.memo(() => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<ChartPreferencesData>({
    theme: 'dark',
    notifications: true,
    sessionReminders: true,
    audioQuality: 'high',
  });

  const handlePreferenceChange = useCallback((key: keyof ChartPreferencesData, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleSavePreferences = useCallback(async () => {
    try {
      // TODO: Save to backend/Firestore
      toast({
        message: 'Preferences saved successfully',
        type: 'success'
      });
    } catch {
      toast({
        message: 'Failed to save preferences',
        type: 'error'
      });
    }
  }, [preferences, toast]);

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
        <Button onClick={handleSavePreferences} variant="primary">
          Save Preferences
        </Button>
      </div>
    </div>
  );
});

ChartPreferences.displayName = 'ChartPreferences';

export default ChartPreferences;
