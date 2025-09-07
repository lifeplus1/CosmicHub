/**
 * Chart Tables Container Component
 * Orchestrates the display of chart data tables
 * Following Type Bridge system with validation
 */

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import { 
  ProcessedSections,
  CategorizedPoints,
  EnhancedAspect,
  AstrologySettings,
} from '../../schemas/chartDisplay';

interface ChartTablesContainerProps {
  processedSections: ProcessedSections;
  categorizedPoints: CategorizedPoints;
  enhancedAspects: EnhancedAspect[];
  settings: AstrologySettings;
  useUnifiedView: boolean;
  searchQuery: string;
  sortOrder: string;
  onSortChange: (order: string) => void;
}

/**
 * Chart Tables Container Component
 */
const ChartTablesContainer: React.FC<ChartTablesContainerProps> = memo(function ChartTablesContainer({
  processedSections,
  settings,
  useUnifiedView,
  searchQuery,
}) {
  // Filter data based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery) return processedSections;

    const query = searchQuery.toLowerCase();
    return {
      planets: processedSections.planets.filter(
        planet => 
          planet.name.toLowerCase().includes(query) ||
          planet.sign.toLowerCase().includes(query)
      ),
      houses: processedSections.houses.filter(
        house => house.sign.toLowerCase().includes(query)
      ),
      aspects: processedSections.aspects.filter(
        aspect =>
          aspect.planet1.toLowerCase().includes(query) ||
          aspect.planet2.toLowerCase().includes(query) ||
          aspect.aspect.toLowerCase().includes(query)
      ),
      asteroids: processedSections.asteroids.filter(
        asteroid =>
          asteroid.name.toLowerCase().includes(query) ||
          asteroid.sign.toLowerCase().includes(query)
      ),
      angles: processedSections.angles.filter(
        angle =>
          angle.name.toLowerCase().includes(query) ||
          angle.sign.toLowerCase().includes(query)
      ),
    };
  }, [processedSections, searchQuery]);

  // Define proper types following Type Bridge system
  type TableRowData = Record<string, string | number | boolean | null | undefined>;

  // Simple table rendering with proper typing
  const renderSimpleTable = (title: string, icon: string, data: TableRowData[], fields: string[]) => {
    if (!data.length) return null;

    return (
      <Card className="cosmic-glass border-cosmic-purple/30">
        <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
          <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
            {icon} {title}
            <span className="text-sm text-cosmic-silver font-normal">
              ({data.length} items)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cosmic-purple/30">
                  {fields.map(field => (
                    <th key={field} className="text-left p-2 text-cosmic-gold capitalize">
                      {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b border-cosmic-purple/20">
                    {fields.map(field => (
                      <td key={field} className="p-2 text-cosmic-silver">
                        {typeof item[field] === 'boolean' 
                          ? (item[field] ? '✓' : '✗')
                          : typeof item[field] === 'number'
                          ? Number(item[field]).toFixed(2)
                          : String(item[field] ?? '-')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (useUnifiedView) {
    // Unified view - show summary tables
    return (
      <div className="space-y-6" data-testid="chart-tables-unified">
        {settings.displayOptions.showPlanets && renderSimpleTable(
          'Planets', '🪐', filteredSections.planets, 
          ['name', 'sign', 'house', 'degree', 'retrograde']
        )}
        {settings.displayOptions.showAspects && renderSimpleTable(
          'Aspects', '⚹', filteredSections.aspects,
          ['planet1', 'planet2', 'aspect', 'angle', 'orb', 'exact']
        )}
      </div>
    );
  }

  // Separate tables view
  return (
    <div className="space-y-6" data-testid="chart-tables-separate">
      {settings.displayOptions.showPlanets && renderSimpleTable(
        'Planets', '🪐', filteredSections.planets, 
        ['name', 'sign', 'house', 'degree', 'retrograde']
      )}
      
      {settings.displayOptions.showAsteroids && renderSimpleTable(
        'Asteroids', '☄️', filteredSections.asteroids,
        ['name', 'sign', 'house', 'degree', 'retrograde']
      )}
      
      {settings.displayOptions.showHouses && renderSimpleTable(
        'Houses', '🏠', filteredSections.houses,
        ['number', 'sign', 'cusp']
      )}
      
      {settings.displayOptions.showAngles && renderSimpleTable(
        'Angles', '⚹', filteredSections.angles,
        ['name', 'sign', 'degree']
      )}
      
      {settings.displayOptions.showAspects && renderSimpleTable(
        'Aspects', '🔗', filteredSections.aspects,
        ['planet1', 'planet2', 'aspect', 'angle', 'orb', 'exact']
      )}
    </div>
  );
});

ChartTablesContainer.displayName = 'ChartTablesContainer';

export { ChartTablesContainer };
export default ChartTablesContainer;
