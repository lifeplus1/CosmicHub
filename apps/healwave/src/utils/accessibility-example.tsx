/**
 * Example: Fast Refresh Compatible Accessibility Usage
 * 
 * This demonstrates the correct way to import and use the accessibility system
 * for optimal Fast Refresh performance.
 */

import React from 'react';

// ✅ CORRECT: Import hooks from separate file
import { 
  useAccessibility, 
  useFrequencyAnnouncements
} from './accessibility-hooks';

// ✅ CORRECT: Import components from separate file  
import {
  AccessibleButton,
  AccessibleSlider,
  AccessibilityLiveRegion
} from './accessibility-components';

// ✅ CORRECT: This file exports only components, so Fast Refresh works perfectly
export const ExampleAccessibilityDemo: React.FC = () => {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();
  const { announceFrequencyChange, liveRegionRef } = useFrequencyAnnouncements();
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Accessibility Demo</h2>
      
      {/* Live region for announcements */}
      <AccessibilityLiveRegion liveRegionRef={liveRegionRef} />
      
      {/* Accessible button example */}
      <AccessibleButton
        variant="primary"
        onClick={() => announceToScreenReader('Button clicked!')}
      >
        Click me
      </AccessibleButton>
      
      {/* Accessible slider example */}
      <AccessibleSlider
        label="Volume"
        value={75}
        onChange={(value) => announceFrequencyChange(value, 'Volume')}
        min={0}
        max={100}
        unit="%"
      />
      
      {/* Settings toggles */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
          />
          <span>Reduce motion</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(e) => updateSetting('highContrast', e.target.checked)}
          />
          <span>High contrast</span>
        </label>
      </div>
    </div>
  );
};

// ❌ WRONG: Don't mix components and utilities in the same file
// export const someUtilityFunction = () => { ... };

// ❌ WRONG: Don't export constants from component files  
// export const SOME_CONSTANT = 'value';
