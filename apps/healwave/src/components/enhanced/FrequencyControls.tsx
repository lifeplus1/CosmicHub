import React, { useCallback, useState, useMemo } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { FREQUENCY_CONSTANTS, FREQUENCY_CATEGORIES } from '../constants/frequencyConstants';
import { CompactFrequencyList } from '../ui/CompactFrequencyList';
import { getUnifiedFrequencyPresets, getPresetsByCategory } from '../../data/unifiedFrequencyData';
import { ValidatedFrequencyData as FrequencyData } from '../../schemas/frequencySchemas';

interface FrequencyControlsProps {
  currentFrequency: number;
  onFrequencyChange: (frequency: number) => void;
  volumeLabelId?: string;
}

export const FrequencyControls: React.FC<FrequencyControlsProps> = ({
  currentFrequency,
  onFrequencyChange,
  volumeLabelId = 'frequency-label',
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Get all available frequencies
  const allFrequencies = useMemo(() => getUnifiedFrequencyPresets(), []);
  
  // Get filtered frequencies based on category
  const filteredFrequencies = useMemo(() => {
    return categoryFilter === 'all' 
      ? allFrequencies 
      : getPresetsByCategory(categoryFilter);
  }, [allFrequencies, categoryFilter]);

  // Find currently selected frequency data
  const selectedFrequencyData = useMemo(() => {
    return allFrequencies.find(f => Math.abs(f.frequency - currentFrequency) < 0.1);
  }, [allFrequencies, currentFrequency]);

  const handleFrequencyChange = useCallback((values: number[]) => {
    const freq = values[0] ?? FREQUENCY_CONSTANTS.DEFAULT_FREQUENCY;
    onFrequencyChange(freq);
  }, [onFrequencyChange]);

  const handleQuickFrequencySelect = useCallback((freq: number) => {
    onFrequencyChange(freq);
  }, [onFrequencyChange]);

  const handleFrequencySelect = useCallback((frequencyData: FrequencyData) => {
    onFrequencyChange(frequencyData.frequency);
  }, [onFrequencyChange]);

  const handleCategoryChange = useCallback((category: string) => {
    setCategoryFilter(category);
  }, []);

  return (
    <div className="cosmic-glass rounded-xl border border-cosmic-purple/30 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-cosmic-purple/20">
        <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🎚️ Frequency Control</h3>
        
        {/* Current Frequency Slider */}
        <div className="space-y-4">
          <div>
            <label
              id={volumeLabelId}
              className="block text-sm text-cosmic-silver mb-2"
            >
              Current: {currentFrequency.toFixed(1)} Hz
            </label>
            <Slider.Root
              value={[currentFrequency]}
              onValueChange={handleFrequencyChange}
              min={FREQUENCY_CONSTANTS.MIN_FREQUENCY}
              max={FREQUENCY_CONSTANTS.MAX_FREQUENCY}
              step={FREQUENCY_CONSTANTS.VOLUME_STEP}
              aria-labelledby={volumeLabelId}
              className="relative flex items-center w-full h-5"
            >
              <Slider.Track className="relative flex-1 h-2 bg-white/20 rounded-full">
                <Slider.Range className="absolute h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
            </Slider.Root>
          </div>
          
          {/* Quick Select Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCY_CONSTANTS.COMMON_FREQUENCIES.map((freq) => (
              <button
                key={freq}
                onClick={() => handleQuickFrequencySelect(freq)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  Math.abs(currentFrequency - freq) < 0.1
                    ? 'bg-cosmic-gold text-black font-medium'
                    : 'bg-cosmic-purple/20 text-cosmic-purple hover:bg-cosmic-purple/30'
                }`}
              >
                {freq} Hz
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-cosmic-purple/20 bg-cosmic-purple/5">
        <label htmlFor="category-filter" className="block text-sm text-cosmic-silver mb-2">
          Filter by Category:
        </label>
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50"
        >
          <option value="all">All Categories ({allFrequencies.length})</option>
          {FREQUENCY_CATEGORIES.slice(1).map((category) => {
            const count = allFrequencies.filter(f => f.category === category).length;
            return count > 0 ? (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} ({count})
              </option>
            ) : null;
          })}
        </select>
      </div>

      {/* Frequency List */}
      <div className="max-h-96 overflow-y-auto">
        <CompactFrequencyList
          frequencies={filteredFrequencies}
          selectedFrequency={selectedFrequencyData}
          onFrequencySelect={handleFrequencySelect}
          categoryFilter={categoryFilter}
          className="p-2"
        />
      </div>
    </div>
  );
};
