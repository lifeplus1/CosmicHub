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
  const [customFrequency, setCustomFrequency] = useState<number>(currentFrequency);
  const radioGroupRef = useRef<HTMLDivElement | null>(null);
  const groupLabelId = useId();
  const customFrequencyId = useId();
  const durationId = useId();

  const presetFrequencies = React.useMemo(() => [
    { name: '396 Hz - Root Chakra', value: 396 },
    { name: '417 Hz - Sacral Chakra', value: 417 },
    { name: '528 Hz - Solar Plexus', value: 528 },
    { name: '639 Hz - Heart Chakra', value: 639 },
    { name: '741 Hz - Throat Chakra', value: 741 },
    { name: '852 Hz - Third Eye', value: 852 },
    { name: '963 Hz - Crown Chakra', value: 963 }
  ], []);

  const handlePresetSelect = useCallback((frequency: number) => {
    setCustomFrequency(frequency);
    onFrequencyChange(frequency);
  }, [onFrequencyChange]);

  const handleCustomFrequencySubmit = () => {
    onFrequencyChange(customFrequency);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-cosmic-dark/50">
        <div className="space-y-4">
          <h3 className="mb-4 text-lg font-semibold text-cosmic-gold">Frequency Selection</h3>
          <div role="group" aria-labelledby={groupLabelId}>
            <div id={groupLabelId} className="block mb-2 text-cosmic-silver">Preset Frequencies</div>
            <div
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="radiogroup"
              aria-labelledby={groupLabelId}
              ref={radioGroupRef}
              tabIndex={0}
              onKeyDown={useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
                const keys = ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'];
                if (!keys.includes(e.key)) return;
                e.preventDefault();

                if (radioGroupRef.current === null) return;
                const buttons = radioGroupRef.current.querySelectorAll<HTMLButtonElement>('button[role="radio"]');
                if (buttons.length === 0) return;

                const idx = presetFrequencies.findIndex(p => p.value === currentFrequency);
                const currentIndex = idx >= 0 ? idx : 0;
                let nextIndex = currentIndex;

                switch (e.key) {
                  case 'ArrowRight':
                  case 'ArrowDown':
                    nextIndex = (currentIndex + 1) % buttons.length;
                    break;
                  case 'ArrowLeft':
                  case 'ArrowUp':
                    nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                    break;
                  case 'Home':
                    nextIndex = 0;
                    break;
                  case 'End':
                    nextIndex = buttons.length - 1;
                    break;
                }

                const nextPreset = presetFrequencies[nextIndex];
                if (nextPreset !== undefined) {
                  handlePresetSelect(nextPreset.value);
                  buttons[nextIndex].focus();
                }
              }, [currentFrequency, presetFrequencies, handlePresetSelect])}
            >
              {presetFrequencies.map((preset) => {
                const selected = currentFrequency === preset.value;
                return selected ? (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    className="p-3 rounded text-left transition-colors bg-cosmic-purple text-white"
                    role="radio"
                    aria-checked="true"
                    tabIndex={0}
                  >
                    {preset.name}
                  </button>
                ) : (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetSelect(preset.value)}
                    className="p-3 rounded text-left transition-colors bg-cosmic-dark border border-cosmic-purple text-cosmic-silver hover:bg-cosmic-purple/20"
                    role="radio"
                    aria-checked="false"
                    tabIndex={-1}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor={customFrequencyId} className="block mb-2 text-cosmic-silver">
              Custom Frequency (Hz)
            </label>
            <div className="flex gap-2">
              <input
                id={customFrequencyId}
                type="number"
                min="20"
                max="20000"
                value={customFrequency}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  if (!Number.isNaN(newValue)) {
                    setCustomFrequency(newValue);
                  }
                }}
                className="flex-1 p-3 border rounded bg-cosmic-dark border-cosmic-purple text-cosmic-silver"
                aria-describedby="frequency-help"
              />
              <Button onClick={handleCustomFrequencySubmit}>
                Apply
              </Button>
            </div>
            <p id="frequency-help" className="mt-1 text-sm text-cosmic-silver">
              Enter a frequency between 20 Hz and 20,000 Hz
            </p>
          </div>
        </div>
      </Card>

      <Card className="bg-cosmic-dark/50">
        <div className="space-y-4">
          <h3 className="mb-4 text-lg font-semibold text-cosmic-gold">Duration & Controls</h3>
          <div>
            <label htmlFor={durationId} className="block mb-2 text-cosmic-silver">
              Duration (minutes)
            </label>
            <input
              id={durationId}
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (!Number.isNaN(newValue)) {
                  onDurationChange(newValue);
                }
              }}
              className="w-full p-3 border rounded bg-cosmic-dark border-cosmic-purple text-cosmic-silver"
            />
          </div>

          <div className="text-center">
            <Button
              onClick={onPlayPause}
              variant={isPlaying ? "secondary" : "primary"}
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
