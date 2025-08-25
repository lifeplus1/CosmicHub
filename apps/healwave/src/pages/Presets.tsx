import React, { useState } from 'react';
import { devConsole } from '../config/devConsole';

import { AudioSettings, FrequencyPreset } from '@cosmichub/frequency';
import PresetSelector from '../components/PresetSelector';

const Presets: React.FC = () => {
  const [currentSettings] = useState<AudioSettings>({
    volume: 50,
    duration: 10,
    fadeIn: 3,
    fadeOut: 3,
  });
  const [currentPreset, setCurrentPreset] = useState<FrequencyPreset | null>(
    null
  );

  const handleSelectPreset = (preset: FrequencyPreset): void => {
    // Debug selection (development only)
    devConsole.info('Selected preset:', preset);
    setCurrentPreset(preset);
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8 text-center'>Frequency Presets</h1>
      <PresetSelector
        onSelectPreset={handleSelectPreset}
        currentSettings={currentSettings}
        currentPreset={currentPreset}
      />
    </div>
  );
};

export default Presets;
