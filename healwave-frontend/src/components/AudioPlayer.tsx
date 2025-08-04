import React, { useRef, useEffect, useState, useCallback, memo } from 'react';

interface AudioPlayerProps {
  frequency?: number;
  volume?: number;
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  binauralBeat?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = memo(({
  frequency = 440,
  volume = 0.5,
  isPlaying = false,
  onPlayStateChange,
  binauralBeat
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const mergerRef = useRef<ChannelMergerNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error('Web Audio API not supported in this browser');
        }

        audioContextRef.current = new AudioContextClass();
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setIsInitialized(true);
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize audio';
      setError(errorMessage);
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  const createAudioNodes = useCallback(() => {
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;

    try {
      leftOscillatorRef.current = context.createOscillator();
      rightOscillatorRef.current = context.createOscillator();

      leftGainRef.current = context.createGain();
      rightGainRef.current = context.createGain();

      mergerRef.current = context.createChannelMerger(2);

      const leftFreq = frequency;
      const rightFreq = binauralBeat ? frequency + binauralBeat : frequency;

      leftOscillatorRef.current.frequency.setValueAtTime(leftFreq, context.currentTime);
      rightOscillatorRef.current.frequency.setValueAtTime(rightFreq, context.currentTime);

      leftOscillatorRef.current.type = 'sine';
      rightOscillatorRef.current.type = 'sine';

      const attackTime = 0.1;
      leftGainRef.current.gain.setValueAtTime(0, context.currentTime);
      leftGainRef.current.gain.linearRampToValueAtTime(volume, context.currentTime + attackTime);
      
      rightGainRef.current.gain.setValueAtTime(0, context.currentTime);
      rightGainRef.current.gain.linearRampToValueAtTime(volume, context.currentTime + attackTime);

      leftOscillatorRef.current.connect(leftGainRef.current);
      rightOscillatorRef.current.connect(rightGainRef.current);
      
      leftGainRef.current.connect(mergerRef.current, 0, 0);
      rightGainRef.current.connect(mergerRef.current, 0, 1);
      
      mergerRef.current.connect(context.destination);

      leftOscillatorRef.current.start();
      rightOscillatorRef.current.start();

      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create audio nodes';
      setError(errorMessage);
      console.error('Failed to create audio nodes:', error);
    }
  }, [frequency, binauralBeat, volume]);

  const stopAudio = useCallback(() => {
    if (!audioContextRef.current) return;

    try {
      const context = audioContextRef.current;
      const fadeTime = 0.1;

      if (leftGainRef.current) {
        leftGainRef.current.gain.linearRampToValueAtTime(0, context.currentTime + fadeTime);
      }
      if (rightGainRef.current) {
        rightGainRef.current.gain.linearRampToValueAtTime(0, context.currentTime + fadeTime);
      }

      setTimeout(() => {
        if (leftOscillatorRef.current) {
          try {
            leftOscillatorRef.current.stop();
            leftOscillatorRef.current.disconnect();
          } catch (e) {
            // Oscillator may have already stopped
          }
          leftOscillatorRef.current = null;
        }
        
        if (rightOscillatorRef.current) {
          try {
            rightOscillatorRef.current.stop();
            rightOscillatorRef.current.disconnect();
          } catch (e) {
            // Oscillator may have already stopped
          }
          rightOscillatorRef.current = null;
        }

        if (leftGainRef.current) {
          leftGainRef.current.disconnect();
          leftGainRef.current = null;
        }
        if (rightGainRef.current) {
          rightGainRef.current.disconnect();
          rightGainRef.current = null;
        }
        if (mergerRef.current) {
          mergerRef.current.disconnect();
          mergerRef.current = null;
        }
      }, fadeTime * 1000);

    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      initializeAudio();
      return;
    }

    if (isPlaying) {
      createAudioNodes();
    } else {
      stopAudio();
    }
  }, [isPlaying, isInitialized, createAudioNodes, stopAudio, initializeAudio]);

  useEffect(() => {
    if (!isPlaying || !leftOscillatorRef.current || !rightOscillatorRef.current) return;

    const context = audioContextRef.current;
    if (!context) return;

    const leftFreq = frequency;
    const rightFreq = binauralBeat ? frequency + binauralBeat : frequency;

    leftOscillatorRef.current.frequency.setTargetAtTime(leftFreq, context.currentTime, 0.1);
    rightOscillatorRef.current.frequency.setTargetAtTime(rightFreq, context.currentTime, 0.1);
  }, [frequency, binauralBeat, isPlaying]);

  useEffect(() => {
    if (!isPlaying || !leftGainRef.current || !rightGainRef.current) return;

    const context = audioContextRef.current;
    if (!context) return;

    leftGainRef.current.gain.setTargetAtTime(volume, context.currentTime, 0.1);
    rightGainRef.current.gain.setTargetAtTime(volume, context.currentTime, 0.1);
  }, [volume, isPlaying]);

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, [stopAudio]);

  useEffect(() => {
    if (error && onPlayStateChange) {
      onPlayStateChange(false);
    }
  }, [error, onPlayStateChange]);

  if (error) {
    console.warn('AudioPlayer Error:', error);
  }

  return null;
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
