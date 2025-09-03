import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import * as Separator from '@radix-ui/react-separator';
import { ErrorBoundary } from 'react-error-boundary';

interface CognitiveFunction {
  name: string;
  fullName: string;
  position: 'dominant' | 'auxiliary' | 'tertiary' | 'inferior';
  planetaryCorrelation: string;
  elementalAssociation: string;
  strength: number;
  description: string;
}

interface MBTIProfile {
  type: string;
  name: string;
  description: string;
  temperament: string;
  cognitiveStack: CognitiveFunction[];
  elementalCorrelation: string;
  astrologicalSigns: string[];
  strengths: string[];
  growthAreas: string[];
  compatibility: Record<string, string>;
}

interface MBTIDetailViewProps {
  profile: MBTIProfile;
}

const MBTIDetailViewError: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="cosmic-card bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 p-6">
    <div className="text-center">
      <h3 className="font-bold text-red-400 mb-2">MBTI Analysis Error</h3>
      <p className="text-red-300/70 text-sm mb-4">
        Unable to display MBTI analysis: {error.message}
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

const MBTIDetailView: React.FC<MBTIDetailViewProps> = ({ profile }) => {
  return (
    <ErrorBoundary FallbackComponent={MBTIDetailViewError}>
      <div className="space-y-6">
        {/* MBTI Type Header */}
        <div className="cosmic-card bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 p-6">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
              {profile.type}
            </h3>
            <h4 className="text-lg text-purple-300 mb-2">{profile.name}</h4>
            <p className="text-purple-300/70 text-sm">{profile.temperament}</p>
          </div>
          
          <Separator.Root className="bg-purple-500/30 h-px my-4" />
          
          <p className="text-purple-200/80 text-center leading-relaxed">
            {profile.description}
          </p>
        </div>

        {/* Cognitive Functions Stack */}
        <div className="cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 p-6">
          <h4 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
            🧠 Cognitive Functions Stack
          </h4>
          
          <div className="space-y-4">
            {profile.cognitiveStack.map((func, index) => (
              <div key={index} className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-indigo-400">{func.name}</span>
                    <span className="text-sm text-indigo-300/70 capitalize">{func.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress.Root 
                      className="relative overflow-hidden bg-indigo-900/30 rounded-full w-16 h-2"
                      value={func.strength * 100}
                    >
                      <Progress.Indicator
                        className="bg-gradient-to-r from-indigo-400 to-purple-400 w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
                        style={{ transform: `translateX(-${100 - (func.strength * 100)}%)` }}
                      />
                    </Progress.Root>
                    <span className="text-xs text-indigo-300/60 w-8">
                      {Math.round(func.strength * 100)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-indigo-200/70 mb-2">{func.fullName}</p>
                <p className="text-xs text-indigo-300/60 mb-2">{func.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300">
                    🪐 {func.planetaryCorrelation}
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300">
                    🌟 {func.elementalAssociation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Astrological Correlations */}
        <div className="cosmic-card bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 p-6">
          <h4 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
            ✨ Astrological Correlations
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-amber-400 mb-2">Element Association</h5>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-200">
                {profile.elementalCorrelation}
              </span>
            </div>
            
            <div>
              <h5 className="font-medium text-amber-400 mb-2">Resonant Signs</h5>
              <div className="flex flex-wrap gap-2">
                {profile.astrologicalSigns.map((sign, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-xs text-orange-200"
                  >
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Growth Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cosmic-card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 p-6">
            <h4 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
              💪 Core Strengths
            </h4>
            <ul className="space-y-2">
              {profile.strengths.map((strength, index) => (
                <li key={index} className="flex items-center gap-2 text-green-200/80 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="cosmic-card bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/30 p-6">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              🌱 Growth Areas
            </h4>
            <ul className="space-y-2">
              {profile.growthAreas.map((area, index) => (
                <li key={index} className="flex items-center gap-2 text-yellow-200/80 text-sm">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Memoized export to prevent unnecessary re-renders
export default React.memo(MBTIDetailView);
