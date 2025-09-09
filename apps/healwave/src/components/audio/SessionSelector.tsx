/**
 * HealWave Session Selector Component
 * HEALWAVE-IMPLEMENTATION-ROADMAP Phase 1: Session Selection UI
 * 
 * Provides an intuitive interface for users to browse and select
 * therapeutic audio sessions based on category, duration, and difficulty.
 */

import React, { useState, useMemo } from 'react';
import { 
  SESSION_TEMPLATES, 
  getSessionsByCategory, 
  getRecommendedSession
} from '../../audio/sessionTemplates';

// Local type definitions for the session structure
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

interface SessionSelectorProps {
  onSessionSelect: (session: SessionTemplate) => void;
  maxDurationMinutes?: number;
  preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

type FilterCategory = 'all' | 'healing' | 'meditation' | 'focus' | 'sleep' | 'energy';
type FilterDifficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';

const CategoryIcons = {
  healing: '🌿',
  meditation: '🧘',
  focus: '🎯',
  sleep: '😴',
  energy: '⚡',
  all: '✨'
} as const;

const DifficultyColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
} as const;

export function SessionSelector({
  onSessionSelect,
  maxDurationMinutes,
  preferredDifficulty,
  className = ''
}: SessionSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<FilterDifficulty>(preferredDifficulty ?? 'all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Filter sessions based on selected criteria
  const filteredSessions = useMemo(() => {
    let sessions = Object.values(SESSION_TEMPLATES);

    // Filter by category
    if (selectedCategory !== 'all') {
      sessions = getSessionsByCategory(selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      sessions = sessions.filter(session => session.difficulty === selectedDifficulty);
    }

    // Filter by max duration if specified
    if (maxDurationMinutes) {
      sessions = sessions.filter(session => session.totalDuration <= maxDurationMinutes * 60);
    }

    return sessions.sort((a, b) => a.totalDuration - b.totalDuration);
  }, [selectedCategory, selectedDifficulty, maxDurationMinutes]);

  // Get recommended session
  const recommendedSession = useMemo(() => {
    if (maxDurationMinutes) {
      return getRecommendedSession(maxDurationMinutes);
    }
    return null;
  }, [maxDurationMinutes]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const getPhaseCount = (session: SessionTemplate): number => {
    return session.phases.length;
  };

  const getFrequencyRange = (session: SessionTemplate): string => {
    const frequencies = session.phases.map(phase => phase.frequency);
    const min = Math.min(...frequencies);
    const max = Math.max(...frequencies);
    
    if (min === max) {
      return `${min} Hz`;
    }
    return `${min}-${max} Hz`;
  };

  return (
    <div className={`healwave-session-selector ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Healing Session
        </h2>
        <p className="text-gray-600">
          Select from our therapeutic audio sessions designed for deep healing and transformation.
        </p>
      </div>

      {/* Recommended Session */}
      {recommendedSession && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⭐</span>
            <h3 className="font-semibold text-purple-900">Recommended for you</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-purple-800">{recommendedSession.name}</p>
              <p className="text-sm text-purple-600">
                {formatDuration(recommendedSession.totalDuration)} • {recommendedSession.difficulty}
              </p>
            </div>
            <button
              onClick={() => onSessionSelect(recommendedSession)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Start Session
            </button>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Category Filter */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'healing', 'meditation', 'focus', 'sleep', 'energy'] as FilterCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {CategoryIcons[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </div>
          <div className="flex gap-2">
            {(['all', 'beginner', 'intermediate', 'advanced'] as FilterDifficulty[]).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedDifficulty === difficulty
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Session Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Session Header */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{CategoryIcons[session.category]}</span>
                  <h3 className="font-semibold text-gray-900 text-sm">{session.name}</h3>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full border ${DifficultyColors[session.difficulty]}`}>
                  {session.difficulty}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {session.description}
              </p>

              {/* Session Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span>⏱️ {formatDuration(session.totalDuration)}</span>
                <span>🎵 {getPhaseCount(session)} phases</span>
                <span>📊 {getFrequencyRange(session)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSessionSelect(session)}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Start Session
                </button>
                <button
                  onClick={() => setShowDetails(showDetails === session.id ? null : session.id)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                >
                  {showDetails === session.id ? 'Hide' : 'Details'}
                </button>
              </div>
            </div>

            {/* Expandable Details */}
            {showDetails === session.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <h4 className="font-medium text-gray-900 mb-2">Session Phases</h4>
                <div className="space-y-2">
                  {session.phases.map((phase, index) => (
                    <div key={phase.id} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {index + 1}. {phase.name}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>{Math.floor(phase.frequency)} Hz</span>
                        <span>•</span>
                        <span>{Math.floor(phase.duration / 60)}m</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Created: {session.metadata.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Version: {session.metadata.version}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No sessions found</h3>
          <p className="text-gray-500">
            Try adjusting your filters to see more options.
          </p>
        </div>
      )}
    </div>
  );
}

export default SessionSelector;
