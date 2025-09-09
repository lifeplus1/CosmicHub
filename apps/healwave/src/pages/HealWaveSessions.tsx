/**
 * HealWave Sessions Page
 * Integration point for the Advanced Audio Engine Architecture
 * HEALWAVE-IMPLEMENTATION-ROADMAP Phase 1 Integration
 */

import React from 'react';
import { HealWaveApp } from '../components';

const HealWaveSessions: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Therapeutic Audio Sessions
        </h1>
        <p className="text-xl text-blue-200 max-w-3xl mx-auto">
          Experience our advanced multi-phase healing sessions featuring Solfeggio frequencies, 
          chakra balancing, and binaural beats designed for deep transformation and wellness.
        </p>
      </div>

      {/* Integration with HealWave Components */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-1 border border-white/10">
        <HealWaveApp 
          className="bg-transparent"
          maxDurationMinutes={60} // Default recommendation for 1-hour max sessions
          preferredDifficulty="beginner" // Start users with beginner-friendly sessions
        />
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="text-4xl mb-4">🎵</div>
          <h3 className="text-xl font-semibold text-white mb-2">Healing Frequencies</h3>
          <p className="text-blue-200">
            Scientifically-researched frequencies including 528 Hz DNA repair, 
            Solfeggio tones, and chakra balancing frequencies.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="text-4xl mb-4">🧘</div>
          <h3 className="text-xl font-semibold text-white mb-2">Multi-Phase Sessions</h3>
          <p className="text-blue-200">
            Progressive sessions that guide you through different healing phases 
            with smooth frequency transitions and spatial audio.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold text-white mb-2">Spatial Audio</h3>
          <p className="text-blue-200">
            Immersive 3D audio positioning creates a therapeutic environment 
            that enhances the healing experience.
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-16 bg-gradient-to-r from-purple-800/20 to-blue-800/20 rounded-xl p-8 border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Session Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">Stress reduction and relaxation</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">Enhanced focus and concentration</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">Improved sleep quality</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">Chakra balancing and energy alignment</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">DNA repair frequency therapy</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">Increased vitality and energy</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">Deep meditation states</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✓</span>
              <span className="text-white">Emotional healing and release</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealWaveSessions;
