import React, { useState, useCallback } from 'react';

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  occupation: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfoData;
  onChange: (data: PersonalInfoData) => void;
  onValidationChange: (isValid: boolean) => void;
  disabled?: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = React.memo(({
  data,
  onChange,
  onValidationChange,
  disabled = false,
}) => {
  const [errors, setErrors] = useState<Partial<PersonalInfoData>>({});

  const validateField = useCallback((field: keyof PersonalInfoData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'firstName': {
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        } else if (value.trim().length < 2) {
          newErrors.firstName = 'First name must be at least 2 characters';
        } else {
          delete newErrors.firstName;
        }
        break;
      }

      case 'lastName': {
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        } else if (value.trim().length < 2) {
          newErrors.lastName = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.lastName;
        }
        break;
      }

      case 'dateOfBirth': {
        if (!value) {
          newErrors.dateOfBirth = 'Date of birth is required';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          
          if (isNaN(birthDate.getTime())) {
            newErrors.dateOfBirth = 'Please enter a valid date';
          } else if (age < 13) {
            newErrors.dateOfBirth = 'You must be at least 13 years old';
          } else if (age > 120) {
            newErrors.dateOfBirth = 'Please enter a valid date of birth';
          } else {
            delete newErrors.dateOfBirth;
          }
        }
        break;
      }

      case 'occupation': {
        // Occupation is optional, but if provided should be reasonable length
        if (value && value.length > 100) {
          newErrors.occupation = 'Occupation should be less than 100 characters';
        } else {
          delete newErrors.occupation;
        }
        break;
      }
    }

    setErrors(newErrors);
    
    // Check if required fields are valid
    const isValid = Object.keys(newErrors).length === 0 && 
                   data.firstName.trim() !== '' && 
                   data.lastName.trim() !== '' && 
                   data.dateOfBirth !== '';
    onValidationChange(isValid);
  }, [data, errors, onValidationChange]);

  const handleChange = useCallback((field: keyof PersonalInfoData, value: string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
    validateField(field, value);
  }, [data, onChange, validateField]);

  // Calculate max date (today) and min date (120 years ago)
  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-blue-200">Help us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label 
              htmlFor="signup-first-name" 
              className="block text-sm font-medium text-white/90 mb-2"
            >
              First Name *
            </label>
            <input
              id="signup-first-name"
              type="text"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="Enter your first name"
              aria-describedby={errors.firstName ? "first-name-error" : undefined}
              {...(errors.firstName && { 'aria-invalid': 'true' })}
              required
              maxLength={50}
            />
            {errors.firstName && (
              <p id="first-name-error" className="mt-1 text-sm text-red-400" role="alert">
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label 
              htmlFor="signup-last-name" 
              className="block text-sm font-medium text-white/90 mb-2"
            >
              Last Name *
            </label>
            <input
              id="signup-last-name"
              type="text"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={disabled}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              placeholder="Enter your last name"
              aria-describedby={errors.lastName ? "last-name-error" : undefined}
              {...(errors.lastName && { 'aria-invalid': 'true' })}
              required
              maxLength={50}
            />
            {errors.lastName && (
              <p id="last-name-error" className="mt-1 text-sm text-red-400" role="alert">
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label 
            htmlFor="signup-date-of-birth" 
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Date of Birth *
          </label>
          <input
            id="signup-date-of-birth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            disabled={disabled}
            min={minDate}
            max={today}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            aria-describedby={errors.dateOfBirth ? "date-of-birth-error" : "date-of-birth-help"}
            {...(errors.dateOfBirth && { 'aria-invalid': 'true' })}
            required
          />
          {errors.dateOfBirth ? (
            <p id="date-of-birth-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.dateOfBirth}
            </p>
          ) : (
            <p id="date-of-birth-help" className="mt-1 text-sm text-white/60">
              We use this to personalize your healing frequencies
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="signup-occupation" 
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Occupation (Optional)
          </label>
          <input
            id="signup-occupation"
            type="text"
            value={data.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="e.g., Software Developer, Teacher, Student"
            aria-describedby={errors.occupation ? "occupation-error" : "occupation-help"}
            {...(errors.occupation && { 'aria-invalid': 'true' })}
            maxLength={100}
          />
          {errors.occupation ? (
            <p id="occupation-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.occupation}
            </p>
          ) : (
            <p id="occupation-help" className="mt-1 text-sm text-white/60">
              Helps us recommend frequencies for stress management
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

PersonalInfoForm.displayName = 'PersonalInfoForm';
