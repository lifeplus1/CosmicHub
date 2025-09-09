import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EnhancedFrequencyGenerator } from '../components/EnhancedFrequencyGenerator';
import { ValidatedFrequencyData as FrequencyData } from '../schemas/frequencySchemas';
import { devConsole } from '../config/devConsole';
import CymaticVisualizer from '../components/CymaticVisualizer';

const FrequencyGenerator: React.FC = () => {
  const [sessionStats, setSessionStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    favoriteFrequency: null as number | null
  });

  // State for cymatics visualizer
  const [currentFrequency, setCurrentFrequency] = useState(528);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFrequencyChange = useCallback((frequency: number) => {
    devConsole.info('🎵 Frequency changed:', frequency);
    setCurrentFrequency(frequency);
  }, []);

  const handlePresetSelect = useCallback((preset: FrequencyData) => {
    devConsole.info('🎵 Preset selected:', preset);
    setCurrentFrequency(preset.frequency);
    setSessionStats(prev => ({
      ...prev,
      favoriteFrequency: preset.frequency,
      totalSessions: prev.totalSessions + 1
    }));
  }, []);

  const handleVolumeChange = useCallback((volume: number) => {
    devConsole.info('🔊 Volume changed:', volume);
  }, []);

  const handleDurationChange = useCallback((duration: number) => {
    devConsole.info('⏰ Duration changed:', duration);
    setSessionStats(prev => ({
      ...prev,
      totalDuration: prev.totalDuration + duration
    }));
  }, []);

  // Initialize audio context for cymatics visualizer
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        interface ExtendedWindow extends Window {
          webkitAudioContext?: typeof AudioContext;
        }
        const win = window as ExtendedWindow;
        const AudioContextClass = window.AudioContext || win.webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      } catch (error) {
        devConsole.warn('Failed to initialize audio context:', error);
      }
    };
    
    initAudioContext();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Track playing state from EnhancedFrequencyGenerator
  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-4xl font-bold mb-8 text-center bg-gradient-to-r from-cosmic-gold to-cosmic-purple bg-clip-text text-transparent'>
        Ultimate Frequency Generator
      </h1>

      {/* Enhanced Features Status */}
      <div className='mb-6 text-center'>
        <div className='inline-flex bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-1 border border-green-500/30'>
          <div className='px-6 py-3 rounded-md text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'>
            ✨ Ultimate Experience - All Features Unlocked 🎵
          </div>
        </div>
        <p className='text-sm text-cosmic-silver mt-3 max-w-2xl mx-auto'>
          Experience the most advanced frequency generator with D3.js visualization, 
          sacred geometry patterns, chakra alignment system, unlimited session duration, 
          and comprehensive preset library
        </p>
      </div>

      {/* Feature Highlights */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto'>
        {[
          { icon: '📊', title: 'D3.js Visualization', desc: 'Professional charts' },
          { icon: '🔮', title: 'Sacred Geometry', desc: 'Spiritual patterns' },
          { icon: '🌈', title: 'Chakra System', desc: '7 energy centers' },
          { icon: '⏰', title: 'Unlimited Time', desc: 'No restrictions' }
        ].map((feature, index) => (
          <div 
            key={index} 
            className='text-center p-4 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20'
          >
            <div className='text-2xl mb-2'>{feature.icon}</div>
            <div className='text-sm font-semibold text-white'>{feature.title}</div>
            <div className='text-xs text-cosmic-silver/70'>{feature.desc}</div>
          </div>
        ))}
      </div>

      <EnhancedFrequencyGenerator 
        onFrequencyChange={handleFrequencyChange}
        onPresetSelect={handlePresetSelect}
        onVolumeChange={handleVolumeChange}
        onDurationChange={handleDurationChange}
        onPlayStateChange={handlePlayStateChange}
        showVisualization={true}
        realTimeUpdates={true}
        className="max-w-7xl mx-auto"
      />

      {/* Cymatics Visualization */}
      <div className='mt-8 max-w-4xl mx-auto'>
        <div className='bg-cosmic-purple/10 rounded-lg p-6 border border-cosmic-purple/20'>
          <h3 className='text-xl font-semibold text-cosmic-gold mb-4 text-center'>
            🌊 Cymatics Visualization
          </h3>
          <p className='text-sm text-cosmic-silver/70 mb-6 text-center max-w-2xl mx-auto'>
            Watch how sound creates beautiful geometric patterns. This visualization shows the 
            vibration patterns that would form if the current frequency were played through sand or water.
          </p>
          <CymaticVisualizer
            frequency={currentFrequency}
            isPlaying={isPlaying}
            audioContext={audioContextRef.current || undefined}
          />
        </div>
      </div>

      

      {/* Session Statistics */}
      <div className='mt-8 max-w-2xl mx-auto'>
        <div className='bg-cosmic-purple/10 rounded-lg p-6 border border-cosmic-purple/20'>
          <h3 className='text-lg font-semibold text-cosmic-gold mb-4 text-center'>
            🏆 Your Healing Journey
          </h3>
          <div className='grid grid-cols-3 gap-4 text-center'>
            <div>
              <div className='text-2xl font-bold text-white'>{sessionStats.totalSessions}</div>
              <div className='text-xs text-cosmic-silver'>Total Sessions</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-cosmic-gold'>{Math.round(sessionStats.totalDuration)}</div>
              <div className='text-xs text-cosmic-silver'>Minutes Practiced</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-cyan-400'>
                {sessionStats.favoriteFrequency ? `${sessionStats.favoriteFrequency} Hz` : '---'}
              </div>
              <div className='text-xs text-cosmic-silver'>Favorite Frequency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyGenerator;
