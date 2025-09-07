import React, { useState, useCallback } from 'react';

export interface PreferencesData {
  experienceLevel: string;
  primaryGoals: string;
  healthConditions: string;
  meditationExperience: string;
  preferredSessionLength: string;
  notificationPreferences: {
    sessionReminders: boolean;
    weeklyProgress: boolean;
    newFrequencies: boolean;
    healthTips: boolean;
  };
}

interface PreferencesFormProps {
  data: PreferencesData;
  onChange: (data: PreferencesData) => void;
  onValidationChange: (isValid: boolean) => void;
  disabled?: boolean;
}

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner - New to sound healing' },
  { value: 'intermediate', label: 'Intermediate - Some experience' },
  { value: 'advanced', label: 'Advanced - Regular practitioner' },
  { value: 'professional', label: 'Professional - Healthcare/Wellness provider' },
];

const PRIMARY_GOALS = [
  { value: 'stress_relief', label: 'Stress Relief & Relaxation' },
  { value: 'sleep_improvement', label: 'Better Sleep Quality' },
  { value: 'focus_concentration', label: 'Enhanced Focus & Concentration' },
  { value: 'meditation', label: 'Meditation Support' },
  { value: 'pain_management', label: 'Pain Management' },
  { value: 'emotional_healing', label: 'Emotional Healing' },
  { value: 'spiritual_growth', label: 'Spiritual Growth' },
  { value: 'general_wellness', label: 'General Wellness' },
];

const MEDITATION_EXPERIENCE = [
  { value: 'none', label: 'No meditation experience' },
  { value: 'beginner', label: 'Beginner (less than 6 months)' },
  { value: 'intermediate', label: 'Intermediate (6 months - 2 years)' },
  { value: 'advanced', label: 'Advanced (2+ years)' },
  { value: 'expert', label: 'Expert/Teacher (5+ years)' },
];

const SESSION_LENGTHS = [
  { value: '5', label: '5 minutes - Quick sessions' },
  { value: '10', label: '10 minutes - Short sessions' },
  { value: '15', label: '15 minutes - Standard sessions' },
  { value: '20', label: '20 minutes - Extended sessions' },
  { value: '30', label: '30 minutes - Deep sessions' },
  { value: '45', label: '45 minutes - Immersive sessions' },
  { value: '60', label: '60+ minutes - Full healing sessions' },
];

