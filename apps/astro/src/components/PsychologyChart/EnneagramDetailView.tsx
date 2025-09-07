/**
 * Enneagram Detail View Component
 * Displays detailed Enneagram profile with types, wings, and astrological correlations
 * Following Type Bridge validation patterns
 */

import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@cosmichub/ui';
import { Circle, ArrowUpDown, Star, Target, AlertTriangle } from 'lucide-react';

// Import validation schemas
import {
  EnneagramDetailViewPropsSchema,
  type EnneagramDetailViewProps,
} from '../../schemas/psychologyChart';

/**
 * Enneagram Type Indicator Component
 */
const EnneagramTypeIndicator: React.FC<{
  type: number;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}> = memo(function EnneagramTypeIndicator({ type, isActive = false, onClick, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]} 
        rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200
        ${isActive 
          ? 'bg-cosmic-gold text-cosmic-dark border-cosmic-gold shadow-lg' 
          : 'bg-cosmic-dark border-cosmic-border text-cosmic-muted hover:border-cosmic-gold hover:text-cosmic-gold'
        }
      `}
    >
      {type}
    </button>
  );
});

/**
 * Enneagram Wings Display
 */
const EnneagramWings: React.FC<{
  coreType: number;
  wing?: number;
  onWingSelect?: (wing: number) => void;
}> = memo(function EnneagramWings({ coreType, wing, onWingSelect }) {
  const leftWing = coreType === 1 ? 9 : coreType - 1;
  const rightWing = coreType === 9 ? 1 : coreType + 1;

  return (
    <div className="flex items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <EnneagramTypeIndicator
          type={leftWing}
          isActive={wing === leftWing}
          onClick={() => onWingSelect?.(leftWing)}
          size="sm"
        />
        <span className="text-xs text-cosmic-muted">Wing</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <EnneagramTypeIndicator
          type={coreType}
          isActive={true}
          size="lg"
        />
        <span className="text-sm font-medium">Core Type</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <EnneagramTypeIndicator
          type={rightWing}
          isActive={wing === rightWing}
          onClick={() => onWingSelect?.(rightWing)}
          size="sm"
        />
        <span className="text-xs text-cosmic-muted">Wing</span>
      </div>
    </div>
  );
});

/**
 * Growth and Stress Directions
 */
const DirectionalMovement: React.FC<{
  coreType: number;
  growthDirection: number;
  stressDirection: number;
  onTypeSelect?: (type: number) => void;
}> = memo(function DirectionalMovement({ coreType, growthDirection, stressDirection, onTypeSelect }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-center">
      {/* Stress Direction */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-cosmic-red" />
          <span className="text-sm text-cosmic-red">Stress</span>
        </div>
        <EnneagramTypeIndicator
          type={stressDirection}
          onClick={() => onTypeSelect?.(stressDirection)}
        />
        <ArrowUpDown className="h-4 w-4 text-cosmic-muted rotate-45" />
      </div>

      {/* Core Type */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium">Core</span>
        <EnneagramTypeIndicator
          type={coreType}
          isActive={true}
          size="lg"
        />
      </div>

      {/* Growth Direction */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-cosmic-green" />
          <span className="text-sm text-cosmic-green">Growth</span>
        </div>
        <EnneagramTypeIndicator
          type={growthDirection}
          onClick={() => onTypeSelect?.(growthDirection)}
        />
        <ArrowUpDown className="h-4 w-4 text-cosmic-muted -rotate-45" />
      </div>
    </div>
  );
});

/**
 * Enneagram Profile Overview
 */
const EnneagramProfileOverview: React.FC<{
  profile: EnneagramDetailViewProps['profile'];
}> = memo(function EnneagramProfileOverview({ profile }) {
  const getLevelColor = (level: number) => {
    if (level <= 3) return 'text-cosmic-green';
    if (level <= 6) return 'text-cosmic-gold';
    return 'text-cosmic-red';
  };

  return (
    <Card className="cosmic-gradient-bg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-cosmic-gold">
              Type {profile.type}: {profile.name}
            </CardTitle>
            <p className="text-cosmic-muted mt-1">
              Development Level: <span className={getLevelColor(profile.levelOfDevelopment)}>
                {profile.levelOfDevelopment}/9
              </span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-cosmic-muted">Instinctual</div>
            <div className="font-medium text-cosmic-blue capitalize">
              {profile.instinctualVariant?.replace('-', ' ') ?? 'N/A'}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">
          {profile.description}
        </p>

        {/* Core Motivation and Fear */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-cosmic-green flex items-center gap-2">
              <Target className="h-4 w-4" />
              Core Motivation
            </h4>
            <p className="text-xs text-cosmic-muted bg-cosmic-green/10 p-3 rounded-lg">
              {profile.coreMotivation}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-cosmic-red flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Core Fear
            </h4>
            <p className="text-xs text-cosmic-muted bg-cosmic-red/10 p-3 rounded-lg">
              {profile.coreFear}
            </p>
          </div>
        </div>

        {/* Astrological Houses */}
        <div>
          <h4 className="font-medium text-sm mb-2">Astrological House Correlations</h4>
          <div className="flex flex-wrap gap-2">
            {profile.astrologicalHouses.map((house) => (
              <span
                key={house}
                className="px-2 py-1 bg-cosmic-purple/20 text-cosmic-purple text-xs rounded-full"
              >
                House {house}
              </span>
            ))}
          </div>
        </div>

        {/* Compatibility Overview */}
        {Object.keys(profile.compatibility).length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Type Compatibility</h4>
            <div className="space-y-1">
              {Object.entries(profile.compatibility).slice(0, 3).map(([type, description]) => (
                <div key={type} className="flex justify-between text-xs">
                  <span className="font-medium">Type {type}:</span>
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
 * Main Enneagram Detail View Component
 */
const EnneagramDetailView: React.FC<EnneagramDetailViewProps> = memo(function EnneagramDetailView({
  profile,
  astrology,
  onTypeSelect,
  showWings = true,
  className = '',
}) {
  // Hooks must be called before any conditional returns
  const handleTypeSelect = useCallback((type: number) => {
    onTypeSelect?.(type);
  }, [onTypeSelect]);

  const handleWingSelect = useCallback((wing: number) => {
    console.log('Wing selected:', wing);
    // Wing selection logic would go here
  }, []);

  // Validate props using Zod schema
  const validatedProps = React.useMemo(() => {
    try {
      return EnneagramDetailViewPropsSchema.parse({
        profile,
        astrology,
        onTypeSelect,
        showWings,
        className,
      });
    } catch (error) {
      console.error('Invalid EnneagramDetailView props:', error);
      return null;
    }
  }, [profile, astrology, onTypeSelect, showWings, className]);

  if (!validatedProps) {
    return (
      <Card className="p-8 text-center">
        <p className="text-cosmic-red">Invalid Enneagram profile data</p>
      </Card>
    );
  }

  return (
    <div className={`enneagram-detail-view space-y-6 ${className}`}>
      {/* Enneagram Profile Overview */}
      <EnneagramProfileOverview profile={validatedProps.profile} />

      {/* Wings Display */}
      {validatedProps.showWings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-cosmic-purple" />
              Wings & Core Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnneagramWings
              coreType={validatedProps.profile.type}
              wing={validatedProps.profile.wing}
              onWingSelect={handleWingSelect}
            />
          </CardContent>
        </Card>
      )}

      {/* Growth and Stress Directions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-cosmic-blue" />
            Directional Movement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DirectionalMovement
            coreType={validatedProps.profile.type}
            growthDirection={validatedProps.profile.growthDirection}
            stressDirection={validatedProps.profile.stressDirection}
            onTypeSelect={handleTypeSelect}
          />
        </CardContent>
      </Card>

      {/* Astrological Integration */}
      {validatedProps.astrology && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-cosmic-gold" />
              Astrological Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* House Emphasis */}
            {validatedProps.astrology.house_emphasis && validatedProps.astrology.house_emphasis.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3">House Emphasis</h4>
                <div className="space-y-2">
                  {validatedProps.astrology.house_emphasis.slice(0, 3).map((house, index) => (
                    <div key={index} className="border border-cosmic-border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">House {house.house}</span>
                        <span className="text-xs text-cosmic-muted">
                          {house.planets.length} planet{house.planets.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {house.planets.map((planet) => (
                            <span key={planet} className="px-2 py-1 bg-cosmic-blue/20 text-cosmic-blue text-xs rounded">
                              {planet}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-cosmic-muted">
                          {house.psychological_themes.slice(0, 2).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          onClick={() => console.log('Export Enneagram profile')}
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

EnneagramDetailView.displayName = 'EnneagramDetailView';

export default EnneagramDetailView;
