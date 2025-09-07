/**
 * @fileoverview GenerateButton Component
 * 
 * Interactive button component for triggering AI interpretation generation.
 * Handles loading states, error states, and accessibility features.
 * 
 * @component GenerateButton
 * @example
 * ```tsx
 * <GenerateButton
 *   isGenerating={isGenerating}
 *   isLoading={loading}
 *   isDisabled={!user?.uid}
 *   onGenerate={handleGenerate}
 *   mode="chart"
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { 
  GenerateButtonPropsSchema,
  type GenerateButtonProps 
} from '../../schemas/interpretationForm';

/**
 * Generate interpretation button with loading states
 * 
 * Provides an interactive button for triggering AI interpretation
 * generation with appropriate loading states and accessibility.
 * 
 * @param props - Generate button props
 * @param props.isGenerating - Whether interpretation is being generated
 * @param props.isLoading - Whether AI hook is in loading state
 * @param props.isDisabled - Whether button should be disabled
 * @param props.onGenerate - Callback for generate action
 * @param props.mode - Current interpretation mode
 * @param props.className - Optional additional CSS classes
 */
const GenerateButton: React.FC<GenerateButtonProps> = ({
  isGenerating,
  isLoading,
  isDisabled,
  onGenerate,
  mode,
  className = '',
}) => {
  // Validate props using Type Bridge schema
  const validation = GenerateButtonPropsSchema.safeParse({
    isGenerating,
    isLoading,
    isDisabled,
    onGenerate,
    mode,
    className,
  });

  if (!validation.success) {
    console.warn('GenerateButton: Invalid props', validation.error);
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

  // Handle click with error catching
  const handleClick = useCallback(() => {
    const result = onGenerate();
    if (result instanceof Promise) {
      void result.catch(() => {
        // Error handling is done within the parent's onGenerate function
      });
    }
  }, [onGenerate]);

  // Determine button state
  const isInLoadingState = isGenerating || isLoading;
  const shouldDisable = isInLoadingState || isDisabled;

  // Build CSS classes
  const baseClasses = [
    'w-full',
    'py-3',
    'px-6',
    'font-semibold',
    'rounded-lg',
    'transition-colors',
    'flex',
    'items-center',
    'justify-center',
    'space-x-2',
  ].join(' ');

  const stateClasses = shouldDisable
    ? 'bg-cosmic-gold/50 text-cosmic-dark/70 cursor-not-allowed'
    : 'bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold/90';

  const combinedClasses = className 
    ? `${baseClasses} ${stateClasses} ${className}`
    : `${baseClasses} ${stateClasses}`;

  // Button content based on state
  const buttonContent = isInLoadingState ? (
    <>
      <div className="w-5 h-5 border-2 border-cosmic-dark border-t-transparent rounded-full animate-spin" />
      <span>Generating...</span>
    </>
  ) : (
    <>
      <span>🔮</span>
      <span>Generate Interpretation</span>
    </>
  );

  // ARIA label based on mode and state
  const ariaLabel = isInLoadingState
    ? `Generating ${mode} interpretation...`
    : `Generate AI interpretation based on provided ${mode === 'chart' ? 'chart' : 'birth'} information`;

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        onKeyDown={(e) => handleKeyPress(e, handleClick)}
        disabled={shouldDisable}
        className={combinedClasses}
        aria-label={ariaLabel}
        tabIndex={0}
        type="button"
      >
        {buttonContent}
      </button>

      {/* Auth hint for chart mode */}
      {mode === 'chart' && isDisabled && !isInLoadingState && (
        <p className="text-cosmic-silver/70 text-center text-sm">
          Please log in to generate personalized interpretations
        </p>
      )}
    </div>
  );
};

// Display name for debugging
GenerateButton.displayName = 'GenerateButton';

export default GenerateButton;
