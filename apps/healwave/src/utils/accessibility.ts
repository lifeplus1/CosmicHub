/**
 * HealWave Enhanced Accessibility System
 * DEPRECATED: Use separate imports for better Fast Refresh support
 * @deprecated Use individual imports from './accessibility-hooks' and './accessibility-components'
 * 
 * This file provides backward compatibility by re-exporting all accessibility utilities.
 * Changed to .ts extension to resolve Fast Refresh compatibility issues.
 * Use explicit imports from individual modules for better development experience.
 */

// Re-export everything for backward compatibility with explicit exports
// Hooks and utilities
export {
  useAccessibility,
  useKeyboardNavigation,
  useFocusManagement,
  useFrequencyAnnouncements,
  srOnlyStyles
} from './accessibility-hooks';

// Types
export type {
  AccessibilitySettings,
  AccessibleButtonProps,
  AccessibleSliderProps
} from './accessibility-hooks';

// Components
export {
  AccessibilityLiveRegion,
  AccessibleButton,
  AccessibleSlider
} from './accessibility-components';

// Keep default export for existing code
export { useAccessibility as default } from './accessibility-hooks';
