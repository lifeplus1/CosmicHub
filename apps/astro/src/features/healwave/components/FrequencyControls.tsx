import React, { useState, useRef, useCallback, useId } from 'react';
import { Button, Card } from '@cosmichub/ui';

interface FrequencyControlsProps {
  onFrequencyChange: (frequency: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: () => void;
  isPlaying: boolean;
  currentFrequency: number;
  duration: number;
}

const FrequencyControls: React.FC<FrequencyControlsProps> = ({
  onFrequencyChange,
  onDurationChange,
  onPlayPause,
  isPlaying,
  currentFrequency,
  duration
}) => {
  const [customFrequency, setCustomFrequency] = useState(currentFrequency);
  const radioGroupRef = useRef<HTMLDivElement | null>(null);
  const groupLabelId = useId();

  const presetFrequencies = [
    { name: '396 Hz - Root Chakra', value: 396 },
    { name: '417 Hz - Sacral Chakra', value: 417 },
    { name: '528 Hz - Solar Plexus', value: 528 },
    { name: '639 Hz - Heart Chakra', value: 639 },
    { name: '741 Hz - Throat Chakra', value: 741 },
    { name: '852 Hz - Third Eye', value: 852 },
    { name: '963 Hz - Crown Chakra', value: 963 }
  ];

  const handlePresetSelect = (frequency: number) => {
    setCustomFrequency(frequency);
    onFrequencyChange(frequency);
  };

  const handleCustomFrequencySubmit = () => {
    onFrequencyChange(customFrequency);
  };

  return (
    <div className="space-y-6">
      <Card title="Frequency Selection" className="bg-cosmic-dark/50">
        <div className="space-y-4">
          <div>
            <label id={groupLabelId} className="block text-cosmic-silver mb-2">Preset Frequencies</label>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              role="radiogroup"
              aria-labelledby={groupLabelId}
              ref={radioGroupRef}
              onKeyDown={useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
                const keys = ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'];
                if (!keys.includes(e.key)) return;
                e.preventDefault();
                const buttons = radioGroupRef.current?.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
                if (!buttons || buttons.length === 0) return;
                const idx = presetFrequencies.findIndex(p => p.value === currentFrequency);
                const currentIndex = idx >= 0 ? idx : 0;
                let nextIndex = currentIndex;
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (currentIndex + 1) % buttons.length;
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                if (e.key === 'Home') nextIndex = 0;
                if (e.key === 'End') nextIndex = buttons.length - 1;
                const nextPreset = presetFrequencies[nextIndex];
                if (nextPreset) {
                  handlePresetSelect(nextPreset.value);
                  buttons[nextIndex].focus();
                }
              }, [currentFrequency, presetFrequencies, handlePresetSelect])}
            >
              {presetFrequencies.map((preset) => {
                const selected = currentFrequency === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    className={`p-3 rounded text-left transition-colors ${
                      selected
                        ? 'bg-cosmic-purple text-white'
                        : 'bg-cosmic-dark border border-cosmic-purple text-cosmic-silver hover:bg-cosmic-purple/20'
                    }`}
                    role="radio"
                    aria-checked={selected ? 'true' : 'false'}
                    tabIndex={selected ? 0 : -1}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="custom-frequency" className="block text-cosmic-silver mb-2">
              Custom Frequency (Hz)
            </label>
            <div className="flex gap-2">
              <input
                id="custom-frequency"
                type="number"
                min="20"
                max="20000"
                value={customFrequency}
                onChange={(e) => setCustomFrequency(Number(e.target.value))}
                className="flex-1 p-3 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
                aria-describedby="frequency-help"
              />
              <Button onClick={handleCustomFrequencySubmit}>
                Apply
              </Button>
            </div>
            <p id="frequency-help" className="text-sm text-cosmic-silver mt-1">
              Enter a frequency between 20 Hz and 20,000 Hz
            </p>
          </div>
        </div>
      </Card>

      <Card title="Duration & Controls" className="bg-cosmic-dark/50">
        <div className="space-y-4">
          <div>
            <label htmlFor="duration" className="block text-cosmic-silver mb-2">
              Duration (minutes)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="w-full p-3 rounded bg-cosmic-dark border border-cosmic-purple text-cosmic-silver"
            />
          </div>

          <div className="text-center">
            <Button
              onClick={onPlayPause}
              variant={isPlaying ? "secondary" : "primary"}
              className="w-full sm:w-auto"
            >
              {isPlaying ? 'Pause Session' : 'Start Session'}
            </Button>
          </div>

          <div className="text-center text-cosmic-silver">
            <p>Current Frequency: <span className="text-cosmic-gold">{currentFrequency} Hz</span></p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FrequencyControls;
