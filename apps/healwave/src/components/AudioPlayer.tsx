import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
// eslint-disable-next-line no-console
const devConsole = {
  // eslint-disable-next-line no-console
  log: (...args: unknown[]) => { if (import.meta.env.DEV) { console.log(...args); } },
  // eslint-disable-next-line no-console
  warn: (...args: unknown[]) => { if (import.meta.env.DEV) { console.warn(...args); } },
  // eslint-disable-next-line no-console
  error: (...args: unknown[]) => { console.error(...args); }
};
interface ExtendedWindow extends Window { webkitAudioContext?: typeof AudioContext; AudioContext: typeof AudioContext }

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
      if (audioContextRef.current === null) {
  const win = window as unknown as ExtendedWindow;
  const AudioContextClass = (win.AudioContext || win.webkitAudioContext);
        if (AudioContextClass == null) {
          throw new Error('Web Audio API not supported in this browser');
        }

        audioContextRef.current = new AudioContextClass();
        
        if (audioContextRef.current !== null && audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        setIsInitialized(true);
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize audio';
      setError(errorMessage);
  devConsole.error('Failed to initialize audio context:', error);
    }
  }, []);

  const createAudioNodes = useCallback(() => {
  if (audioContextRef.current === null) return;

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
  devConsole.error('Failed to create audio nodes:', error);
    }
  }, [frequency, binauralBeat, volume]);

  const stopAudio = useCallback(() => {
    if (audioContextRef.current == null) return;

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
          } catch {
            // Oscillator may have already stopped
          }
          leftOscillatorRef.current = null;
        }
        
        if (rightOscillatorRef.current) {
          try {
            rightOscillatorRef.current.stop();
            rightOscillatorRef.current.disconnect();
          } catch {
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
  devConsole.error('Error stopping audio:', error);
    }
  }, []);

  useEffect(() => {
  if (isInitialized === false) {
  // Intentionally fire-and-forget; lifecycle initialization
  void initializeAudio();
      return;
    }

    if (isPlaying) {
      createAudioNodes();
    } else {
      stopAudio();
    }
  }, [isPlaying, isInitialized, createAudioNodes, stopAudio, initializeAudio]);

  useEffect(() => {
  if (isPlaying === false || leftOscillatorRef.current === null || rightOscillatorRef.current === null) return;

    const context = audioContextRef.current;
    if (!context) return;

    const leftFreq = frequency;
    const rightFreq = binauralBeat ? frequency + binauralBeat : frequency;

    leftOscillatorRef.current.frequency.setTargetAtTime(leftFreq, context.currentTime, 0.1);
    rightOscillatorRef.current.frequency.setTargetAtTime(rightFreq, context.currentTime, 0.1);
  }, [frequency, binauralBeat, isPlaying]);

  useEffect(() => {
  if (isPlaying === false || leftGainRef.current === null || rightGainRef.current === null) return;

    const context = audioContextRef.current;
    if (!context) return;

    leftGainRef.current.gain.setTargetAtTime(volume, context.currentTime, 0.1);
    rightGainRef.current.gain.setTargetAtTime(volume, context.currentTime, 0.1);
  }, [volume, isPlaying]);

  useEffect(() => {
    return () => {
      stopAudio();
  if (audioContextRef.current !== null) {
  // Close returns a promise; ensure we surface unexpected errors but don't block unmount
  audioContextRef.current.close().catch(devConsole.error);
      }
    };
  }, [stopAudio]);

  useEffect(() => {
  if (error !== null && onPlayStateChange !== undefined) {
      onPlayStateChange(false);
    }
  }, [error, onPlayStateChange]);

  if (error) {
  devConsole.warn?.('AudioPlayer Error:', error);
  }

  return null;
});

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;