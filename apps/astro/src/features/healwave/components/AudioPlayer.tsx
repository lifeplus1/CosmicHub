import React, { useEffect, useRef, useState } from 'react';
import { devConsole } from '../../../config/environment';
import { Card } from '@cosmichub/ui';
import styles from './AudioPlayer.module.css';

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
    if (gainNodeRef.current !== null && gainNodeRef.current !== undefined) {
      const currentTime = audioContextRef.current?.currentTime ?? 0;
      gainNodeRef.current.gain.setValueAtTime(volume / 100, currentTime);
    }
  }, [volume]);

  const initializeAudio = () => {
    try {
      const AudioContextClass = window.AudioContext ?? (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
      setIsInitialized(true);
    } catch (error) {
      devConsole.error('❌ Failed to initialize audio context:', error);
    }
  };

  const startAudio = () => {
    if (audioContextRef.current === null || audioContextRef.current === undefined || 
        gainNodeRef.current === null || gainNodeRef.current === undefined) return;

    try {
      if (oscillatorRef.current !== null && oscillatorRef.current !== undefined) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      }

      oscillatorRef.current = audioContextRef.current.createOscillator();
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillatorRef.current.connect(gainNodeRef.current);
      oscillatorRef.current.start();
    } catch (error) {
      devConsole.error('❌ Failed to start audio:', error);
    }
  };

  const stopAudio = () => {
    if (oscillatorRef.current !== null && oscillatorRef.current !== undefined) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (error) {
        devConsole.error('❌ Failed to stop audio:', error);
      }
    }
  };

  const cleanup = () => {
    stopAudio();
    if (audioContextRef.current !== null && audioContextRef.current !== undefined && 
        audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsInitialized(false);
  };

  return (
    <Card title="Audio Player" className="bg-cosmic-dark/50">
      <div className={styles['player-container']}>
        <div className="text-center">
          <div className={`${styles['audio-circle']} ${
            isPlaying 
              ? styles['audio-circle-playing'] 
              : styles['audio-circle-stopped']
          }`}>
            <div className={styles['circle-content']}>
              {isPlaying ? (
                <div className={styles['audio-bars']}>
                  <div className={`${styles['audio-bar']} ${styles['audio-bar-1']}`}></div>
                  <div className={`${styles['audio-bar']} ${styles['audio-bar-2']}`}></div>
                  <div className={`${styles['audio-bar']} ${styles['audio-bar-3']}`}></div>
                </div>
              ) : (
                <div className={styles['play-button']}></div>
              )}
            </div>
          </div>
          
          <p className={styles['status-text']}>
            {isPlaying ? 'Playing' : 'Stopped'} - {frequency} Hz
          </p>
        </div>

        <div className={styles['volume-section']}>
          <label htmlFor="volume" className={styles['volume-label']}>
            Volume: {volume}%
          </label>
          <input
            id="volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className={styles['volume-slider']}
            aria-label="Volume control"
          />
        </div>
      </div>
    </Card>
  );
};

export default AudioPlayer;
