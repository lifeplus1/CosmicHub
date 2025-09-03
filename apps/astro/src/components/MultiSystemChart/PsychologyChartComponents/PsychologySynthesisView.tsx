import React from 'react';
import * as Separator from '@radix-ui/react-separator';
import * as Progress from '@radix-ui/react-progress';
import { ErrorBoundary } from 'react-error-boundary';

interface SynthesisData {
  personalityIntegration: string;
  astrologicalConfirmation: string[];
  developmentPath: string[];
  shadowWork: string[];
  spiritualGrowth: {
    meditationStyle: string;
    spiritualPractices: string;
    astrologicalTiming: string;
  };
  overallHarmony: number;
  contradictions: string[];
  integrationGuidance: string;
}

interface PsychologySynthesisViewProps {
  synthesisData: SynthesisData;
  mbtiType: string;
  enneagramType: number;
}

const PsychologySynthesisViewError: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="cosmic-card bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 p-6">
    <div className="text-center">
      <h3 className="font-bold text-red-400 mb-2">Synthesis Analysis Error</h3>
      <p className="text-red-300/70 text-sm mb-4">
        Unable to display synthesis analysis: {error.message}
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

const PsychologySynthesisView: React.FC<PsychologySynthesisViewProps> = ({ 
  synthesisData, 
  mbtiType, 
  enneagramType 
}) => {
  const getHarmonyColor = (harmony: number) => {
    if (harmony >= 0.8) return 'from-green-400 to-emerald-400';
    if (harmony >= 0.6) return 'from-yellow-400 to-orange-400';
    return 'from-orange-400 to-red-400';
  };

  const getHarmonyDescription = (harmony: number) => {
    if (harmony >= 0.8) return 'High Integration';
    if (harmony >= 0.6) return 'Moderate Integration';
    return 'Developing Integration';
  };

  return (
    <ErrorBoundary FallbackComponent={PsychologySynthesisViewError}>
      <div className="space-y-6">
        {/* Synthesis Header */}
        <div className="cosmic-card bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 p-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3">
              Psychology-Spirituality Synthesis
            </h3>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-200 font-medium">
                  MBTI: {mbtiType}
                </span>
              </div>
              
              <span className="text-indigo-400">+</span>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-200 font-medium">
                  Enneagram: Type {enneagramType}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-indigo-300">Overall Integration:</span>
              <Progress.Root 
                className="relative overflow-hidden bg-indigo-900/30 rounded-full w-24 h-3"
                value={synthesisData.overallHarmony * 100}
              >
                <Progress.Indicator
                  className={`bg-gradient-to-r ${getHarmonyColor(synthesisData.overallHarmony)} w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]`}
                  style={{ transform: `translateX(-${100 - (synthesisData.overallHarmony * 100)}%)` }}
                />
              </Progress.Root>
              <span className="text-sm text-indigo-300">
                {Math.round(synthesisData.overallHarmony * 100)}%
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                synthesisData.overallHarmony >= 0.8 ? 'bg-green-500/20 text-green-300' :
                synthesisData.overallHarmony >= 0.6 ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-orange-500/20 text-orange-300'
              }`}>
                {getHarmonyDescription(synthesisData.overallHarmony)}
              </span>
            </div>
          </div>
          
          <Separator.Root className="bg-indigo-500/30 h-px my-4" />
          
          <p className="text-indigo-200/80 text-center leading-relaxed">
            {synthesisData.personalityIntegration}
          </p>
        </div>

        {/* Astrological Confirmation */}
        <div className="cosmic-card bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 p-6">
          <h4 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
            ✨ Astrological Confirmation
          </h4>
          
          <div className="space-y-3">
            {synthesisData.astrologicalConfirmation.map((confirmation, index) => (
              <div key={index} className="flex items-start gap-3 bg-amber-950/30 border border-amber-500/20 rounded-lg p-3">
                <span className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-900 flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <p className="text-amber-200/80 text-sm leading-relaxed">
                  {confirmation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Development Path */}
        <div className="cosmic-card bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 p-6">
          <h4 className="text-lg font-semibold text-green-300 mb-4 flex items-center gap-2">
            🎯 Development Path
          </h4>
          
          <div className="space-y-3">
            {synthesisData.developmentPath.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-sm font-bold text-green-900 flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 bg-green-950/30 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-200/80 text-sm leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shadow Work */}
        <div className="cosmic-card bg-gradient-to-br from-purple-900/20 to-violet-900/20 border border-purple-500/30 p-6">
          <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
            🌑 Shadow Work & Integration
          </h4>
          
          <div className="space-y-3">
            {synthesisData.shadowWork.map((work, index) => (
              <div key={index} className="flex items-start gap-3 bg-purple-950/30 border border-purple-500/20 rounded-lg p-3">
                <span className="w-6 h-6 bg-gradient-to-br from-purple-400 to-violet-400 rounded-full flex items-center justify-center text-xs text-purple-900 flex-shrink-0 mt-0.5">
                  🌙
                </span>
                <p className="text-purple-200/80 text-sm leading-relaxed">
                  {work}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Spiritual Growth Guidance */}
        <div className="cosmic-card bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 p-6">
          <h4 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            🧘‍♀️ Spiritual Growth Guidance
          </h4>
          
          <div className="space-y-4">
            <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-lg p-4">
              <h5 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                🧘‍♀️ Recommended Meditation Style
              </h5>
              <p className="text-cyan-200/80 text-sm leading-relaxed">
                {synthesisData.spiritualGrowth.meditationStyle}
              </p>
            </div>
            
            <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg p-4">
              <h5 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                🕯️ Spiritual Practices
              </h5>
              <p className="text-blue-200/80 text-sm leading-relaxed">
                {synthesisData.spiritualGrowth.spiritualPractices}
              </p>
            </div>
            
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4">
              <h5 className="font-medium text-indigo-400 mb-2 flex items-center gap-2">
                🌟 Astrological Timing
              </h5>
              <p className="text-indigo-200/80 text-sm leading-relaxed">
                {synthesisData.spiritualGrowth.astrologicalTiming}
              </p>
            </div>
          </div>
        </div>

        {/* Contradictions & Challenges */}
        {synthesisData.contradictions.length > 0 && (
          <div className="cosmic-card bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 p-6">
            <h4 className="text-lg font-semibold text-orange-300 mb-4 flex items-center gap-2">
              ⚠️ Areas to Address
            </h4>
            
            <div className="space-y-3">
              {synthesisData.contradictions.map((contradiction, index) => (
                <div key={index} className="flex items-start gap-3 bg-orange-950/30 border border-orange-500/20 rounded-lg p-3">
                  <span className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-xs font-bold text-orange-900 flex-shrink-0 mt-0.5">
                    !
                  </span>
                  <p className="text-orange-200/80 text-sm leading-relaxed">
                    {contradiction}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Integration Guidance */}
        <div className="cosmic-card bg-gradient-to-br from-rose-900/20 to-pink-900/20 border border-rose-500/30 p-6">
          <h4 className="text-lg font-semibold text-rose-300 mb-4 flex items-center gap-2">
            🌟 Integration Guidance
          </h4>
          
          <div className="bg-rose-950/30 border border-rose-500/20 rounded-lg p-4">
            <p className="text-rose-200/80 text-sm leading-relaxed">
              {synthesisData.integrationGuidance}
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20 rounded-lg">
            <p className="text-rose-300/90 text-xs text-center font-medium">
              Remember: This synthesis represents potential patterns and tendencies. Your unique journey of self-discovery 
              and spiritual growth ultimately transcends any single system of classification.
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Memoized export to prevent unnecessary re-renders
export default React.memo(PsychologySynthesisView);
