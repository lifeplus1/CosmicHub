/**
 * @fileoverview FocusAreaSelector Component
 * 
 * Interactive component for selecting interpretation focus areas.
 * Provides toggle buttons for each available focus area with
 * accessibility and visual feedback.
 * 
 * @component FocusAreaSelector
 * @example
 * ```tsx
 * <FocusAreaSelector
 *   selectedFocus={chartForm.focus}
 *   focusAreaLabels={FOCUS_AREA_LABELS}
 *   onFocusToggle={handleFocusToggle}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { 
  FocusAreaSelectorPropsSchema,
  type FocusAreaSelectorProps 
} from '../../schemas/interpretationForm';
import { focusLabelToCanonical } from '../../services/interpretationFocus';

/**
 * Focus area selector with toggle buttons
 * 
 * Allows users to select multiple focus areas for their interpretation
 * with accessible toggle buttons and visual feedback.
 * 
 * @param props - Focus area selector props
 * @param props.selectedFocus - Currently selected focus areas
 * @param props.focusAreaLabels - Available focus area labels
 * @param props.onFocusToggle - Callback for focus area toggle
 * @param props.className - Optional additional CSS classes
 * @param props.disabled - Whether selector is disabled
 */
const FocusAreaSelector: React.FC<FocusAreaSelectorProps> = ({
  selectedFocus,
  focusAreaLabels,
  onFocusToggle,
  className = '',
  disabled = false,
}) => {
  // Validate props using Type Bridge schema
  const validation = FocusAreaSelectorPropsSchema.safeParse({
    selectedFocus,
    focusAreaLabels,
    onFocusToggle,
    className,
    disabled,
  });

  if (!validation.success) {
    console.warn('FocusAreaSelector: Invalid props', validation.error);
  }

  // Handle keyboard interaction
  const handleKeyPress = useCallback((
    event: React.KeyboardEvent,
    action: () => void
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);

  // Check if focus area is selected
  const isFocusSelected = useCallback((focusLabel: string): boolean => {
    const canonical = focusLabelToCanonical(focusLabel);
    return selectedFocus.includes(canonical);
  }, [selectedFocus]);

  const containerClasses = className 
    ? `flex flex-wrap gap-2 ${className}`
    : 'flex flex-wrap gap-2';

  return (
    <div>
      <div className="block text-cosmic-gold font-medium mb-3">
        Focus Areas (Optional)
      </div>
      
      <fieldset
        className={containerClasses}
        aria-labelledby="focus-area-legend"
        disabled={disabled}
      >
        <legend id="focus-area-legend" className="sr-only">
          Focus area toggle buttons
        </legend>
        
        {focusAreaLabels.map((focus) => {
          const isSelected = isFocusSelected(focus);
          
          return (
            <button
              key={focus}
              type="button"
              data-active={isSelected}
              onClick={() => !disabled && onFocusToggle(focus)}
              onKeyDown={(e) => handleKeyPress(e, () => !disabled && onFocusToggle(focus))}
              disabled={disabled}
              className={
                isSelected
                  ? [
                      'px-3',
                      'py-2',
                      'text-sm',
                      'rounded-full',
                      'border',
                      'transition-all',
                      'bg-cosmic-purple/20',
                      'text-cosmic-purple',
                      'border-cosmic-purple/50',
                      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-cosmic-purple/30',
                    ].join(' ')
                  : [
                      'px-3',
                      'py-2',
                      'text-sm',
                      'rounded-full',
                      'border',
                      'transition-all',
                      'bg-cosmic-dark/40',
                      'text-cosmic-silver/70',
                      'border-cosmic-silver/30',
                      disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-cosmic-silver/50 hover:text-cosmic-silver',
                    ].join(' ')
              }
              aria-pressed="true"
              aria-label={`${focus}: ${isSelected ? 'selected' : 'not selected'}`}
              tabIndex={disabled ? -1 : 0}
            >
              {focus}
            </button>
          );
        })}
      </fieldset>
      
      {/* Hint text */}
      <p className="mt-2 text-xs text-cosmic-silver/60">
        Select one or more areas to focus your interpretation
      </p>
    </div>
  );
};

// Display name for debugging
FocusAreaSelector.displayName = 'FocusAreaSelector';

export default FocusAreaSelector;
