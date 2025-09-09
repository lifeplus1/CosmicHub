/**
 * HealWave Main Application Component
 * HEALWAVE-IMPLEMENTATION-ROADMAP Phase 1: Complete Integration
 * 
 * Integrates SessionSelector and SessionPlayer for a complete
 * therapeutic audio session experience.
 */

import React, { useState } from 'react';
import SessionSelector from './audio/SessionSelector';
import SessionPlayer from './audio/SessionPlayer';

// Local type definitions
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

interface HealWaveAppProps {
  className?: string;
  maxDurationMinutes?: number;
  preferredDifficulty?: 'beginner' | 'intermediate' | 'advanced';
}

type AppState = 'selection' | 'playing' | 'completed';

export function HealWaveApp({
  className = '',
  maxDurationMinutes,
  preferredDifficulty
}: HealWaveAppProps) {
  const [appState, setAppState] = useState<AppState>('selection');
  const [selectedSession, setSelectedSession] = useState<SessionTemplate | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionTemplate[]>([]);

  const handleSessionSelect = (session: SessionTemplate) => {
    setSelectedSession(session);
    setAppState('playing');
  };

  const handleSessionComplete = () => {
    setAppState('completed');
    if (selectedSession) {
      setSessionHistory(prev => [...prev, selectedSession]);
    }
  };

  const handleSessionStop = () => {
    setAppState('selection');
    setSelectedSession(null);
  };

  const handleBackToSelection = () => {
    setAppState('selection');
    setSelectedSession(null);
  };

  const handleStartNewSession = () => {
    setAppState('selection');
    setSelectedSession(null);
  };

  return (
    <div className={`healwave-app min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 ${className}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HealWave</h1>
                <p className="text-xs text-gray-500">Therapeutic Audio Sessions</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center gap-4">
              {appState !== 'selection' && (
                <button
                  onClick={handleBackToSelection}
                  className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  ← Back to Sessions
                </button>
              )}
              
              {sessionHistory.length > 0 && (
                <div className="text-sm text-gray-500">
                  {sessionHistory.length} session{sessionHistory.length !== 1 ? 's' : ''} completed
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appState === 'selection' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Your Healing Journey
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Experience the power of therapeutic frequencies designed to promote healing, 
                relaxation, and spiritual growth. Choose from our scientifically-crafted sessions 
                featuring Solfeggio frequencies, chakra balancing, and binaural beats.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-2">6</div>
                <div className="text-sm text-gray-600">Therapeutic Sessions</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">42</div>
                <div className="text-sm text-gray-600">Healing Frequencies</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{sessionHistory.length}</div>
                <div className="text-sm text-gray-600">Completed Sessions</div>
              </div>
            </div>

            {/* Session Selector */}
            <SessionSelector
              onSessionSelect={handleSessionSelect}
              maxDurationMinutes={maxDurationMinutes}
              preferredDifficulty={preferredDifficulty}
              className="bg-white rounded-lg shadow-sm"
            />

            {/* Recent Sessions */}
            {sessionHistory.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
                <div className="space-y-2">
                  {sessionHistory.slice(-3).reverse().map((session, index) => (
                    <div
                      key={`${session.id}-${index}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900">{session.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {Math.floor(session.totalDuration / 60)}m • {session.difficulty}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSessionSelect(session)}
                        className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                      >
                        Play Again
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {appState === 'playing' && selectedSession && (
          <div className="space-y-6">
            <SessionPlayer
              session={selectedSession}
              onSessionComplete={handleSessionComplete}
              onSessionStop={handleSessionStop}
              onPhaseChange={(_phase, _phaseIndex) => {
                // Phase change handler - could be used for analytics or notifications
                // Example: track phase transitions for user insights
              }}
              className="max-w-4xl mx-auto"
            />
          </div>
        )}

        {appState === 'completed' && selectedSession && (
          <div className="max-w-2xl mx-auto text-center space-y-6">
            {/* Completion Celebration */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-8">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Session Complete!
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                                You&apos;ve successfully completed the &quot;{selectedSession.name}&quot; session.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Duration:</span>
                  <div>{Math.floor(selectedSession.totalDuration / 60)} minutes</div>
                </div>
                <div>
                  <span className="font-medium">Phases:</span>
                  <div>{selectedSession.phases.length} completed</div>
                </div>
              </div>
            </div>

            {/* Post-Session Recommendations */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Post-Session Care
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500">💧</span>
                  <div>
                    <span className="font-medium">Stay Hydrated</span>
                    <p className="text-sm text-gray-600">Drink plenty of water to support your body&apos;s natural healing processes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500">🧘</span>
                  <div>
                    <span className="font-medium">Rest & Integration</span>
                    <p className="text-sm text-gray-600">Take time to rest and allow the healing frequencies to integrate.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-500">📝</span>
                  <div>
                    <span className="font-medium">Journal Your Experience</span>
                    <p className="text-sm text-gray-600">Note any sensations, emotions, or insights that arose during the session.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleStartNewSession}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start New Session
              </button>
              <button
                onClick={() => handleSessionSelect(selectedSession)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Repeat This Session
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>HealWave v1.0.0 - Advanced Audio Engine Architecture</p>
            <p className="mt-1">
              Powered by therapeutic frequencies and spatial audio technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HealWaveApp;
