/**
 * Chart Overview Cards Component
 * Displays summary statistics cards for chart data
 * Following Type Bridge system with validation
 */

import React, { memo } from 'react';
import { Card, CardContent } from '@cosmichub/ui';
import { 
  ChartOverviewCardsPropsSchema,
  type ChartOverviewCardsProps,
} from '../../schemas/chartDisplay';

/**
 * Overview Cards Component for Chart Statistics
 */
const ChartOverviewCards: React.FC<ChartOverviewCardsProps> = memo(function ChartOverviewCards({
  processedSections,
  className = '',
  animate = true,
}) {
  // Validate props
  const validatedProps = ChartOverviewCardsPropsSchema.safeParse({
    processedSections,
    className,
    animate,
  });

  if (!validatedProps.success) {
    console.error('Invalid ChartOverviewCards props:', validatedProps.error);
    return null;
  }

  const { processedSections: sections } = validatedProps.data;

  const cardBaseClass = `cosmic-glass border-cosmic-purple/30 hover:bg-cosmic-purple/10 transition-all duration-200 ${
    animate ? 'hover:scale-105' : ''
  }`;

  return (
    <div 
      className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}
      data-testid="chart-overview-cards"
      aria-live="polite"
    >
      {/* Planets Card */}
      <Card className={cardBaseClass}>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-cosmic-gold">
            {sections.planets.length}
          </div>
          <div className="text-sm text-cosmic-silver font-medium">
            🪐 Planets
          </div>
        </CardContent>
      </Card>

      {/* Asteroids Card */}
      <Card className={cardBaseClass}>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-cosmic-gold">
            {sections.asteroids.length}
          </div>
          <div className="text-sm text-cosmic-silver font-medium">
            ☄️ Asteroids
          </div>
        </CardContent>
      </Card>

      {/* Houses Card */}
      <Card className={cardBaseClass}>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-cosmic-gold">
            {sections.houses.length}
          </div>
          <div className="text-sm text-cosmic-silver font-medium">
            🏠 Houses
          </div>
        </CardContent>
      </Card>

      {/* Aspects Card */}
      <Card className={cardBaseClass}>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold text-cosmic-gold">
            {sections.aspects.length}
          </div>
          <div className="text-sm text-cosmic-silver font-medium">
            🔗 Aspects
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

ChartOverviewCards.displayName = 'ChartOverviewCards';

export { ChartOverviewCards };
export default ChartOverviewCards;
