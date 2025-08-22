import { useState, useEffect, useCallback } from 'react';

export interface HealwaveSession {
  id: string;
  frequency: number;
  duration: number;
  startTime: Date;
  isActive: boolean;
}

export interface HealwaveState {
  currentFrequency: number;
  isPlaying: boolean;
  volume: number;
  duration: number;
  timeRemaining: number;
  sessions: HealwaveSession[];
}

export const useHealwave = () => {
  const [state, setState] = useState<HealwaveState>({
    currentFrequency: 528,
    isPlaying: false,
    volume: 50,
    duration: 10,
    timeRemaining: 0,
    sessions: []
  });

  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  const setFrequency = useCallback((frequency: number) => {
    setState(prev => ({ ...prev, currentFrequency: frequency }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, volume }));
  }, []);

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration, timeRemaining: duration * 60 }));
  }, []);

  const startSession = useCallback(() => {
    const sessionId = `session-${Date.now()}`;
    const newSession: HealwaveSession = {
      id: sessionId,
      frequency: state.currentFrequency,
      duration: state.duration,
      startTime: new Date(),
      isActive: true
    };

    setState(prev => ({
      ...prev,
      isPlaying: true,
      timeRemaining: prev.duration * 60,
      sessions: [newSession, ...prev.sessions]
    }));

    const timer = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          return { ...prev, isPlaying: false, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    setIntervalId(timer);
  }, [state.currentFrequency, state.duration]);

  const stopSession = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (intervalId !== null && intervalId !== undefined) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const togglePlayPause = useCallback(() => {
    if (state.isPlaying) {
      stopSession();
    } else {
      startSession();
    }
  }, [state.isPlaying, startSession, stopSession]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getPersonalizedFrequency = useCallback((chartData?: Record<string, unknown>): number => {
    if (chartData === null || chartData === undefined || typeof chartData !== 'object') return 528; // Default to 528 Hz (Love frequency)
    
    // Simple personalization based on chart data
    // In a real implementation, this would use complex astrological calculations
  const sunData = (chartData as Record<string, unknown>)['sun'] as Record<string, unknown> | undefined;
  const sunSign = (typeof sunData === 'object' && sunData !== null && typeof sunData['sign'] === 'string') ? sunData['sign'] as string : 'Leo';
    const frequencyMap: Record<string, number> = {
      'Aries': 741,     // Throat Chakra - Expression
      'Taurus': 417,    // Sacral Chakra - Creativity
      'Gemini': 852,    // Third Eye - Communication
      'Cancer': 639,    // Heart Chakra - Emotions
      'Leo': 528,       // Solar Plexus - Confidence
      'Virgo': 396,     // Root Chakra - Grounding
      'Libra': 639,     // Heart Chakra - Balance
      'Scorpio': 741,   // Throat Chakra - Transformation
      'Sagittarius': 963, // Crown Chakra - Wisdom
      'Capricorn': 396, // Root Chakra - Structure
      'Aquarius': 852,  // Third Eye - Innovation
      'Pisces': 963     // Crown Chakra - Spirituality
    };

    return frequencyMap[sunSign] ?? 528;
  }, []);

  useEffect(() => {
    return () => {
      if (intervalId !== null && intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  useEffect(() => {
    if (state.timeRemaining === 0 && state.isPlaying) {
      stopSession();
    }
  }, [state.timeRemaining, state.isPlaying, stopSession]);

  return {
    ...state,
    setFrequency,
    setVolume,
    setDuration,
    startSession,
    stopSession,
    togglePlayPause,
    formatTime,
    getPersonalizedFrequency
  };
};
