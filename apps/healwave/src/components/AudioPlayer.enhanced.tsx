/**
 * Enhanced AudioPlayer Component
 * Following CosmicHub Component Best Practices Checklist
 */

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  memo,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import { logger } from '@cosmichub/config';
import { 
  FrequencyValue, 
  Volume, 
  AudioError,
  VolumeSchema,
  AudioErrorSchema,
  validateFrequency,
} from '../schemas/frequency.schema';
import ErrorBoundary from './ErrorBoundary';

// Component-specific logger following logging best practices
const audioLogger = logger.child ? logger.child({ module: 'AudioPlayer' }) : logger;

// Extended Window interface for Web Audio API compatibility
interface ExtendedWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
  AudioContext: typeof AudioContext;
}

// Comprehensive prop interface with TypeScript strict mode
interface AudioPlayerProps {
  /** Primary frequency in Hz (0.1 - 20000) */
  frequency?: FrequencyValue;
  /** Audio volume (0.0 - 1.0) */
  volume?: Volume;
  /** Current playing state */
  isPlaying?: boolean;
  /** Callback for play state changes */
  onPlayStateChange?: (isPlaying: boolean) => void;
  /** Optional binaural beat frequency difference */
  binauralBeat?: FrequencyValue;
  /** Fade in duration in seconds */
  fadeInDuration?: number;
  /** Fade out duration in seconds */
  fadeOutDuration?: number;
  /** Error handler callback */
  onError?: (error: AudioError) => void;
  /** Audio context resume callback */
  onAudioContextResume?: () => void;
  /** Enable fade effects */
  enableFade?: boolean;
  /** Component accessibility label */
  'aria-label'?: string;
  /** Test ID for component testing */
  'data-testid'?: string;
}

// Imperative handle interface for ref access
interface AudioPlayerRef {
  play: () => Promise<void>;
  stop: () => void;
  setFrequency: (frequency: FrequencyValue) => void;
  setVolume: (volume: Volume) => void;
  getAudioContext: () => AudioContext | null;
  getAnalyzer: () => AnalyserNode | null;
}

// Audio engine state interface
interface AudioEngineState {
  audioContext: AudioContext | null;
  leftOscillator: OscillatorNode | null;
  rightOscillator: OscillatorNode | null;
  leftGain: GainNode | null;
  rightGain: GainNode | null;
  merger: ChannelMergerNode | null;
  analyzer: AnalyserNode | null;
}

/**
 * Enhanced AudioPlayer Component
 * 
 * Features:
 * - Type-safe props with Zod validation
 * - Memory leak prevention with proper cleanup
 * - Accessibility support (ARIA labels, keyboard navigation)
 * - Error boundaries and comprehensive error handling
 * - Performance optimization with React.memo and useCallback
 * - Imperative API through forwardRef
 * - Binaural beat support for brainwave entrainment
 * - Fade in/out effects for smooth audio transitions
 * - Real-time frequency analysis capability
 */
