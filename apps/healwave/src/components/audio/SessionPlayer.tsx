/**
 * HealWave Session Player Component
 * HEALWAVE-IMPLEMENTATION-ROADMAP Phase 1: Session Playback Integration
 * 
 * Integrates therapeutic session templates with the enhanced AudioPlayer
 * to provide multi-phase session management with progress tracking.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Local type definitions matching the session structure
interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  category: 'healing' | 'meditation' | 'focus' | 'sleep' | 'energy';
  phases: SessionPhase[];
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    author?: string;
  };
}

interface SessionPhase {
  id: string;
  name: string;
  frequency: number;
  volume: number;
  duration: number;
  waveform: string;
  transitionType: 'immediate' | 'linear' | 'exponential' | 'logarithmic';
  transitionDuration: number;
  spatialPosition?: {
    x: number;
    y: number;
    z: number;
  };
  biometricResponse?: boolean;
}

interface SessionPlayerProps {
  session: SessionTemplate;
  onSessionComplete?: () => void;
  onSessionStop?: () => void;
  onPhaseChange?: (phase: SessionPhase, phaseIndex: number) => void;
  className?: string;
}

type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed';

export function SessionPlayer({
  session,
  onSessionComplete,
  onSessionStop,
  onPhaseChange,
  className = ''
}: SessionPlayerProps) {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Audio context for generating therapeutic frequencies
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);

  const currentPhase = session.phases[currentPhaseIndex];

  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      // Type assertion for webkit compatibility
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  // Create oscillator for current phase
  const createOscillator = useCallback((phase: SessionPhase) => {
    if (!audioContextRef.current) return null;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = phase.waveform as OscillatorType;
    oscillator.frequency.setValueAtTime(phase.frequency, audioContextRef.current.currentTime);
    
    gainNode.gain.setValueAtTime(phase.volume, audioContextRef.current.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    return { oscillator, gainNode };
  }, []);

  // Apply spatial audio positioning
  const applySpatialAudio = useCallback((gainNode: GainNode, position?: { x: number; y: number; z: number }) => {
    if (!audioContextRef.current || !position) return;

    // Create panner node for spatial audio
    const pannerNode = audioContextRef.current.createPanner();
    pannerNode.panningModel = 'HRTF';
    pannerNode.distanceModel = 'inverse';
    pannerNode.refDistance = 1;
    pannerNode.maxDistance = 10000;
    pannerNode.rolloffFactor = 1;
    pannerNode.coneInnerAngle = 360;
    pannerNode.coneOuterAngle = 0;
    pannerNode.coneOuterGain = 0;

    // Set position
    pannerNode.positionX.setValueAtTime(position.x, audioContextRef.current.currentTime);
    pannerNode.positionY.setValueAtTime(position.y, audioContextRef.current.currentTime);
    pannerNode.positionZ.setValueAtTime(position.z, audioContextRef.current.currentTime);

    // Reconnect through panner
    gainNode.disconnect();
    gainNode.connect(pannerNode);
    pannerNode.connect(audioContextRef.current.destination);
  }, []);

  // Start a phase
  const startPhase = useCallback((phaseIndex: number) => {
    if (!audioContextRef.current) return;

    const phase = session.phases[phaseIndex];
    if (!phase) return;

    // Stop current oscillator if playing
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }

    // Create new oscillator for this phase
    const audioNodes = createOscillator(phase);
    if (!audioNodes) return;

    const { oscillator, gainNode } = audioNodes;
    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    // Apply spatial audio if specified
    if (phase.spatialPosition) {
      applySpatialAudio(gainNode, phase.spatialPosition);
    }

    // Handle transitions for continuous phases
    if (phaseIndex > 0 && phase.transitionType !== 'immediate') {
      const previousPhase = session.phases[phaseIndex - 1];
      if (previousPhase) {
        const transitionDuration = phase.transitionDuration;
        
        // Set initial frequency to previous phase frequency
        oscillator.frequency.setValueAtTime(previousPhase.frequency, audioContextRef.current.currentTime);
        
        // Transition to new frequency
        switch (phase.transitionType) {
          case 'linear':
            oscillator.frequency.linearRampToValueAtTime(
              phase.frequency, 
              audioContextRef.current.currentTime + transitionDuration
            );
            break;
          case 'exponential':
            oscillator.frequency.exponentialRampToValueAtTime(
              phase.frequency, 
              audioContextRef.current.currentTime + transitionDuration
            );
            break;
          case 'logarithmic': {
            // Simulate logarithmic curve with multiple linear segments
            const steps = 10;
            for (let i = 1; i <= steps; i++) {
              const t = (i / steps) * transitionDuration;
              const progress = Math.log(1 + (i / steps) * 9) / Math.log(10); // Log curve 0-1
              const freq = previousPhase.frequency + (phase.frequency - previousPhase.frequency) * progress;
              oscillator.frequency.setValueAtTime(freq, audioContextRef.current.currentTime + t);
            }
            break;
          }
        }
      }
    }

    // Start the oscillator
    oscillator.start();
    phaseStartTimeRef.current = Date.now();
    
    // Notify phase change
    onPhaseChange?.(phase, phaseIndex);
    
    // Schedule phase completion
    const phaseTimeout = window.setTimeout(() => {
      if (phaseIndex < session.phases.length - 1) {
        setCurrentPhaseIndex(phaseIndex + 1);
      } else {
        // Session complete
        stopSessionRef.current?.();
        setPlaybackState('completed');
        onSessionComplete?.();
      }
    }, phase.duration * 1000);

    timerRef.current = phaseTimeout;
  }, [session, createOscillator, applySpatialAudio, onPhaseChange, onSessionComplete]);

  // Start session
  const startSession = useCallback(async () => {
    await initializeAudio();
    setPlaybackState('playing');
    setCurrentPhaseIndex(0);
    setElapsedTime(0);
    setPhaseProgress(0);
    setTotalProgress(0);
    startTimeRef.current = Date.now();
    startPhase(0);
  }, [initializeAudio, startPhase]);

  // Pause session
  const pauseSession = useCallback(() => {
    if (playbackState === 'playing') {
      setPlaybackState('paused');
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        void audioContextRef.current.suspend();
      }
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [playbackState]);

  // Resume session
  const resumeSession = useCallback(async () => {
    if (playbackState === 'paused' && currentPhase) {
      setPlaybackState('playing');
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Calculate remaining time for current phase
      const now = Date.now();
      const phaseElapsed = (now - phaseStartTimeRef.current) / 1000;
      const phaseRemaining = Math.max(0, currentPhase.duration - phaseElapsed);
      
      // Schedule completion of current phase
      const phaseTimeout = window.setTimeout(() => {
        if (currentPhaseIndex < session.phases.length - 1) {
          setCurrentPhaseIndex(currentPhaseIndex + 1);
        } else {
          stopSessionRef.current?.();
          setPlaybackState('completed');
          onSessionComplete?.();
        }
      }, phaseRemaining * 1000);

      timerRef.current = phaseTimeout;
    }
  }, [playbackState, currentPhase, currentPhaseIndex, session.phases.length, onSessionComplete]);

  // Stop session - using ref to avoid circular dependencies
  const stopSessionRef = useRef<(() => void) | null>(null);
  
  const stopSession = useCallback(() => {
    setPlaybackState('idle');
    
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (audioContextRef.current) {
      void audioContextRef.current.suspend();
    }
    
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setTotalProgress(0);
    setElapsedTime(0);
    
    onSessionStop?.();
  }, [onSessionStop]);
  
  // Update ref when stopSession changes
  stopSessionRef.current = stopSession;

  // Update progress
  useEffect(() => {
    if (playbackState !== 'playing' || !currentPhase) return;

    const updateProgress = () => {
      const now = Date.now();
      const sessionElapsed = (now - startTimeRef.current) / 1000;
      const phaseElapsed = (now - phaseStartTimeRef.current) / 1000;
      
      setElapsedTime(sessionElapsed);
      setPhaseProgress(Math.min(1, phaseElapsed / currentPhase.duration));
      setTotalProgress(Math.min(1, sessionElapsed / session.totalDuration));
    };

    const progressInterval = setInterval(updateProgress, 100);
    return () => clearInterval(progressInterval);
  }, [playbackState, currentPhase, session.totalDuration]);

  // Start next phase when current phase index changes
  useEffect(() => {
    if (playbackState === 'playing' && currentPhaseIndex > 0) {
      startPhase(currentPhaseIndex);
    }
  }, [currentPhaseIndex, playbackState, startPhase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hours > 0) {
      return `${hours}:${remainingMins.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${mins}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className={`healwave-session-player bg-white rounded-lg shadow-lg ${className}`}>
      {/* Session Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session.name}</h2>
            <p className="text-gray-600 mt-1">{session.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>📅 {formatTotalTime(session.totalDuration)}</span>
              <span>🎵 {session.phases.length} phases</span>
              <span>📊 {session.difficulty}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round(totalProgress * 100)}%
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(elapsedTime)} / {formatTotalTime(session.totalDuration)}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      <div className="p-6">
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{Math.round(totalProgress * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            { }
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Current Phase */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Phase {currentPhaseIndex + 1}: {currentPhase?.name}
            </span>
            <span className="text-sm text-gray-500">{Math.round(phaseProgress * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            { }
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${phaseProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Phase Details */}
        {currentPhase && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Frequency</span>
                <div className="font-medium text-gray-900">{Math.round(currentPhase.frequency)} Hz</div>
              </div>
              <div>
                <span className="text-gray-500">Waveform</span>
                <div className="font-medium text-gray-900 capitalize">{currentPhase.waveform}</div>
              </div>
              <div>
                <span className="text-gray-500">Duration</span>
                <div className="font-medium text-gray-900">{formatTime(currentPhase.duration)}</div>
              </div>
              <div>
                <span className="text-gray-500">Volume</span>
                <div className="font-medium text-gray-900">{Math.round(currentPhase.volume * 100)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-center gap-4">
          {playbackState === 'idle' && (
            <button
              onClick={() => void startSession()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              ▶️ Start Session
            </button>
          )}
          
          {playbackState === 'playing' && (
            <button
              onClick={pauseSession}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              ⏸️ Pause
            </button>
          )}
          
          {playbackState === 'paused' && (
            <button
              onClick={() => void resumeSession()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              ▶️ Resume
            </button>
          )}
          
          {(playbackState === 'playing' || playbackState === 'paused') && (
            <button
              onClick={stopSession}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              ⏹️ Stop
            </button>
          )}
          
          {playbackState === 'completed' && (
            <div className="text-center">
              <div className="text-green-600 text-lg font-semibold mb-2">✅ Session Complete!</div>
              <button
                onClick={() => {
                  setPlaybackState('idle');
                  setCurrentPhaseIndex(0);
                  setPhaseProgress(0);
                  setTotalProgress(0);
                  setElapsedTime(0);
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start New Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Session Timeline</h3>
        <div className="space-y-2">
          {session.phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`flex items-center gap-3 p-2 rounded ${
                index === currentPhaseIndex
                  ? 'bg-indigo-50 border border-indigo-200'
                  : index < currentPhaseIndex
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${
                index === currentPhaseIndex
                  ? 'bg-indigo-500'
                  : index < currentPhaseIndex
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`} />
              <div className="flex-1">
                <span className="font-medium text-gray-900">{phase.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {Math.round(phase.frequency)} Hz • {formatTime(phase.duration)}
                </span>
              </div>
              {index === currentPhaseIndex && playbackState === 'playing' && (
                <div className="text-indigo-600 text-sm">Playing...</div>
              )}
              {index < currentPhaseIndex && (
                <div className="text-green-600 text-sm">✓ Complete</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SessionPlayer;
