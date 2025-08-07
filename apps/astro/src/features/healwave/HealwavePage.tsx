import React from "react";
import { useHealwave } from "./hooks/useHealwave";
import FrequencyControls from "./components/FrequencyControls";
import AudioPlayer from "./components/AudioPlayer";
import DurationTimer from "./components/DurationTimer";

const HealwavePage: React.FC = () => {
  const {
    currentFrequency,
    isPlaying,
    volume,
    duration,
    timeRemaining,
    setFrequency,
    setVolume,
    setDuration,
    togglePlayPause,
    formatTime
  } = useHealwave();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4">
          Healwave Frequency Generator
        </h1>
        <p className="text-xl text-cosmic-silver">
          Experience personalized healing frequencies based on your astrological chart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FrequencyControls
            onFrequencyChange={setFrequency}
            onDurationChange={setDuration}
            onPlayPause={togglePlayPause}
            isPlaying={isPlaying}
            currentFrequency={currentFrequency}
            duration={duration}
          />
        </div>

        <div className="space-y-6">
          <AudioPlayer
            frequency={currentFrequency}
            isPlaying={isPlaying}
            volume={volume}
            onVolumeChange={setVolume}
          />
          
          <DurationTimer
            timeRemaining={timeRemaining}
            totalDuration={duration * 60}
            formatTime={formatTime}
            isActive={isPlaying}
          />
        </div>
      </div>
    </div>
  );
};

export default HealwavePage;