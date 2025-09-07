/**
 * View Toggle Controls Component
 * Unified vs Separate table view toggle
 * Following Type Bridge system with validation
 */

import React, { memo, useCallback } from 'react';
import { Button } from '@cosmichub/ui';
import { 
  ViewToggleControlsPropsSchema,
  type ViewToggleControlsProps,
} from '../../schemas/chartDisplay';

/**
 * View Toggle Controls Component
 */
const ViewToggleControls: React.FC<ViewToggleControlsProps> = memo(function ViewToggleControls({
  useUnifiedView,
  onToggle,
  disabled = false,
  className = '',
}) {
  // Memoized handlers (must be called before conditional returns)
  const handleToggleToUnified = useCallback(() => {
    if (!useUnifiedView) {
      onToggle();
    }
  }, [useUnifiedView, onToggle]);

  const handleToggleToSeparate = useCallback(() => {
    if (useUnifiedView) {
      onToggle();
    }
  }, [useUnifiedView, onToggle]);

  const handleUnifiedKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleToUnified();
    }
  }, [handleToggleToUnified]);

  const handleSeparateKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleToSeparate();
    }
  }, [handleToggleToSeparate]);

  // Validate props
  const validatedProps = ViewToggleControlsPropsSchema.safeParse({
    useUnifiedView,
    onToggle,
    disabled,
    className,
  });

  if (!validatedProps.success) {
    console.error('Invalid ViewToggleControls props:', validatedProps.error);
    return null;
  }

  return (
    <div className={`flex justify-center mb-6 ${className}`}>
      <div 
        className="bg-cosmic-purple/20 rounded-lg p-1 border border-cosmic-purple/30"
        role="group" 
        aria-label="Chart view selection"
      >
        <Button
          onClick={handleToggleToUnified}
          onKeyDown={handleUnifiedKeyDown}
          disabled={disabled}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 ${
            useUnifiedView
              ? 'bg-cosmic-gold text-cosmic-dark shadow-md'
              : 'text-cosmic-silver hover:text-cosmic-gold'
          }`}
          data-testid="unified-view-button"
          aria-pressed={useUnifiedView}
          aria-label="Switch to unified chart view"
        >
          🌌 Unified View
        </Button>
        <Button
          onClick={handleToggleToSeparate}
          onKeyDown={handleSeparateKeyDown}
          disabled={disabled}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 ${
            !useUnifiedView
              ? 'bg-cosmic-gold text-cosmic-dark shadow-md'
              : 'text-cosmic-silver hover:text-cosmic-gold'
          }`}
          data-testid="separate-view-button"
          aria-pressed={!useUnifiedView}
          aria-label="Switch to separate tables view"
        >
          📊 Separate Tables
        </Button>
      </div>
    </div>
  );
});

ViewToggleControls.displayName = 'ViewToggleControls';

export { ViewToggleControls };
export default ViewToggleControls;
