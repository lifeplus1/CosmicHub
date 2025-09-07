import React, { useState, useCallback } from 'react';

export interface BasicAccountData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface BasicAccountFormProps {
  data: BasicAccountData;
  onChange: (data: BasicAccountData) => void;
  onValidationChange: (isValid: boolean) => void;
  disabled?: boolean;
}

export const BasicAccountForm: React.FC<BasicAccountFormProps> = React.memo(({
  data,
  onChange,
  onValidationChange,
  disabled = false,
}) => {
  const [errors, setErrors] = useState<Partial<BasicAccountData>>({});

  const validateField = useCallback((field: keyof BasicAccountData, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      }

      case 'password': {
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters long';
        } else {
          delete newErrors.password;
        }
        break;
      }

      case 'confirmPassword': {
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== data.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      }
    }

    setErrors(newErrors);
    
    // Check if form is valid
    const isValid = Object.keys(newErrors).length === 0 && 
                   data.email.trim() !== '' && 
                   data.password !== '' && 
                   data.confirmPassword !== '';
    onValidationChange(isValid);
  }, [data, errors, onValidationChange]);

  const handleChange = useCallback((field: keyof BasicAccountData, value: string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
    validateField(field, value);
  }, [data, onChange, validateField]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-blue-200">Start your healing journey with HealWave</p>
      </div>

      <div className="space-y-4">
        <div>
          <label 
            htmlFor="signup-email" 
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Email Address *
          </label>
          <input
            id="signup-email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="Enter your email address"
            aria-describedby={errors.email ? "email-error" : undefined}
            {...(errors.email && { 'aria-invalid': 'true' })}
            required
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="signup-password" 
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Password *
          </label>
          <input
            id="signup-password"
            type="password"
            value={data.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="Create a secure password"
            aria-describedby={errors.password ? "password-error" : "password-help"}
            {...(errors.password && { 'aria-invalid': 'true' })}
            required
            minLength={6}
          />
          {errors.password ? (
            <p id="password-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.password}
            </p>
          ) : (
            <p id="password-help" className="mt-1 text-sm text-white/60">
              Minimum 6 characters required
            </p>
          )}
        </div>

        <div>
          <label 
            htmlFor="signup-confirm-password" 
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Confirm Password *
          </label>
          <input
            id="signup-confirm-password"
            type="password"
            value={data.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            placeholder="Confirm your password"
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            {...(errors.confirmPassword && { 'aria-invalid': 'true' })}
            required
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-sm text-red-400" role="alert">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

BasicAccountForm.displayName = 'BasicAccountForm';
