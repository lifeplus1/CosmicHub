/**
 * Astrology Settings Panel Component
 * Professional astrology settings and display options
 * Following Type Bridge system with validation
 */

import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@cosmichub/ui';
import { 
  AstrologySettingsPanelPropsSchema,
  type AstrologySettingsPanelProps,
} from '../../schemas/chartDisplay';

/**
 * Astrology Settings Panel Component
 */
const AstrologySettingsPanel: React.FC<AstrologySettingsPanelProps> = memo(({
  isOpen,
  onToggle,
  settings,
  onSettingsChange,
  isUnifiedView = true,
  className = '',
}) => {
  const validatedProps = AstrologySettingsPanelPropsSchema.safeParse({
    isOpen,
    onToggle,
    settings,
    onSettingsChange,
    isUnifiedView,
    className,
  });

  // Move hooks to the top to avoid conditional hooks
  const handleDisplayOptionChange = useCallback((option: keyof typeof settings.displayOptions, value: boolean) => {
    onSettingsChange({
      ...settings,
      displayOptions: {
        ...settings.displayOptions,
        [option]: value,
      },
    });
  }, [settings, onSettingsChange]);

  const handleSystemChange = useCallback((system: string, value: string) => {
    onSettingsChange({
      ...settings,
      [system]: value,
    });
  }, [settings, onSettingsChange]);

  // Keyboard event handlers for accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  }, []);

  const handleCheckboxKeyDown = useCallback((e: React.KeyboardEvent, option: keyof typeof settings.displayOptions, currentValue: boolean) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDisplayOptionChange(option, !currentValue);
    }
  }, [handleDisplayOptionChange]);

  const handleRadioKeyDown = useCallback((e: React.KeyboardEvent, system: string, value: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSystemChange(system, value);
    }
  }, [handleSystemChange]);

  if (!validatedProps.success) {
    console.error('Invalid AstrologySettingsPanel props:', validatedProps.error);
    return null;
  }

  if (!isOpen) {
    return (
      <div className={`mb-6 ${className}`}>
        <Button
          onClick={onToggle}
          onKeyDown={(e) => handleKeyDown(e, onToggle)}
          className="bg-cosmic-purple/20 border-cosmic-purple/30 text-cosmic-silver hover:bg-cosmic-purple/30"
          data-testid="toggle-settings-button"
          aria-label="Toggle Chart Settings Panel"
        >
          ⚙️ Chart Settings
        </Button>
      </div>
    );
  }

  return (
    <Card className={`cosmic-glass border-cosmic-purple/30 mb-6 ${className}`}>
      <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30 flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
          ⚙️ Professional Astrology Settings
        </CardTitle>
        <Button
          onClick={onToggle}
          onKeyDown={(e) => handleKeyDown(e, onToggle)}
          variant="ghost"
          size="sm"
          className="text-cosmic-silver hover:text-cosmic-gold"
          data-testid="close-settings-button"
          aria-label="Close Settings Panel"
        >
          ✕
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Display Options */}
        <div>
          <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Display Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(settings.displayOptions).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleDisplayOptionChange(key as keyof typeof settings.displayOptions, e.target.checked)}
                  onKeyDown={(e) => handleCheckboxKeyDown(e, key as keyof typeof settings.displayOptions, value)}
                  className="rounded border-cosmic-purple/30 bg-cosmic-dark text-cosmic-gold focus:ring-cosmic-gold"
                  data-testid={`setting-${key}`}
                  aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^show\s?/, '')}`}
                />
                <span className="text-sm text-cosmic-silver capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^show\s?/, '')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* House System */}
        <div>
          <h3 className="text-lg font-semibold text-cosmic-gold mb-4">House System</h3>
          <select
            value={settings.houseSystem}
            onChange={(e) => handleSystemChange('houseSystem', e.target.value)}
            className="w-full p-2 bg-cosmic-dark border border-cosmic-purple/30 rounded text-cosmic-silver focus:border-cosmic-gold"
            data-testid="house-system-select"
            aria-label="House System Selection"
          >
            <option value="placidus">Placidus</option>
            <option value="koch">Koch</option>
            <option value="equal">Equal</option>
            <option value="whole_sign">Whole Sign</option>
          </select>
        </div>

        {/* Zodiac Type */}
        <div>
          <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Zodiac Type</h3>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="zodiacType"
                value="tropical"
                checked={settings.zodiacType === 'tropical'}
                onChange={(e) => handleSystemChange('zodiacType', e.target.value)}
                onKeyDown={(e) => handleRadioKeyDown(e, 'zodiacType', 'tropical')}
                className="text-cosmic-gold focus:ring-cosmic-gold"
                data-testid="zodiac-tropical"
                aria-label="Tropical Zodiac System"
              />
              <span className="text-cosmic-silver">Tropical</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="zodiacType"
                value="sidereal"
                checked={settings.zodiacType === 'sidereal'}
                onChange={(e) => handleSystemChange('zodiacType', e.target.value)}
                onKeyDown={(e) => handleRadioKeyDown(e, 'zodiacType', 'sidereal')}
                className="text-cosmic-gold focus:ring-cosmic-gold"
                data-testid="zodiac-sidereal"
                aria-label="Sidereal Zodiac System"
              />
              <span className="text-cosmic-silver">Sidereal</span>
            </label>
          </div>
        </div>

        {/* Coordinate System */}
        <div>
          <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Coordinate System</h3>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="coordinateSystem"
                value="geocentric"
                checked={settings.coordinateSystem === 'geocentric'}
                onChange={(e) => handleSystemChange('coordinateSystem', e.target.value)}
                onKeyDown={(e) => handleRadioKeyDown(e, 'coordinateSystem', 'geocentric')}
                className="text-cosmic-gold focus:ring-cosmic-gold"
                data-testid="coordinate-geocentric"
                aria-label="Geocentric Coordinate System"
              />
              <span className="text-cosmic-silver">Geocentric</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="coordinateSystem"
                value="heliocentric"
                checked={settings.coordinateSystem === 'heliocentric'}
                onChange={(e) => handleSystemChange('coordinateSystem', e.target.value)}
                onKeyDown={(e) => handleRadioKeyDown(e, 'coordinateSystem', 'heliocentric')}
                className="text-cosmic-gold focus:ring-cosmic-gold"
                data-testid="coordinate-heliocentric"
                aria-label="Heliocentric Coordinate System"
              />
              <span className="text-cosmic-silver">Heliocentric</span>
            </label>
          </div>
        </div>

        {/* View Mode Info */}
        {isUnifiedView && (
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/20 rounded-lg p-4">
            <h4 className="text-cosmic-gold font-medium mb-2">📊 Current View: Unified</h4>
            <p className="text-cosmic-silver text-sm">
              All chart elements are displayed in a single comprehensive table for integrated analysis.
            </p>
          </div>
        )}

        {!isUnifiedView && (
          <div className="bg-cosmic-purple/10 border border-cosmic-purple/20 rounded-lg p-4">
            <h4 className="text-cosmic-gold font-medium mb-2">📋 Current View: Separate Tables</h4>
            <p className="text-cosmic-silver text-sm">
              Chart elements are organized in individual tables for focused examination.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AstrologySettingsPanel.displayName = 'AstrologySettingsPanel';

export default AstrologySettingsPanel;
