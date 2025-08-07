import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@cosmichub/ui';

interface AudioPlayerProps {
  frequency: number;
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  frequency,
  isPlaying,
  volume,
  onVolumeChange
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && isPlaying) {
      initializeAudio();
    }

    if (isInitialized) {
      if (isPlaying) {
        startAudio();
      } else {
        stopAudio();
      }
    }

    return () => {
      cleanup();
    };
  }, [isPlaying, frequency, isInitialized]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current?.currentTime || 0);
    }
  }, [volume]);

  const initializeAudio = () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  };

  const startAudio = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      oscillatorRef.current = audioContextRef.current.createOscillator();
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillatorRef.current.connect(gainNodeRef.current);
      oscillatorRef.current.start();
    } catch (error) {
      console.error('Failed to start audio:', error);
    }
  };

  const stopAudio = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (error) {
        console.error('Failed to stop audio:', error);
      }
    }
  };

  const cleanup = () => {
    stopAudio();
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsInitialized(false);
  };

  return (
    <Card title="Audio Player" className="bg-cosmic-dark/50">
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className={`w-full h-full rounded-full border-4 transition-colors ${
              isPlaying 
                ? 'border-cosmic-gold animate-pulse bg-cosmic-gold/20' 
                : 'border-cosmic-purple bg-cosmic-purple/20'
            }`}>
              <div className="w-full h-full flex items-center justify-center">
                {isPlaying ? (
                  <div className="flex space-x-1">
                    <div className="w-1 h-6 bg-cosmic-gold animate-pulse"></div>
                    <div className="w-1 h-4 bg-cosmic-gold animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-6 bg-cosmic-gold animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  <div className="w-0 h-0 border-l-4 border-l-cosmic-purple border-y-4 border-y-transparent ml-1"></div>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-cosmic-silver">
            {isPlaying ? 'Playing' : 'Stopped'} - {frequency} Hz
          </p>
        </div>

        <div>
          <label htmlFor="volume" className="block text-cosmic-silver mb-2">
            Volume: {volume}%
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-full accent-cosmic-purple"
            aria-label="Volume control"
          />
        </div>
      </div>
    </Card>
  );
};

export default AudioPlayer;
