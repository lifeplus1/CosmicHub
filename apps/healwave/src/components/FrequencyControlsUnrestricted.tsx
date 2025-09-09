import React, { useState, useCallback } from 'react';
import { devConsole } from '../config/devConsole';
import { useAuth } from '@cosmichub/auth';
import { savePreset } from '../services/api';
import AudioPlayer from './AudioPlayer.lazy';
import DurationTimer from './DurationTimer';

/**
 * Unrestricted Frequency Controls for AB Testing
 * No subscription restrictions - all features available to all users
 */
const FrequencyControlsUnrestricted: React.FC = React.memo(() => {
  const { user: _user } = useAuth(); // Available for future use
  const [frequency] = useState(528);
  const [binaural] = useState(0);
  const [volume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(15);
  const [presetName, setPresetName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSessionComplete = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleDurationChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setDuration(parseInt(e.target.value));
  }, []);

  const handlePresetNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPresetName(e.target.value);
  }, []);

  const togglePresets = useCallback(() => {
    setShowPresets(!showPresets);
  }, [showPresets]);

  const handleSavePreset = useCallback(async () => {
    if (!presetName.trim()) return;
    try {
      const preset = {
        id: `custom-${Date.now()}`,
        name: presetName,
        category: 'custom' as const,
        baseFrequency: frequency,
        binauralBeat: binaural,
        description: `Custom preset saved on ${new Date().toLocaleDateString()}`,
        benefits: ['Custom healing frequency'],
        metadata: {
          duration: duration,
          volume: volume,
          createdAt: new Date().toISOString(),
        },
      };
      await savePreset(preset);
      setPresetName('');
      setShowPresets(false);
    } catch (error) {
      devConsole.error('Failed to save preset:', error);
    }
  }, [presetName, frequency, binaural, duration, volume]);

  return (
    <div className='space-y-8'>
      {/* AB Test Notice */}
      <div className="mb-4 p-3 bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/30 rounded-lg backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <span className="text-green-300">✨</span>
          <p className="text-sm font-medium text-green-200">
            AB Test Mode: All features unlocked - No subscription restrictions
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div className='space-y-2'>
          <label
            htmlFor='session-duration'
            className='block text-sm font-medium text-white/90'
          >
            Session Duration (minutes) - Unlimited ✨
          </label>
          <select
            id='session-duration'
            value={duration}
            onChange={handleDurationChange}
            className='w-full p-3 text-white transition-all border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
            aria-label='Select session duration'
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
            <option value={180}>3 hours</option>
          </select>
        </div>

        <div className='p-4 border bg-white/5 rounded-xl border-white/20'>
          <DurationTimer
            duration={duration}
            isActive={isPlaying}
            onComplete={handleSessionComplete}
          />
        </div>
      </div>

      <div className='flex flex-col items-center space-y-4'>
        <div className='flex space-x-4'>
          <button
            type="button"
            onClick={togglePlayback}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePlayback();
              }
            }}
            aria-label={isPlaying ? 'Stop healing session' : 'Start healing session'}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 ${
              isPlaying
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-red-500/25'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25'
            }`}
          >
            <span className='text-2xl'>{isPlaying ? '⏸️' : '▶️'}</span>
            <span>{isPlaying ? 'Stop' : 'Start'} Session</span>
          </button>
        </div>

        <div className='text-sm text-center text-white/70'>
          <p>
            Current: {frequency}Hz{' '}
            {binaural > 0 && `+ ${binaural}Hz binaural beat`}
          </p>
          <p>
            {duration} minute session • Volume: {Math.round(volume * 100)}%
          </p>
          <p className="text-green-300 font-medium">
            🚀 Premium Features Available - No Restrictions
          </p>
        </div>
      </div>

      {/* Custom Preset Creation - Always Available */}
      <div className='p-6 border bg-white/5 rounded-xl border-white/20'>
        <div className="mb-4 flex items-center space-x-2">
          <span className="text-green-300">✨</span>
          <span className="text-green-200 font-medium">Premium Feature Unlocked</span>
        </div>
        
        {!showPresets ? (
          <button
            type="button"
            onClick={togglePresets}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePresets();
              }
            }}
            aria-label="Show preset options"
            aria-expanded="false"
            className='flex items-center justify-between w-full p-3 text-white transition-all duration-200 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30'
          >
            <span className='font-semibold'>💾 Save Custom Preset</span>
            <span className='text-xl'>+</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={togglePresets}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePresets();
              }
            }}
            aria-label="Hide preset options"
            aria-expanded="true"
            className='flex items-center justify-between w-full p-3 text-white transition-all duration-200 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30'
          >
            <span className='font-semibold'>💾 Save Custom Preset</span>
            <span className='text-xl'>−</span>
          </button>
        )}

        {showPresets && (
          <div className='mt-4 space-y-4'>
            <input
              type='text'
              placeholder='Enter preset name...'
              value={presetName}
              onChange={handlePresetNameChange}
              aria-label='Preset name'
              className='w-full p-3 text-white transition-all border bg-white/10 backdrop-blur-sm border-white/20 rounded-xl placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent'
            />
            <button
              type="button"
              onClick={() => {
                void handleSavePreset();
              }}
              disabled={!presetName.trim()}
              aria-label='Save custom preset'
              className='w-full py-3 font-semibold text-white transition-all duration-200 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 rounded-xl disabled:cursor-not-allowed'
            >
              💾 Save Preset (Unlimited Storage)
            </button>
            <p className="text-xs text-cyan-300 text-center">
              ✨ Premium: Unlimited custom presets, export capabilities, high-quality audio
            </p>
          </div>
        )}
      </div>

      {/* Additional Premium Features Preview */}
      <div className='p-6 border bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 rounded-xl'>
        <h3 className="text-lg font-semibold text-purple-200 mb-4">
          🚀 All Premium Features Unlocked
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">Unlimited session duration</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">High-quality audio (48kHz)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">Custom preset creation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">Session recording</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">Advanced frequency library</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">Rife frequency database</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">Binaural beat controls</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <span className="text-sm text-white/80">Export & sharing capabilities</span>
            </div>
          </div>
        </div>
      </div>

      <div className='hidden'>
        <AudioPlayer
          frequency={frequency}
          volume={volume}
          isPlaying={isPlaying}
          binauralBeat={binaural}
          onPlayStateChange={setIsPlaying}
        />
      </div>
    </div>
  );
});

FrequencyControlsUnrestricted.displayName = 'FrequencyControlsUnrestricted';

export default FrequencyControlsUnrestricted;
