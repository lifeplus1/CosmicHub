import React from 'react';

interface MiniPlayerProps {
  isPlaying: boolean;
  title: string;
  subtitle?: string;
  onStop: () => void;
  className?: string;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  isPlaying,
  title,
  subtitle,
  onStop,
  className = '',
}) => {
  if (!isPlaying) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6 ${className}`}
      role="region"
      aria-label="Now Playing"
    >
      <div className="mx-auto max-w-3xl rounded-xl border border-white/15 bg-black/60 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">{title}</div>
            {subtitle ? (
              <div className="truncate text-xs text-white/70">{subtitle}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#healwave-session-settings"
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              Open Details
            </a>
            <button
              type="button"
              onClick={onStop}
              className="rounded-lg bg-gradient-to-r from-red-500 to-pink-500 px-4 py-1.5 text-sm font-medium text-white shadow-lg transition-colors hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Stop playback"
            >
              Stop Playback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
