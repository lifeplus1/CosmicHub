import React, { useCallback } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { AnimatePresence, motion } from 'framer-motion';
import { FREQUENCY_CONSTANTS } from '../constants/frequencyConstants';

interface BinauralControlsProps {
  binauralEnabled: boolean;
  binauralBeat: number;
  onBinauralEnabledChange: (enabled: boolean) => void;
  onBinauralBeatChange: (beat: number) => void;
}

export const BinauralControls: React.FC<BinauralControlsProps> = ({
  binauralEnabled,
  binauralBeat,
  onBinauralEnabledChange,
  onBinauralBeatChange,
}) => {
  const handleBinauralBeatChange = useCallback((values: number[]) => {
    const beat = values[0] ?? 0;
    onBinauralBeatChange(beat);
  }, [onBinauralBeatChange]);

  return (
    <div className="cosmic-glass p-6 rounded-xl border border-cosmic-purple/30">
      <h3 className="text-lg font-semibold text-cosmic-gold mb-4">🎧 Binaural</h3>
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={binauralEnabled}
            onChange={(e) => onBinauralEnabledChange(e.target.checked)}
            className="rounded border-cosmic-purple/30 bg-cosmic-purple/10"
          />
          <span className="text-cosmic-silver">Enable Beats</span>
        </label>

        <AnimatePresence>
          {binauralEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm text-cosmic-silver mb-2">
                Beat: {binauralBeat.toFixed(1)} Hz
              </label>
              <Slider.Root
                value={[binauralBeat]}
                onValueChange={handleBinauralBeatChange}
                min={FREQUENCY_CONSTANTS.MIN_BINAURAL_BEAT}
                max={FREQUENCY_CONSTANTS.MAX_BINAURAL_BEAT}
                step={FREQUENCY_CONSTANTS.BINAURAL_BEAT_STEP}
                className="relative flex items-center w-full h-5"
              >
                <Slider.Track className="relative flex-1 h-2 bg-white/20 rounded-full">
                  <Slider.Range className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform" />
              </Slider.Root>
              <div className="text-xs text-cosmic-silver mt-1">
                Use stereo headphones
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
