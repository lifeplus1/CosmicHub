import React, { lazy, Suspense } from 'react';
import type { AudioPlayerProps } from './AudioPlayer.enhanced';

// Lazy load the AudioPlayer component to reduce bundle size
const AudioPlayerEnhanced = lazy(() => import('./AudioPlayer.enhanced'));

// Loading component for AudioPlayer
const AudioPlayerLoader: React.FC = () => (
  <div 
    className="audio-player audio-player--loading"
    data-testid="audio-player-loading"
    role="status"
    aria-label="Loading audio player"
  >
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
      <span className="ml-3 text-purple-200">Loading audio player...</span>
    </div>
  </div>
);

// Error boundary for failed AudioPlayer loading
const _AudioPlayerError: React.FC<{ error: Error }> = ({ error }) => (
  <div 
    className="audio-player audio-player--error"
    data-testid="audio-player-error"
    role="alert"
  >
    <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
      <h3 className="text-red-400 font-semibold mb-2">Audio Player Error</h3>
      <p className="text-red-300 text-sm">
        Failed to load audio player: {error.message}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
);

// Lazy AudioPlayer with proper error handling
const LazyAudioPlayer: React.FC<AudioPlayerProps> = (props) => {
  return (
    <Suspense fallback={<AudioPlayerLoader />}>
      <AudioPlayerEnhanced {...props} />
    </Suspense>
  );
};

export default LazyAudioPlayer;
export type { AudioPlayerProps };
