/**
 * Centralized CSS Modules Export
 * 
 * This file provides easy access to all centralized CSS modules.
 * Import from here to use the centralized theme styles.
 */

// Component Modules
export { default as enhancedCardStyles } from './components/EnhancedCard.module.css';
export { default as durationTimerStyles } from './components/DurationTimer.module.css';
export { default as userProfileStyles } from './components/UserProfile.module.css';
export { default as progressBarStyles } from './components/ProgressBar.module.css';
export { default as virtualizedDataTableStyles } from './components/VirtualizedDataTable.module.css';
export { default as audioPlayerStyles } from './components/AudioPlayer.module.css';

// Feature Modules
export { default as chartWheelUnifiedStyles } from './features/ChartWheelUnified.module.css';

// Page Modules
export { default as aiInterpretationsStyles } from './pages/AIInterpretations.module.css';

// Test Modules
export { default as enhancedCardTestStyles } from './components/EnhancedCard.test.module.css';

// Type exports for better TypeScript support
export interface StylesModule {
  readonly [key: string]: string;
}
