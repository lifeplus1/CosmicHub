/**
 * @fileoverview BirthDataInput Component
 * 
 * Reusable component for collecting birth data (date, time, location)
 * with comprehensive validation and accessibility features.
 * 
 * @component BirthDataInput
 * @example
 * ```tsx
 * <BirthDataInput
 *   birthDate={directForm.birthDate}
 *   birthTime={directForm.birthTime}
 *   birthLocation={directForm.birthLocation}
 *   onBirthDateChange={(date) => setDirectForm(prev => ({ ...prev, birthDate: date }))}
 *   onBirthTimeChange={(time) => setDirectForm(prev => ({ ...prev, birthTime: time }))}
 *   onBirthLocationChange={(location) => setDirectForm(prev => ({ ...prev, birthLocation: location }))}
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { 
  BirthDataInputPropsSchema,
  validateDate, 
  validateTime,
  type BirthDataInputProps 
} from '../../schemas/interpretationForm';

/**
 * Birth data input component with validation
 * 
 * Provides input fields for birth date, time, and location with
 * real-time validation and accessibility features.
 * 
 * @param props - Birth data input props
 * @param props.birthDate - Current birth date value
 * @param props.birthTime - Current birth time value
 * @param props.birthLocation - Current birth location value
 * @param props.onBirthDateChange - Callback for date changes
 * @param props.onBirthTimeChange - Callback for time changes
 * @param props.onBirthLocationChange - Callback for location changes
 * @param props.showValidation - Whether to show validation errors
 * @param props.disabled - Whether inputs are disabled
 * @param props.className - Optional additional CSS classes
 */
const BirthDataInput: React.FC<BirthDataInputProps> = ({
  birthDate,
  birthTime,
  birthLocation,
  onBirthDateChange,
  onBirthTimeChange,
  onBirthLocationChange,
  showValidation = true,
  disabled = false,
  className = '',
}) => {
  // Validate props using Type Bridge schema
  const validation = BirthDataInputPropsSchema.safeParse({
    birthDate,
    birthTime,
    birthLocation,
    onBirthDateChange,
    onBirthTimeChange,
    onBirthLocationChange,
    showValidation,
    disabled,
    className,
  });

  if (!validation.success) {
    console.warn('BirthDataInput: Invalid props', validation.error);
  }

  // Validation functions
  const isValidDate = useCallback((value: string): boolean => {
    if (value === '') return true; // Allow empty during typing
    return validateDate(value).success;
  }, []);

  const isValidTime = useCallback((value: string): boolean => {
    if (value === '') return true; // Allow empty during typing
    return validateTime(value).success;
  }, []);

  // Error checking
  const dateHasError = showValidation && birthDate !== '' && !isValidDate(birthDate);
  const timeHasError = showValidation && birthTime !== '' && !isValidTime(birthTime);

  const baseInputClasses = [
    'w-full',
    'p-3',
    'bg-cosmic-dark/40',
    'border',
    'border-cosmic-silver/30',
    'rounded-lg',
    'text-cosmic-silver',
    'focus:border-cosmic-gold',
    'focus:outline-none',
    'transition-colors',
  ].join(' ');

  const disabledInputClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const placeholderClasses = 'placeholder-cosmic-silver/50';

  const containerClasses = className 
    ? `grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`
    : 'grid grid-cols-1 md:grid-cols-3 gap-4';

  return (
    <div className={containerClasses}>
      {/* Birth Date Input */}
      <div>
        <label
          htmlFor="birth-date"
          className="block text-cosmic-gold font-medium mb-2"
        >
          Birth Date
        </label>
        <input
          id="birth-date"
          type="text"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
          disabled={disabled}
          aria-describedby={`birth-date-format${dateHasError ? ' birth-date-error' : ''}`}
          {...(dateHasError && { 'aria-invalid': 'true' })}
          className={`${baseInputClasses} ${disabledInputClasses} ${placeholderClasses}`}
          title="Enter birth date in YYYY-MM-DD format"
          aria-label="Birth date"
        />
        
        {/* Format hint */}
        <p id="birth-date-format" className="sr-only">
          Format: YYYY-MM-DD
        </p>
        
        {/* Validation error */}
        {dateHasError && (
          <p
            id="birth-date-error"
            className="mt-1 text-xs text-red-400"
            role="alert"
          >
            Invalid date format. Use YYYY-MM-DD.
          </p>
        )}
      </div>

      {/* Birth Time Input */}
      <div>
        <label
          htmlFor="birth-time"
          className="block text-cosmic-gold font-medium mb-2"
        >
          Birth Time
        </label>
        <input
          id="birth-time"
          type="text"
          inputMode="numeric"
          placeholder="HH:MM"
          value={birthTime}
          onChange={(e) => onBirthTimeChange(e.target.value)}
          disabled={disabled}
          aria-describedby={`birth-time-format${timeHasError ? ' birth-time-error' : ''}`}
          {...(timeHasError && { 'aria-invalid': 'true' })}
          className={`${baseInputClasses} ${disabledInputClasses} ${placeholderClasses}`}
          title="Enter birth time in 24h HH:MM format"
          aria-label="Birth time"
        />
        
        {/* Format hint */}
        <p id="birth-time-format" className="sr-only">
          Format: 24-hour HH:MM
        </p>
        
        {/* Validation error */}
        {timeHasError && (
          <p
            id="birth-time-error"
            className="mt-1 text-xs text-red-400"
            role="alert"
          >
            Invalid time format. Use 24h HH:MM.
          </p>
        )}
      </div>

      {/* Birth Location Input */}
      <div>
        <label
          htmlFor="birth-location"
          className="block text-cosmic-gold font-medium mb-2"
        >
          Birth Location
        </label>
        <input
          id="birth-location"
          type="text"
          value={birthLocation}
          onChange={(e) => onBirthLocationChange(e.target.value)}
          disabled={disabled}
          placeholder="City, Country"
          className={`${baseInputClasses} ${disabledInputClasses} ${placeholderClasses}`}
          aria-label="Birth location"
        />
      </div>
    </div>
  );
};

// Display name for debugging
BirthDataInput.displayName = 'BirthDataInput';

export default BirthDataInput;
