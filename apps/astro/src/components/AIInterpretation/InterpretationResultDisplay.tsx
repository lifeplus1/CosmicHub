/**
 * @fileoverview InterpretationResultDisplay Component
 * 
 * Component for displaying generated AI interpretations with error handling
 * and accessibility features. Shows interpretation results, error messages,
 * and status updates.
 * 
 * @component InterpretationResultDisplay
 * @example
 * ```tsx
 * <InterpretationResultDisplay
 *   interpretation={interpretation}
 *   error={error}
 *   isLoading={loading}
 *   statusMessage={statusMessage}
 * />
 * ```
 */

import React from 'react';
import { 
  InterpretationDisplayPropsSchema,
  type InterpretationDisplayProps 
} from '../../schemas/interpretationForm';

/**
 * Display component for AI interpretation results
 * 
 * Shows generated interpretations, error messages, and status updates
 * with appropriate styling and accessibility features.
 * 
 * @param props - Interpretation display props
 * @param props.interpretation - Generated interpretation text
 * @param props.error - Error message if generation failed
 * @param props.isLoading - Whether interpretation is being loaded
 * @param props.statusMessage - Current status message for screen readers
 * @param props.className - Optional additional CSS classes
 */
const InterpretationResultDisplay: React.FC<InterpretationDisplayProps> = ({
  interpretation,
  error,
  isLoading,
  statusMessage,
  className = '',
}) => {
  // Validate props using Type Bridge schema
  const validation = InterpretationDisplayPropsSchema.safeParse({
    interpretation,
    error,
    isLoading,
    statusMessage,
    className,
  });

  if (!validation.success) {
    console.warn('InterpretationResultDisplay: Invalid props', validation.error);
  }

  const containerClasses = className 
    ? `space-y-4 ${className}`
    : 'space-y-4';

  return (
    <div className={containerClasses}>
      {/* Error Display */}
      {error && typeof error === 'string' && error !== '' && (
        <div 
          className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start space-x-2">
            <span className="text-red-400 text-lg flex-shrink-0" aria-hidden="true">
              ⚠️
            </span>
            <div>
              <h3 className="font-semibold mb-1">Generation Failed</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Interpretation Display */}
      {interpretation && typeof interpretation === 'string' && interpretation !== '' && (
        <div
          className="p-4 bg-cosmic-purple/10 border border-cosmic-purple/30 rounded-lg"
          aria-live="polite"
        >
          <div className="flex items-start space-x-3">
            <span className="text-cosmic-purple text-2xl flex-shrink-0" aria-hidden="true">
              ✨
            </span>
            <div className="flex-1">
              <h3 className="text-cosmic-gold font-semibold mb-3 font-playfair text-lg">
                Your Interpretation
              </h3>
              <div className="text-cosmic-silver leading-relaxed">
                {/* Preserve whitespace and line breaks */}
                <pre className="whitespace-pre-wrap font-sans">
                  {interpretation}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && !interpretation && !error && (
        <div
          className="p-4 bg-cosmic-gold/10 border border-cosmic-gold/30 rounded-lg"
          aria-live="polite"
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-cosmic-gold border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <h3 className="text-cosmic-gold font-semibold">
                Generating Your Interpretation
              </h3>
              <p className="text-cosmic-silver/70 text-sm mt-1">
                Our AI is analyzing your cosmic blueprint...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Status Updates */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </div>

      {/* Empty State */}
      {!interpretation && !error && !isLoading && (
        <div className="text-center py-8">
          <div className="text-cosmic-silver/50 text-6xl mb-4" aria-hidden="true">
            🌟
          </div>
          <h3 className="text-cosmic-gold font-semibold mb-2">
            Ready for Your Cosmic Insights
          </h3>
          <p className="text-cosmic-silver/70 text-sm">
            Fill in your information above and click generate to receive your personalized interpretation
          </p>
        </div>
      )}
    </div>
  );
};

// Display name for debugging
InterpretationResultDisplay.displayName = 'InterpretationResultDisplay';

export default InterpretationResultDisplay;
