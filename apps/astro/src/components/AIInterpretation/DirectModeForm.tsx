/**
 * @fileoverview DirectModeForm Component
 * 
 * Form component for direct AI interpretation mode.
 * Handles birth data collection and interpretation focus selection
 * for direct AI analysis without chart dependency.
 * 
 * @component DirectModeForm
 * @example
 * ```tsx
 * <DirectModeForm
 *   directForm={directForm}
 *   onDirectFormChange={setDirectForm}
 *   aiInterpretationTypes={aiInterpretationTypes}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { 
  DirectModeFormPropsSchema,
  type DirectModeFormProps, 
  type DirectInterpretationType 
} from '../../schemas/interpretationForm';
import BirthDataInput from './BirthDataInput';

/**
 * Direct mode form for AI interpretation generation
 * 
 * Provides form controls for direct AI interpretation including
 * birth data collection and interpretation focus selection.
 * 
 * @param props - Direct mode form props
 * @param props.directForm - Current direct form state
 * @param props.onDirectFormChange - Callback for form state changes
 * @param props.aiInterpretationTypes - Available AI interpretation types
 * @param props.onValidationError - Optional callback for validation errors
 */
const DirectModeForm: React.FC<DirectModeFormProps> = ({
  directForm,
  onDirectFormChange,
  aiInterpretationTypes,
  onValidationError,
}) => {
  // Validate props using Type Bridge schema
  const validation = DirectModeFormPropsSchema.safeParse({
    directForm,
    onDirectFormChange,
    aiInterpretationTypes,
    onValidationError,
  });

  if (!validation.success) {
    console.warn('DirectModeForm: Invalid props', validation.error);
  }

  // Handle birth data changes
  const handleBirthDateChange = useCallback((birthDate: string) => {
    onDirectFormChange({
      ...directForm,
      birthDate,
    });
  }, [directForm, onDirectFormChange]);

  const handleBirthTimeChange = useCallback((birthTime: string) => {
    onDirectFormChange({
      ...directForm,
      birthTime,
    });
  }, [directForm, onDirectFormChange]);

  const handleBirthLocationChange = useCallback((birthLocation: string) => {
    onDirectFormChange({
      ...directForm,
      birthLocation,
    });
  }, [directForm, onDirectFormChange]);

  // Handle interpretation type change
  const handleInterpretationTypeChange = useCallback((interpretationType: DirectInterpretationType) => {
    onDirectFormChange({
      ...directForm,
      interpretationType,
    });
  }, [directForm, onDirectFormChange]);

  return (
    <>
      {/* Birth Information for Direct AI */}
      <BirthDataInput
        birthDate={directForm.birthDate}
        birthTime={directForm.birthTime}
        birthLocation={directForm.birthLocation}
        onBirthDateChange={handleBirthDateChange}
        onBirthTimeChange={handleBirthTimeChange}
        onBirthLocationChange={handleBirthLocationChange}
        showValidation={true}
        disabled={false}
      />

      {/* Interpretation Focus */}
      <div>
        <div className="block text-cosmic-gold font-medium mb-3">
          Interpretation Focus
        </div>
        <fieldset
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
          aria-labelledby="direct-interpretation-type-legend"
        >
          <legend
            id="direct-interpretation-type-legend"
            className="sr-only"
          >
            Select AI interpretation focus
          </legend>
          
          {aiInterpretationTypes.map((type) => (
            <label
              key={type.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                directForm.interpretationType === type.value
                  ? 'border-cosmic-gold bg-cosmic-gold/10'
                  : 'border-cosmic-silver/30 hover:border-cosmic-silver/50'
              }`}
            >
              <input
                type="radio"
                name="interpretationType"
                value={type.value}
                checked={directForm.interpretationType === type.value}
                onChange={(e) =>
                  handleInterpretationTypeChange(
                    e.target.value as DirectInterpretationType
                  )
                }
                className="sr-only"
                aria-labelledby={`interpretation-type-${type.value}`}
                aria-label={`${type.label}: ${type.description}`}
              />
              <div className="text-cosmic-silver">
                <div
                  className="font-semibold"
                  id={`interpretation-type-${type.value}`}
                >
                  {type.label}
                </div>
                <div className="text-sm text-cosmic-silver/70 mt-1">
                  {type.description}
                </div>
              </div>
            </label>
          ))}
        </fieldset>
      </div>
    </>
  );
};

// Display name for debugging
DirectModeForm.displayName = 'DirectModeForm';

export default React.memo(DirectModeForm);
