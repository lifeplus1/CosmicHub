import React, { useState, useEffect, useCallback, memo } from 'react';

interface DurationTimerProps {
  duration: number; // in minutes
  isActive: boolean;
  onComplete?: () => void;
  onTimeUpdate?: (timeRemaining: number) => void;
}

const DurationTimer: React.FC<DurationTimerProps> = memo(({
  duration,
  isActive,
  onComplete,
  onTimeUpdate
}) => {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);

  // Memoized time formatter
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoized progress calculation
  const getProgressPercentage = useCallback(() => {
    const totalSeconds = duration * 60;
    return totalSeconds > 0 ? ((totalSeconds - timeRemaining) / totalSeconds) * 100 : 0;
  }, [duration, timeRemaining]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeRemaining(duration * 60);
  }, [duration]);

  // Update running state when isActive changes
  useEffect(() => {
    setIsRunning(isActive);
  }, [isActive]);

  // Timer logic with cleanup
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          const newTime = time - 1;
          onTimeUpdate?.(newTime);
          
          if (newTime <= 0) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining, onComplete, onTimeUpdate]);

  // Accessibility and visual enhancements
  const progressPercentage = getProgressPercentage();
  const isCompleted = timeRemaining === 0;
  const statusText = isRunning 
    ? '🎵 Session Active' 
    : isCompleted 
    ? '✅ Complete' 
    : '⏸️ Paused';

  return (
    <div className="space-y-4" role="timer" aria-label="Session timer">
      <div className="text-center">
        <div 
          className="text-3xl font-mono font-bold text-white mb-2"
          aria-live="polite"
          aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
        >
          {formatTime(timeRemaining)}
        </div>
        <div className="text-sm text-white/70">
          {duration} minute session
        </div>
      </div>

      {/* Enhanced Progress Ring with better performance */}
      <div className="flex justify-center">
        <div className="relative w-24 h-24">
          <svg 
            className="w-24 h-24 transform -rotate-90" 
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle with smooth animation */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
              className={`transition-all duration-1000 ease-linear ${
                isRunning ? 'animate-pulse' : ''
              }`}
              style={{
                filter: isRunning ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.6))' : 'none'
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content with better contrast */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white drop-shadow-lg">
                {Math.round(progressPercentage)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced status indicator */}
      <div className="flex justify-center">
        <div 
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isRunning 
              ? 'bg-green-500/20 text-green-300 border border-green-400/50 shadow-lg shadow-green-500/20' 
              : isCompleted
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50 shadow-lg shadow-blue-500/20'
              : 'bg-gray-500/20 text-gray-300 border border-gray-400/50'
          }`}
          role="status"
          aria-live="polite"
        >
          {statusText}
        </div>
      </div>

      {/* Progress bar alternative for better accessibility */}
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 transition-all duration-1000 ease-linear ${
            isRunning ? 'animate-pulse' : ''
          }`}
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Session progress: ${Math.round(progressPercentage)}% complete`}
        />
      </div>

      {/* Additional timing info */}
      {isRunning && (
        <div className="text-center text-xs text-white/60">
          <p>Time elapsed: {formatTime((duration * 60) - timeRemaining)}</p>
        </div>
      )}
    </div>
  );
});

DurationTimer.displayName = 'DurationTimer';

export default DurationTimer;
