/**
 * MBTI Detail View Component
 * Displays detailed MBTI profile with cognitive functions and astrological correlations
 * Following Type Bridge validation patterns
 */

import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@cosmichub/ui';
import { Brain, Zap, Target, Compass } from 'lucide-react';

// Import validation schemas
import {
  MBTIDetailViewPropsSchema,
  type MBTIDetailViewProps,
  type CognitiveFunction,
} from '../../schemas/psychologyChart';

/**
 * Cognitive Function Display Component
 */
const CognitiveFunctionCard: React.FC<{
  cognitiveFunction: CognitiveFunction;
  onSelect?: (func: CognitiveFunction) => void;
  showAstrology?: boolean;
}> = memo(function CognitiveFunctionCard({ cognitiveFunction, onSelect, showAstrology = true }) {
  const handleSelect = useCallback(() => {
    onSelect?.(cognitiveFunction);
  }, [cognitiveFunction, onSelect]);

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'dominant': return <Zap className="h-4 w-4 text-cosmic-gold" />;
      case 'auxiliary': return <Target className="h-4 w-4 text-cosmic-blue" />;
      case 'tertiary': return <Compass className="h-4 w-4 text-cosmic-purple" />;
      case 'inferior': return <Brain className="h-4 w-4 text-cosmic-muted" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'bg-cosmic-green';
    if (strength >= 0.6) return 'bg-cosmic-gold';
    if (strength >= 0.4) return 'bg-cosmic-blue';
    return 'bg-cosmic-muted';
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md cursor-pointer" onClick={handleSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPositionIcon(cognitiveFunction.position)}
            <CardTitle className="text-sm font-medium">
              {cognitiveFunction.name}
            </CardTitle>
          </div>
          <div className="text-xs text-cosmic-muted capitalize">
            {cognitiveFunction.position}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{cognitiveFunction.fullName}</h4>
          <p className="text-xs text-cosmic-muted mt-1">
            {cognitiveFunction.description}
          </p>
        </div>

        {/* Strength Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Strength</span>
            <span>{Math.round(cognitiveFunction.strength * 100)}%</span>
          </div>
          <div className="h-2 bg-cosmic-dark/20 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthColor(cognitiveFunction.strength)}`}
              data-strength={cognitiveFunction.strength}
            />
          </div>
        </div>

        {/* Astrological Correlations */}
        {showAstrology && (
          <div className="space-y-2 pt-2 border-t border-cosmic-border">
            <div className="flex justify-between text-xs">
              <span className="text-cosmic-muted">Planetary:</span>
              <span className="font-medium">{cognitiveFunction.planetaryCorrelation}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-cosmic-muted">Element:</span>
              <span className="font-medium">{cognitiveFunction.elementalAssociation}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

/**
 * MBTI Type Overview Component
 */
const MBTITypeOverview: React.FC<{
  profile: MBTIDetailViewProps['profile'];
  showCompatibility?: boolean;
}> = memo(function MBTITypeOverview({ profile, showCompatibility = true }) {
  return (
    <Card className="cosmic-gradient-bg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-cosmic-gold">
              {profile.type}: {profile.name}
            </CardTitle>
            <p className="text-cosmic-muted mt-1">
              {profile.temperament} Temperament
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-cosmic-muted">Element</div>
            <div className="font-medium text-cosmic-blue">
              {profile.elementalCorrelation}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">
          {profile.description}
        </p>

        {/* Astrological Signs */}
        <div>
          <h4 className="font-medium text-sm mb-2">Astrological Correlations</h4>
          <div className="flex flex-wrap gap-2">
            {profile.astrologicalSigns.map((sign) => (
              <span
                key={sign}
                className="px-2 py-1 bg-cosmic-blue/20 text-cosmic-blue text-xs rounded-full"
              >
                {sign}
              </span>
            ))}
          </div>
        </div>

        {/* Strengths and Growth Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2 text-cosmic-green">Strengths</h4>
            <ul className="space-y-1">
              {profile.strengths.map((strength, index) => (
                <li key={index} className="text-xs text-cosmic-muted flex items-center gap-2">
                  <span className="w-1 h-1 bg-cosmic-green rounded-full" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2 text-cosmic-gold">Growth Areas</h4>
            <ul className="space-y-1">
              {profile.growthAreas.map((area, index) => (
                <li key={index} className="text-xs text-cosmic-muted flex items-center gap-2">
                  <span className="w-1 h-1 bg-cosmic-gold rounded-full" />
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Compatibility Overview */}
        {showCompatibility && Object.keys(profile.compatibility).length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Compatibility Highlights</h4>
            <div className="space-y-1">
              {Object.entries(profile.compatibility).slice(0, 3).map(([type, description]) => (
                <div key={type} className="flex justify-between text-xs">
                  <span className="font-medium">{type}:</span>
                  <span className="text-cosmic-muted">{description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

/**
 * Main MBTI Detail View Component
 */
const MBTIDetailView: React.FC<MBTIDetailViewProps> = memo(function MBTIDetailView({
  profile,
  astrology,
  onFunctionSelect,
  showAstrology = true,
  className = '',
}) {
  // Hooks must be called before any conditional returns
  const handleFunctionSelect = useCallback((cognitiveFunction: CognitiveFunction) => {
    onFunctionSelect?.(cognitiveFunction);
  }, [onFunctionSelect]);

  // Validate props using Zod schema
  const validatedProps = React.useMemo(() => {
    try {
      return MBTIDetailViewPropsSchema.parse({
        profile,
        astrology,
        onFunctionSelect,
        showAstrology,
        className,
      });
    } catch (error) {
      console.error('Invalid MBTIDetailView props:', error);
      return null;
    }
  }, [profile, astrology, onFunctionSelect, showAstrology, className]);

  if (!validatedProps) {
    return (
      <Card className="p-8 text-center">
        <p className="text-cosmic-red">Invalid MBTI profile data</p>
      </Card>
    );
  }

  return (
    <div className={`mbti-detail-view space-y-6 ${className}`}>
      {/* MBTI Type Overview */}
      <MBTITypeOverview profile={validatedProps.profile} />

      {/* Cognitive Functions Stack */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-cosmic-purple" />
          Cognitive Functions Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {validatedProps.profile.cognitiveStack.map((cognitiveFunction, index) => (
            <CognitiveFunctionCard
              key={`${cognitiveFunction.name}-${index}`}
              cognitiveFunction={cognitiveFunction}
              onSelect={handleFunctionSelect}
              showAstrology={validatedProps.showAstrology}
            />
          ))}
        </div>
      </div>

      {/* Astrological Integration */}
      {validatedProps.showAstrology && validatedProps.astrology && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-cosmic-gold" />
              Astrological Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Elemental Balance */}
            <div>
              <h4 className="font-medium text-sm mb-3">Elemental Balance</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(validatedProps.astrology.elemental_balance).map(([element, value]) => (
                  <div key={element} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{element}</span>
                      <span>{Math.round(value * 100)}%</span>
                    </div>
                    <div className="h-2 bg-cosmic-dark/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cosmic-blue transition-all duration-300"
                        data-element-value={value}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Planetary Influences */}
            {validatedProps.astrology.planetary_influences && validatedProps.astrology.planetary_influences.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3">Key Planetary Influences</h4>
                <div className="space-y-2">
                  {validatedProps.astrology.planetary_influences.slice(0, 3).map((influence, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{influence.planet}</span>
                        <span className="text-cosmic-muted">{influence.aspect}</span>
                      </div>
                      <span className="text-cosmic-blue">
                        {Math.round(influence.correlation_strength * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          className="cosmic-button-outline"
          onClick={() => console.log('Export MBTI profile')}
        >
          Export Profile
        </Button>
        <Button
          className="cosmic-button-primary"
          onClick={() => console.log('View detailed analysis')}
        >
          Detailed Analysis
        </Button>
      </div>
    </div>
  );
});

MBTIDetailView.displayName = 'MBTIDetailView';

export default MBTIDetailView;
