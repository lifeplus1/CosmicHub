/**
 * Reusable Control Panel Components
 * Eliminates duplicate styling and structure
 */

import React, { ReactNode } from 'react';
import * as Slider from '@radix-ui/react-slider';

interface ControlPanelProps {
  title: string;
  icon?: string;
  children: ReactNode;
  className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  title, 
  icon, 
  children, 
  className = '' 
}) => (
  <div className={`cosmic-glass p-6 rounded-xl border border-cosmic-purple/30 ${className}`}>
    <h3 className="text-lg font-semibold text-cosmic-gold mb-4">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </h3>
    {children}
  </div>
);

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
  className?: string;
  gradientColors?: [string, string];
}

export const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  formatValue,
  onChange,
  className = '',
  gradientColors = ['#3b82f6', '#8b5cf6']
}) => {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`;
  const [fromColor, toColor] = gradientColors;

  return (
    <div className={className}>
      <label className="block text-sm text-cosmic-silver mb-2">
        {label}: {displayValue}
      </label>
      <Slider.Root
        value={[value]}
        onValueChange={(values) => onChange(values[0] ?? min)}
        min={min}
        max={max}
        step={step}
        className="relative flex items-center w-full h-5"
      >
        <Slider.Track className="relative flex-1 h-2 bg-white/20 rounded-full">
          <Slider.Range 
            className="absolute h-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${fromColor}, ${toColor})`
            }}
          />
        </Slider.Track>
        <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
      </Slider.Root>
    </div>
  );
};

interface QuickButtonsProps {
  values: number[];
  currentValue?: number;
  unit?: string;
  onClick: (value: number) => void;
  className?: string;
}

export const QuickButtons: React.FC<QuickButtonsProps> = ({
  values,
  currentValue,
  unit = '',
  onClick,
  className = ''
}) => (
  <div className={`grid grid-cols-2 gap-2 ${className}`}>
    {values.map((freq) => (
      <button
        key={freq}
        onClick={() => onClick(freq)}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          currentValue === freq
            ? 'bg-cosmic-gold text-black'
            : 'bg-cosmic-purple/20 text-cosmic-purple hover:bg-cosmic-purple/30'
        }`}
      >
        {freq} {unit}
      </button>
    ))}
  </div>
);

interface FeatureBadgeProps {
  title: string;
  description: string;
  icon?: string;
  isPremium?: boolean;
  className?: string;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({
  title,
  description,
  icon = '✨',
  isPremium = false,
  className = ''
}) => (
  <div className={`p-3 rounded-lg border backdrop-blur-sm ${
    isPremium 
      ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/30' 
      : 'bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-500/30'
  } ${className}`}>
    <div className="flex items-center justify-center space-x-2">
      <span className={isPremium ? 'text-green-300' : 'text-blue-300'}>{icon}</span>
      <div className="text-center">
        <p className={`text-sm font-medium ${isPremium ? 'text-green-200' : 'text-blue-200'}`}>
          {title}
        </p>
        <p className={`text-xs ${isPremium ? 'text-green-300/80' : 'text-blue-300/80'}`}>
          {description}
        </p>
      </div>
    </div>
  </div>
);

interface CategoryFilterProps {
  categories: string[];
  currentCategory: string;
  onChange: (category: string) => void;
  getCount?: (category: string) => number;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  currentCategory,
  onChange,
  getCount,
  className = ''
}) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {categories.map((category) => {
      const count = getCount?.(category) ?? 0;
      
      return (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
            currentCategory === category
              ? 'bg-cosmic-gold text-black shadow-lg'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          {category} {getCount && `(${count})`}
        </button>
      );
    })}
  </div>
);