export const PreferencesForm: React.FC<PreferencesFormProps> = React.memo(({
  data,
  onChange,
  onValidationChange,
  disabled = false,
}) => {
  const [errors, setErrors] = useState<Partial<Pick<PreferencesData, 'experienceLevel' | 'primaryGoals' | 'preferredSessionLength'>>>({});

  const validateField = useCallback((field: keyof PreferencesData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'experienceLevel': {
        if (!value) {
          newErrors.experienceLevel = 'Please select your experience level';
        } else {
          delete newErrors.experienceLevel;
        }
        break;
      }

      case 'primaryGoals': {
        if (!value) {
          newErrors.primaryGoals = 'Please select your primary goal';
        } else {
          delete newErrors.primaryGoals;
        }
        break;
      }

      case 'preferredSessionLength': {
        if (!value) {
          newErrors.preferredSessionLength = 'Please select your preferred session length';
        } else {
          delete newErrors.preferredSessionLength;
        }
        break;
      }
    }

    setErrors(newErrors);
    
    // Check if required fields are valid
    const isValid = Object.keys(newErrors).length === 0 && 
                   data.experienceLevel !== '' && 
                   data.primaryGoals !== '' && 
                   data.preferredSessionLength !== '';
    onValidationChange(isValid);
  }, [data, errors, onValidationChange]);

  const handleSelectChange = useCallback((field: keyof PreferencesData, value: string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
    validateField(field, value);
  }, [data, onChange, validateField]);

  const handleTextareaChange = useCallback((field: keyof PreferencesData, value: string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  }, [data, onChange]);

  const handleNotificationChange = useCallback((key: keyof PreferencesData['notificationPreferences'], checked: boolean) => {
    const newData = {
      ...data,
      notificationPreferences: {
        ...data.notificationPreferences,
        [key]: checked,
      },
    };
    onChange(newData);
  }, [data, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Preferences</h2>
        <p className="text-blue-200">Customize your healing experience</p>
      </div>

      <div className="space-y-6">
        {/* Experience Level */}
        <div>
          <label 
            htmlFor="signup-experience-level" 
            className="block text-sm font-medium text-white/90 mb-3"
          >
            Experience with Sound Healing *
          </label>
          <select
            id="signup-experience-level"
            value={data.experienceLevel}
            onChange={(e) => handleSelectChange('experienceLevel', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            aria-describedby={errors.experienceLevel ? "experience-level-error" : undefined}
            {...(errors.experienceLevel && { 'aria-invalid': 'true' })}
            required
          >
            <option value="" className="bg-gray-800">Select your experience level</option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level.value} value={level.value} className="bg-gray-800">
                {level.label}
              </option>
            ))}
          </select>
          {errors.experienceLevel && (
            <p id="experience-level-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.experienceLevel}
            </p>
          )}
        </div>

        {/* Primary Goals */}
        <div>
          <label 
            htmlFor="signup-primary-goals" 
            className="block text-sm font-medium text-white/90 mb-3"
          >
            Primary Healing Goal *
          </label>
          <select
            id="signup-primary-goals"
            value={data.primaryGoals}
            onChange={(e) => handleSelectChange('primaryGoals', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            aria-describedby={errors.primaryGoals ? "primary-goals-error" : undefined}
            {...(errors.primaryGoals && { 'aria-invalid': 'true' })}
            required
          >
            <option value="" className="bg-gray-800">Select your primary goal</option>
            {PRIMARY_GOALS.map((goal) => (
              <option key={goal.value} value={goal.value} className="bg-gray-800">
                {goal.label}
              </option>
            ))}
          </select>
          {errors.primaryGoals && (
            <p id="primary-goals-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.primaryGoals}
            </p>
          )}
        </div>

        {/* Meditation Experience */}
        <div>
          <label 
            htmlFor="signup-meditation-experience" 
            className="block text-sm font-medium text-white/90 mb-3"
          >
            Meditation Experience
          </label>
          <select
            id="signup-meditation-experience"
            value={data.meditationExperience}
            onChange={(e) => handleSelectChange('meditationExperience', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
          >
            <option value="" className="bg-gray-800">Select your meditation experience</option>
            {MEDITATION_EXPERIENCE.map((exp) => (
              <option key={exp.value} value={exp.value} className="bg-gray-800">
                {exp.label}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Session Length */}
        <div>
          <label 
            htmlFor="signup-session-length" 
            className="block text-sm font-medium text-white/90 mb-3"
          >
            Preferred Session Length *
          </label>
          <select
            id="signup-session-length"
            value={data.preferredSessionLength}
            onChange={(e) => handleSelectChange('preferredSessionLength', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            aria-describedby={errors.preferredSessionLength ? "session-length-error" : undefined}
            {...(errors.preferredSessionLength && { 'aria-invalid': 'true' })}
            required
          >
            <option value="" className="bg-gray-800">Select preferred session length</option>
            {SESSION_LENGTHS.map((length) => (
              <option key={length.value} value={length.value} className="bg-gray-800">
                {length.label}
              </option>
            ))}
          </select>
          {errors.preferredSessionLength && (
            <p id="session-length-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.preferredSessionLength}
            </p>
          )}
        </div>

        {/* Health Conditions */}
        <div>
          <label 
            htmlFor="signup-health-conditions" 
            className="block text-sm font-medium text-white/90 mb-3"
          >
            Health Conditions (Optional)
          </label>
          <textarea
            id="signup-health-conditions"
            value={data.healthConditions}
            onChange={(e) => handleTextareaChange('healthConditions', e.target.value)}
            disabled={disabled}
            rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all resize-none"
            placeholder="Any relevant health conditions, medications, or concerns (optional but helpful for personalized recommendations)"
            maxLength={500}
            aria-describedby="health-conditions-help"
          />
          <p id="health-conditions-help" className="mt-1 text-sm text-white/60">
            This information helps us provide safer, more personalized frequency recommendations
          </p>
        </div>

        {/* Notification Preferences */}
        <div>
          <fieldset>
            <legend className="text-sm font-medium text-white/90 mb-3">
              Notification Preferences
            </legend>
            <div className="space-y-3">
              {Object.entries({
                sessionReminders: 'Session reminders',
                weeklyProgress: 'Weekly progress reports',
                newFrequencies: 'New frequency releases',
                healthTips: 'Wellness tips and insights',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.notificationPreferences[key as keyof PreferencesData['notificationPreferences']]}
                    onChange={(e) => handleNotificationChange(key as keyof PreferencesData['notificationPreferences'], e.target.checked)}
                    disabled={disabled}
                    className="w-4 h-4 text-cyan-400 bg-white/10 border-white/20 rounded focus:ring-cyan-400 focus:ring-2"
                  />
                  <span className="text-white/90">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
});

PreferencesForm.displayName = 'PreferencesForm';