const AudioPlayerInner = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  (
    {
      frequency = 440,
      volume = 0.5,
      isPlaying = false,
      onPlayStateChange,
      binauralBeat,
      fadeInDuration = 0.5,
      fadeOutDuration = 0.5,
      onError,
      onAudioContextResume,
      enableFade = true,
      'aria-label': ariaLabel = 'Audio frequency player',
      'data-testid': testId = 'audio-player',
    },
    ref
  ) => {
      // Validate props at runtime following Zod validation strategy
      const validatedFrequency = useMemo(() => {
        try {
          return validateFrequency(frequency);
        } catch (error) {
          // Defer logging to avoid state updates during render
          Promise.resolve().then(() => {
            audioLogger.warn('Invalid frequency provided, using default:', { frequency, error });
          });
          return 440;
        }
      }, [frequency]);

      const validatedVolume = useMemo(() => {
        try {
          return VolumeSchema.parse(volume);
        } catch (error) {
          // Defer logging to avoid state updates during render
          Promise.resolve().then(() => {
            audioLogger.warn('Invalid volume provided, using default:', { volume, error });
          });
          return 0.5;
        }
      }, [volume]);

  // Component state following single responsibility principle
  const [sessionState, setSessionState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error'>('idle');
  const [error, setError] = useState<AudioError | null>(null);
  const [_isInitialized, setIsInitialized] = useState(false);
  
  // Flag to prevent state updates during initial render
  const isMountedRef = useRef(false);
  
  // Use layout effect to set mounted flag immediately after render
  useLayoutEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);      // Audio engine refs for cleanup management
      const engineRef = useRef<AudioEngineState>({
        audioContext: null,
        leftOscillator: null,
        rightOscillator: null,
        leftGain: null,
        rightGain: null,
        merger: null,
        analyzer: null,
      });

  // Helper function for type-safe state checking
  const isDisabled = useMemo(() => {
    return ['loading', 'error'].includes(sessionState);
  }, [sessionState]);

  // Cleanup tracking for memory leak prevention
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);      // Error handler following error boundary pattern
      const handleError = useCallback(
        (code: AudioError['code'], message: string, details?: Record<string, unknown>) => {
          // Only proceed if component is mounted to avoid React warnings
          if (!isMountedRef.current) {
            return;
          }
          
          const audioError: AudioError = {
            code,
            message,
            details,
            timestamp: new Date().toISOString(),
          };

          try {
            AudioErrorSchema.parse(audioError);
          } catch (validationError) {
            audioLogger.error('Error schema validation failed:', validationError);
          }

          setError(audioError);
          setSessionState('error');
          onError?.(audioError);
          audioLogger.error('AudioPlayer error:', audioError);
        },
        [onError]
      );

      // Audio context initialization with browser compatibility
      const initializeAudioContext = useCallback(async (): Promise<AudioContext> => {
        try {
          const win = window as unknown as ExtendedWindow;
          const AudioContextClass = win.AudioContext || win.webkitAudioContext;

          if (!AudioContextClass) {
            throw new Error('Web Audio API not supported in this browser');
          }

          const context = new AudioContextClass();

          // Handle suspended audio context (user gesture requirement)
          if (context.state === 'suspended') {
            await context.resume();
            onAudioContextResume?.();
            audioLogger.info('Audio context resumed after user interaction');
          }

          return context;
        } catch (error) {
          throw new Error(`Failed to initialize audio context: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }, [onAudioContextResume]);

      // Create audio nodes with proper error handling
      const createAudioNodes = useCallback(
        (context: AudioContext) => {
          try {
            const leftOscillator = context.createOscillator();
            const rightOscillator = context.createOscillator();
            const leftGain = context.createGain();
            const rightGain = context.createGain();
            const merger = context.createChannelMerger(2);
            const analyzer = context.createAnalyser();

            // Configure analyzer for frequency analysis
            analyzer.fftSize = 2048;
            analyzer.smoothingTimeConstant = 0.8;

            // Configure oscillators
            leftOscillator.type = 'sine';
            rightOscillator.type = 'sine';

            // Set initial frequencies
            const leftFreq = validatedFrequency;
            const rightFreq = binauralBeat 
              ? validatedFrequency + validateFrequency(binauralBeat)
              : validatedFrequency;

            leftOscillator.frequency.setValueAtTime(leftFreq, context.currentTime);
            rightOscillator.frequency.setValueAtTime(rightFreq, context.currentTime);

            // Set initial volumes
            leftGain.gain.setValueAtTime(0, context.currentTime);
            rightGain.gain.setValueAtTime(0, context.currentTime);

            // Connect audio graph
            leftOscillator.connect(leftGain);
            rightOscillator.connect(rightGain);
            leftGain.connect(merger, 0, 0);
            rightGain.connect(merger, 0, 1);
            merger.connect(analyzer);
            analyzer.connect(context.destination);

            return {
              leftOscillator,
              rightOscillator,
              leftGain,
              rightGain,
              merger,
              analyzer,
            };
          } catch (error) {
            throw new Error(`Failed to create audio nodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        },
        [validatedFrequency, binauralBeat]
      );

      // Initialize audio engine
      const initializeAudio = useCallback(async () => {
        try {
          if (engineRef.current.audioContext) {
            return; // Already initialized
          }

          setSessionState('loading');

          const context = await initializeAudioContext();
          const nodes = createAudioNodes(context);

          engineRef.current = {
            audioContext: context,
            ...nodes,
          };

          setIsInitialized(true);
          setError(null);
          setSessionState('idle');

          audioLogger.info('Audio engine initialized successfully', {
            sampleRate: context.sampleRate,
            state: context.state,
          });
        } catch (error) {
          handleError(
            'AUDIO_CONTEXT_ERROR',
            error instanceof Error ? error.message : 'Failed to initialize audio',
            { error }
          );
        }
      }, [initializeAudioContext, createAudioNodes, handleError]);

      // Start audio playback with fade in
      const startAudio = useCallback(async () => {
        try {
          if (!engineRef.current.audioContext || !engineRef.current.leftOscillator) {
            await initializeAudio();
          }

          const { audioContext, leftOscillator, rightOscillator, leftGain, rightGain } = engineRef.current;

          if (!audioContext || !leftOscillator || !rightOscillator || !leftGain || !rightGain) {
            throw new Error('Audio nodes not available');
          }

          const now = audioContext.currentTime;

          // Start oscillators
          leftOscillator.start(now);
          rightOscillator.start(now);

          // Fade in volume
          if (enableFade) {
            leftGain.gain.setValueAtTime(0, now);
            rightGain.gain.setValueAtTime(0, now);
            leftGain.gain.linearRampToValueAtTime(validatedVolume, now + fadeInDuration);
            rightGain.gain.linearRampToValueAtTime(validatedVolume, now + fadeInDuration);
          } else {
            leftGain.gain.setValueAtTime(validatedVolume, now);
            rightGain.gain.setValueAtTime(validatedVolume, now);
          }

          setSessionState('playing');
          onPlayStateChange?.(true);

          audioLogger.info('Audio playback started', {
            frequency: validatedFrequency,
            volume: validatedVolume,
            binauralBeat,
          });
        } catch (error) {
          handleError(
            'PLAYBACK_ERROR',
            error instanceof Error ? error.message : 'Failed to start audio playback',
            { error }
          );
        }
      }, [
        initializeAudio,
        validatedVolume,
        validatedFrequency,
        binauralBeat,
        enableFade,
        fadeInDuration,
        onPlayStateChange,
        handleError,
      ]);

      // Stop audio playback with fade out
      const stopAudio = useCallback(() => {
        try {
          const { audioContext, leftOscillator, rightOscillator, leftGain, rightGain } = engineRef.current;

          if (!audioContext || !leftGain || !rightGain) {
            return;
          }

          const now = audioContext.currentTime;

          if (enableFade) {
            // Fade out volume
            leftGain.gain.setValueAtTime(leftGain.gain.value, now);
            rightGain.gain.setValueAtTime(rightGain.gain.value, now);
            leftGain.gain.linearRampToValueAtTime(0, now + fadeOutDuration);
            rightGain.gain.linearRampToValueAtTime(0, now + fadeOutDuration);

            // Stop oscillators after fade out
            setTimeout(() => {
              leftOscillator?.stop();
              rightOscillator?.stop();
            }, fadeOutDuration * 1000);
          } else {
            leftGain.gain.setValueAtTime(0, now);
            rightGain.gain.setValueAtTime(0, now);
            leftOscillator?.stop();
            rightOscillator?.stop();
          }

          setSessionState('stopped');
          onPlayStateChange?.(false);

          audioLogger.info('Audio playback stopped');
        } catch (error) {
          handleError(
            'PLAYBACK_ERROR',
            error instanceof Error ? error.message : 'Failed to stop audio playback',
            { error }
          );
        }
      }, [enableFade, fadeOutDuration, onPlayStateChange, handleError]);

      // Update frequency during playback
      const updateFrequency = useCallback(
        (newFrequency: FrequencyValue) => {
          try {
            const validatedNewFreq = validateFrequency(newFrequency);
            const { audioContext, leftOscillator, rightOscillator } = engineRef.current;

            if (audioContext && leftOscillator && rightOscillator) {
              const now = audioContext.currentTime;
              const leftFreq = validatedNewFreq;
              const rightFreq = binauralBeat 
                ? validatedNewFreq + validateFrequency(binauralBeat)
                : validatedNewFreq;

              leftOscillator.frequency.setValueAtTime(leftFreq, now);
              rightOscillator.frequency.setValueAtTime(rightFreq, now);

              audioLogger.debug('Frequency updated', { frequency: validatedNewFreq, binauralBeat });
            }
          } catch (error) {
            audioLogger.warn('Failed to update frequency:', error);
          }
        },
        [binauralBeat]
      );

      // Update volume during playback
      const updateVolume = useCallback((newVolume: Volume) => {
        try {
          const validatedNewVolume = VolumeSchema.parse(newVolume);
          const { audioContext, leftGain, rightGain } = engineRef.current;

          if (audioContext && leftGain && rightGain) {
            const now = audioContext.currentTime;
            leftGain.gain.setValueAtTime(validatedNewVolume, now);
            rightGain.gain.setValueAtTime(validatedNewVolume, now);

            audioLogger.debug('Volume updated', { volume: validatedNewVolume });
          }
        } catch (error) {
          audioLogger.warn('Failed to update volume:', error);
        }
      }, []);

      // Cleanup function for memory leak prevention
      const cleanup = useCallback(() => {
        try {
          const { audioContext, leftOscillator, rightOscillator } = engineRef.current;

          // Stop oscillators
          leftOscillator?.stop();
          rightOscillator?.stop();

          // Close audio context
          if (audioContext && audioContext.state !== 'closed') {
            void audioContext.close();
          }

          // Reset refs
          engineRef.current = {
            audioContext: null,
            leftOscillator: null,
            rightOscillator: null,
            leftGain: null,
            rightGain: null,
            merger: null,
            analyzer: null,
          };

          // Run additional cleanup functions
          cleanupFunctionsRef.current.forEach(fn => fn());
          cleanupFunctionsRef.current = [];

          setIsInitialized(false);
          setSessionState('idle');

          audioLogger.info('Audio engine cleanup completed');
        } catch (error) {
          audioLogger.error('Cleanup error:', error);
        }
      }, []);

      // Imperative API for ref access
      useImperativeHandle(
        ref,
        () => ({
          play: startAudio,
          stop: stopAudio,
          setFrequency: updateFrequency,
          setVolume: updateVolume,
          getAudioContext: () => engineRef.current.audioContext,
          getAnalyzer: () => engineRef.current.analyzer,
        }),
        [startAudio, stopAudio, updateFrequency, updateVolume]
      );

      // Effect for play state changes
      useEffect(() => {
        let mounted = true;
        
        const handlePlayStateChange = async () => {
          if (!mounted) return;
          
          if (isPlaying && sessionState !== 'playing') {
            await startAudio();
          } else if (!isPlaying && sessionState === 'playing') {
            stopAudio();
          }
        };

        handlePlayStateChange();
        
        return () => {
          mounted = false;
        };
      }, [isPlaying, sessionState, startAudio, stopAudio]);

      // Effect for frequency updates
      useEffect(() => {
        if (sessionState === 'playing') {
          // Defer frequency update to avoid state update during render
          const timeoutId = setTimeout(() => {
            updateFrequency(validatedFrequency);
          }, 0);
          
          return () => clearTimeout(timeoutId);
        }
        // No cleanup needed when not playing
        return undefined;
      }, [validatedFrequency, sessionState, updateFrequency]);

      // Effect for volume updates
      useEffect(() => {
        if (sessionState === 'playing') {
          // Defer volume update to avoid state update during render
          const timeoutId = setTimeout(() => {
            updateVolume(validatedVolume);
          }, 0);
          
          return () => clearTimeout(timeoutId);
        }
        // No cleanup needed when not playing
        return undefined;
      }, [validatedVolume, sessionState, updateVolume]);

      // Cleanup on unmount
      useEffect(() => {
        return cleanup;
      }, [cleanup]);

      // Render loading state
      if (sessionState === 'loading') {
        return (
          <div
            role="status"
            aria-label="Loading audio player"
            data-testid={`${testId}-loading`}
            className="audio-player audio-player--loading"
          >
            <span className="sr-only">Loading audio player...</span>
            <div className="audio-player__spinner" aria-hidden="true" />
          </div>
        );
      }

      // Render error state
      if (error) {
        return (
          <div
            role="alert"
            aria-label="Audio player error"
            data-testid={`${testId}-error`}
            className="audio-player audio-player--error"
          >
            <p className="audio-player__error-message">
              Audio Error: {error.message}
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSessionState('idle');
              }}
              className="audio-player__retry-button"
              aria-label="Retry audio initialization"
            >
              Retry
            </button>
          </div>
        );
      }

      // Main component render
      return (
        <div
          role="region"
          aria-label={ariaLabel}
          data-testid={testId}
          className="audio-player"
          data-state={sessionState}
        >
          <div className="audio-player__status" aria-live="polite">
            <span className="sr-only">
              Audio player status: {sessionState}
              {sessionState === 'playing' && `, frequency ${validatedFrequency} Hz, volume ${Math.round(validatedVolume * 100)}%`}
            </span>
          </div>

          <div className="audio-player__controls">
            <button
              type="button"
              onClick={() => {
                if (sessionState === 'playing') {
                  void stopAudio();
                } else {
                  void startAudio();
                }
              }}
              disabled={isDisabled}
              className="audio-player__play-button"
              aria-label={sessionState === 'playing' ? 'Stop audio' : 'Play audio'}
              data-testid={`${testId}-play-button`}
            >
              {sessionState === 'playing' ? '⏹️' : '▶️'}
            </button>
          </div>

          <div className="audio-player__info">
            <div className="audio-player__frequency">
              Frequency: {validatedFrequency} Hz
            </div>
            {binauralBeat && (
              <div className="audio-player__binaural">
                Binaural Beat: {binauralBeat} Hz
              </div>
            )}
            <div className="audio-player__volume">
              Volume: {Math.round(validatedVolume * 100)}%
            </div>
          </div>
        </div>
      );
    }
  );

AudioPlayerInner.displayName = 'AudioPlayerInner';

// Memoize the component to prevent unnecessary re-renders
const AudioPlayer = memo(AudioPlayerInner);
AudioPlayer.displayName = 'AudioPlayer';

// Export with error boundary wrapper for production use
const AudioPlayerWithErrorBoundary: React.FC<AudioPlayerProps> = (props) => (
  <ErrorBoundary>
    <AudioPlayer {...props} />
  </ErrorBoundary>
);

export default AudioPlayerWithErrorBoundary;
export { AudioPlayer };
export type { AudioPlayerProps, AudioPlayerRef };
