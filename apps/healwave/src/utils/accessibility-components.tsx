/**
 * HealWave Enhanced Accessibility Components
 * React components for accessibility (Fast Refresh compatible)
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { useAccessibility, type AccessibleButtonProps, type AccessibleSliderProps } from './accessibility-hooks';

// Live region component for announcements
export const AccessibilityLiveRegion: React.FC<{ 
  liveRegionRef: React.RefObject<HTMLDivElement>;
}> = ({ liveRegionRef }) => (
  <div
    ref={liveRegionRef}
    aria-live="polite"
    aria-atomic="true"
    className="sr-only"
  />
);

// Enhanced button component with full accessibility
export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const { settings } = useAccessibility();
  
  const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm rounded',
    medium: 'px-4 py-2 text-base rounded-md',
    large: 'px-6 py-3 text-lg rounded-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        settings.highContrast ? 'border-2 border-current' : ''
      } ${settings.reduceMotion ? '' : 'transform hover:scale-105'}`}
      disabled={disabled ?? loading}
      aria-describedby={loading ? 'loading-description' : undefined}
      {...props}
    >
      {loading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="sr-only" id="loading-description">Loading</span>
        </>
      )}
      {children}
    </button>
  );
};

// Accessible slider component for frequency/volume controls
export const AccessibleSlider: React.FC<AccessibleSliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  unit = '',
  formatValue
}) => {
  const { announceToScreenReader } = useAccessibility();
  const sliderId = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    onChange(newValue);
    
    const displayValue = formatValue ? formatValue(newValue) : `${newValue}${unit}`;
    announceToScreenReader(`${label} set to ${displayValue}`);
  }, [onChange, formatValue, unit, label, announceToScreenReader]);

  const percentage = ((value - min) / (max - min)) * 100;
  const progressRef = useRef<HTMLDivElement>(null);

  // Update progress bar style without inline styles
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${percentage / 100})`;
    }
  }, [percentage]);

  return (
    <div className="space-y-2">
      <label htmlFor={sliderId} className="block text-sm font-medium text-gray-700">
        {label}: {formatValue ? formatValue(value) : `${value}${unit}`}
      </label>
      
      <div className="relative">
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-valuetext={formatValue ? formatValue(value) : `${value}${unit}`}
        />
        
        {/* Progress bar using ref to avoid inline style ESLint issues */}
        <div
          ref={progressRef}
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg pointer-events-none transition-all duration-200 origin-left"
          aria-hidden="true"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};
