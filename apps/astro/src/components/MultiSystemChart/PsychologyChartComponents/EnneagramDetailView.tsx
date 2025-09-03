import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import * as Separator from '@radix-ui/react-separator';
import { ErrorBoundary } from 'react-error-boundary';

interface EnneagramWing {
  number: number;
  name: string;
  influence: number;
  description: string;
}

interface EnneagramProfile {
  type: number;
  name: string;
  description: string;
  coreMotivation: string;
  basicFear: string;
  house: number;
  planetaryRuler: string;
  element: string;
  wings: EnneagramWing[];
  instinctualVariant: 'Self-Preservation' | 'Sexual' | 'Social';
  level: number;
  integrationDirection: number;
  disintegrationDirection: number;
  compatibleTypes: number[];
  challengingTypes: number[];
  areasForGrowth: string[];
}

interface EnneagramDetailViewProps {
  profile: EnneagramProfile;
}

const EnneagramDetailViewError: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="cosmic-card bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 p-6">
    <div className="text-center">
      <h3 className="font-bold text-red-400 mb-2">Enneagram Analysis Error</h3>
      <p className="text-red-300/70 text-sm mb-4">
        Unable to display Enneagram analysis: {error.message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
      >
        Retry Analysis
      </button>
    </div>
  </div>
);

const EnneagramDetailView: React.FC<EnneagramDetailViewProps> = ({ profile }) => {
  const _getHealthLevelColor = (level: number) => {
    if (level <= 3) return 'from-green-500 to-emerald-500';
    if (level <= 6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getHealthLevelDescription = (level: number) => {
    if (level <= 3) return 'Healthy';
    if (level <= 6) return 'Average';
    return 'Unhealthy';
  };

  return (
    <ErrorBoundary FallbackComponent={EnneagramDetailViewError}>
      <div className="space-y-6">
        {/* Enneagram Type Header */}
        <div className="cosmic-card bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 p-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-2xl font-bold text-emerald-900">
                {profile.type}
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                  Type {profile.type}
                </h3>
                <h4 className="text-lg text-emerald-300">{profile.name}</h4>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-200 text-sm">
                Level {profile.level} - {getHealthLevelDescription(profile.level)}
              </span>
              <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-200 text-sm">
                {profile.instinctualVariant}
              </span>
            </div>
          </div>
          
          <Separator.Root className="bg-emerald-500/30 h-px my-4" />
          
          <p className="text-emerald-200/80 text-center leading-relaxed">
            {profile.description}
          </p>
        </div>

        {/* Core Dynamics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="cosmic-card bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 p-6">
            <h4 className="text-lg font-semibold text-blue-300 mb-3 flex items-center gap-2">
              💎 Core Motivation
            </h4>
            <p className="text-blue-200/80 text-sm leading-relaxed">
              {profile.coreMotivation}
            </p>
          </div>
          
          <div className="cosmic-card bg-gradient-to-br from-purple-900/20 to-violet-900/20 border border-purple-500/30 p-6">
            <h4 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
              😰 Basic Fear
            </h4>
            <p className="text-purple-200/80 text-sm leading-relaxed">
              {profile.basicFear}
            </p>
          </div>
        </div>

        {/* Wings Analysis */}
        <div className="cosmic-card bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 p-6">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            🪶 Wings Influence
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.wings.map((wing, index) => (
              <div key={index} className="bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-cyan-400">
                    Type {wing.number} - {wing.name}
                  </h5>
                  <div className="flex items-center gap-2">
                    <Progress.Root 
                      className="relative overflow-hidden bg-cyan-900/30 rounded-full w-16 h-2"
                      value={wing.influence * 100}
                    >
                      <Progress.Indicator
                        className="bg-gradient-to-r from-cyan-400 to-blue-400 w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
                        style={{ transform: `translateX(-${100 - (wing.influence * 100)}%)` }}
                      />
                    </Progress.Root>
                    <span className="text-xs text-cyan-300/60 w-8">
                      {Math.round(wing.influence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-cyan-200/70 text-sm">
                  {wing.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration & Disintegration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="cosmic-card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 p-6">
            <h4 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
              ⬆️ Integration (Growth)
            </h4>
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2">
                <span className="text-2xl">{profile.type}</span>
                <span className="text-green-400">→</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-sm font-bold text-green-900">
                  {profile.integrationDirection}
                </div>
              </div>
            </div>
            <p className="text-green-200/80 text-sm text-center">
              When healthy, Type {profile.type} moves toward the positive aspects of Type {profile.integrationDirection}
            </p>
          </div>
          
          <div className="cosmic-card bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 p-6">
            <h4 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
              ⬇️ Disintegration (Stress)
            </h4>
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-2">
                <span className="text-2xl">{profile.type}</span>
                <span className="text-orange-400">→</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-sm font-bold text-orange-900">
                  {profile.disintegrationDirection}
                </div>
              </div>
            </div>
            <p className="text-orange-200/80 text-sm text-center">
              Under stress, Type {profile.type} moves toward the negative aspects of Type {profile.disintegrationDirection}
            </p>
          </div>
        </div>

        {/* Astrological Correlations */}
        <div className="cosmic-card bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 p-6">
          <h4 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
            🌟 Astrological Correspondences
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h5 className="font-medium text-amber-400 mb-2">House</h5>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200">
                {profile.house}th House
              </span>
            </div>
            
            <div className="text-center">
              <h5 className="font-medium text-amber-400 mb-2">Planetary Ruler</h5>
              <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-orange-200">
                {profile.planetaryRuler}
              </span>
            </div>
            
            <div className="text-center">
              <h5 className="font-medium text-amber-400 mb-2">Element</h5>
              <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-200">
                {profile.element}
              </span>
            </div>
          </div>
        </div>

        {/* Growth Areas */}
        <div className="cosmic-card bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-500/30 p-6">
          <h4 className="text-lg font-semibold text-violet-300 mb-4 flex items-center gap-2">
            🌱 Areas for Growth
          </h4>
          <ul className="space-y-2">
            {profile.areasForGrowth.map((area, index) => (
              <li key={index} className="flex items-center gap-2 text-violet-200/80 text-sm">
                <span className="w-2 h-2 bg-violet-400 rounded-full flex-shrink-0"></span>
                {area}
              </li>
            ))}
          </ul>
        </div>

        {/* Compatibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="cosmic-card bg-gradient-to-br from-rose-900/20 to-pink-900/20 border border-rose-500/30 p-6">
            <h4 className="text-lg font-semibold text-rose-300 mb-3 flex items-center gap-2">
              💞 Compatible Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.compatibleTypes.map((type, index) => (
                <span 
                  key={index}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-sm font-bold text-rose-900"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          
          <div className="cosmic-card bg-gradient-to-br from-slate-900/20 to-gray-900/20 border border-slate-500/30 p-6">
            <h4 className="text-lg font-semibold text-slate-300 mb-3 flex items-center gap-2">
              ⚡ Challenging Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {profile.challengingTypes.map((type, index) => (
                <span 
                  key={index}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-gray-400 flex items-center justify-center text-sm font-bold text-slate-900"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Memoized export to prevent unnecessary re-renders  
export default React.memo(EnneagramDetailView);
