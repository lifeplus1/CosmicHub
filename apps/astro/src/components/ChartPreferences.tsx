import React, { useState, useCallback } from 'react';
import { Card, Button } from '@cosmichub/ui';
import { useToast } from './ToastProvider';

interface ChartPreferencesData {
  chartStyle: 'western' | 'vedic';
  houseSystem: 'placidus' | 'whole-sign' | 'equal-house';
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
}

const ChartPreferences: React.FC = React.memo(() => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<ChartPreferencesData>({
    chartStyle: 'western',
    houseSystem: 'placidus',
    notifications: true,
    theme: 'dark',
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
        description: 'Preferences saved successfully',
        status: 'success'
      });
    } catch (error) {
      toast({
        description: 'Failed to save preferences',
        status: 'error'
      });
    }
  }, [preferences, toast]);

  return (
    <div className="space-y-6">
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
