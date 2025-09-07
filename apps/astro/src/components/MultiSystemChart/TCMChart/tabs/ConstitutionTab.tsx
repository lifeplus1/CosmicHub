import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { TCMTabProps } from '../utils/types';

/**
 * Constitution Tab Component
 * Displays TCM constitutional analysis including primary/secondary types and recommendations
 */
export const ConstitutionTab: React.FC<TCMTabProps> = React.memo(({ chartData }) => {
  // Handle missing or invalid data
  const constitutionData = chartData?.constitution;
  if (!constitutionData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No constitutional analysis available</p>
      </div>
    );
  }

  const { primaryType, secondaryType, traits, strengths, challenges, recommendations } = constitutionData;

  if (!primaryType) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>Primary constitution type analysis not available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Constitution */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">👑</span>
            Primary Constitution: {primaryType}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {/* Key Characteristics */}
              {traits && traits.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-green-400 font-medium mb-2">Key Characteristics</h4>
                  <div className="flex flex-wrap gap-2">
                    {traits.map((trait: string, index: number) => (
                      <span
                        key={`trait-${index}`}
                        className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {strengths && strengths.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-blue-400 font-medium mb-2">Natural Strengths</h4>
                  <ul className="text-sm text-cosmic-silver space-y-1">
                    {strengths.map((strength: string, index: number) => (
                      <li key={`strength-${index}`} className="flex items-start">
                        <span className="text-blue-400 mr-2">💪</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              {/* Challenges */}
              {challenges && challenges.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-yellow-400 font-medium mb-2">Potential Challenges</h4>
                  <ul className="text-sm text-cosmic-silver space-y-1">
                    {challenges.map((challenge: string, index: number) => (
                      <li key={`challenge-${index}`} className="flex items-start">
                        <span className="text-yellow-400 mr-2">⚠️</span>
                        {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {recommendations && recommendations.length > 0 && (
                <div>
                  <h4 className="text-purple-400 font-medium mb-2">Recommended Practices</h4>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.map((rec: string, index: number) => (
                      <span
                        key={`rec-${index}`}
                        className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded"
                      >
                        {rec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-cosmic-dark/20 rounded-lg">
              <h4 className="text-green-400 font-medium mb-3">Personalized Recommendations</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.map((rec: string, index: number) => (
                  <div key={`detailed-rec-${index}`} className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-sm text-cosmic-silver">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary Constitution */}
      {secondaryType && (
        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="cosmic-title flex items-center">
              <span className="mr-2">⭐</span>
              Secondary Constitution: {secondaryType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cosmic-silver text-sm">
              Your secondary constitutional type provides additional insights into your 
              personality and health patterns, complementing your primary type.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Constitution Insights */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">Constitutional Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-cosmic-silver">
            Your constitutional type represents your fundamental nature according to Traditional Chinese Medicine. 
            This analysis combines your birth chart patterns with TCM principles to provide personalized 
            guidance for optimal health and well-being.
          </p>
          
          <div className="mt-4 p-3 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20">
            <p className="text-cosmic-silver text-sm">
              💡 <strong>Tip:</strong> Constitutional awareness helps you make informed decisions about 
              diet, exercise, lifestyle, and stress management that align with your natural tendencies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ConstitutionTab.displayName = 'ConstitutionTab';
