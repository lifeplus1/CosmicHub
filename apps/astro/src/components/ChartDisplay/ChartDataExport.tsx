/**
 * Chart Data Export Component
 * Handles data export functionality with multiple formats
 * Following Type Bridge system with validation
 */

import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@cosmichub/ui';
import { 
  ChartDataExportPropsSchema,
  type ChartDataExportProps,
  type ExportFormat,
} from '../../schemas/chartDisplay';

/**
 * Chart Data Export Component
 */
const ChartDataExport: React.FC<ChartDataExportProps> = memo(function ChartDataExport({
  chartData,
  onExport,
  supportedFormats = ['json', 'csv', 'txt'],
  className = '',
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExportFormat, setLastExportFormat] = useState<ExportFormat | null>(null);

  // Validate props
  const validatedProps = ChartDataExportPropsSchema.safeParse({
    chartData,
    onExport,
    supportedFormats,
    className,
  });

  const handleExport = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    setLastExportFormat(format);
    
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [onExport]);

  const handleKeyDown = useCallback((format: ExportFormat) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      void handleExport(format);
    }
  }, [handleExport]);

  if (!validatedProps.success) {
    console.error('Invalid ChartDataExport props:', validatedProps.error);
    return null;
  }

  const formatLabels: Record<ExportFormat, { label: string; icon: string; description: string }> = {
    json: {
      label: 'JSON',
      icon: '📄',
      description: 'Structured data format for developers',
    },
    csv: {
      label: 'CSV',
      icon: '📊',
      description: 'Spreadsheet-compatible format',
    },
    txt: {
      label: 'Text',
      icon: '📝',
      description: 'Human-readable text format',
    },
    pdf: {
      label: 'PDF',
      icon: '📋',
      description: 'Formatted document for printing',
    },
  };

  return (
    <Card className={`cosmic-glass border-cosmic-purple/30 ${className}`}>
      <CardHeader className="bg-cosmic-purple/20 border-b border-cosmic-purple/30">
        <CardTitle className="text-xl text-cosmic-gold flex items-center gap-2">
          💾 Export Chart Data
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportedFormats.map((format) => {
            const formatInfo = formatLabels[format as ExportFormat];
            const isCurrentlyExporting = isExporting && lastExportFormat === format;
            
            return (
              <Button
                key={format}
                onClick={() => {
                  void handleExport(format as ExportFormat);
                }}
                onKeyDown={handleKeyDown(format as ExportFormat)}
                disabled={isExporting}
                className={`flex flex-col items-center space-y-2 p-4 h-auto focus:outline-none focus:ring-2 focus:ring-cosmic-gold/50 ${
                  isCurrentlyExporting
                    ? 'bg-cosmic-gold/20 border-cosmic-gold'
                    : 'bg-cosmic-purple/10 border-cosmic-purple/30 hover:bg-cosmic-purple/20'
                }`}
                data-testid={`export-${format}-button`}
                aria-label={`Export chart data as ${formatInfo.label}: ${formatInfo.description}`}
              >
                <div className="text-2xl">{formatInfo.icon}</div>
                <div className="font-semibold text-cosmic-gold">
                  {isCurrentlyExporting ? 'Exporting...' : formatInfo.label}
                </div>
                <div className="text-xs text-cosmic-silver text-center">
                  {formatInfo.description}
                </div>
              </Button>
            );
          })}
        </div>
        
        {/* Export Statistics */}
        <div className="mt-6 pt-4 border-t border-cosmic-purple/30">
          <div className="text-sm text-cosmic-silver">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Planets:</span> {chartData.planets.length}
              </div>
              <div>
                <span className="font-medium">Aspects:</span> {chartData.aspects.length}
              </div>
              <div>
                <span className="font-medium">Houses:</span> {chartData.houses.length}
              </div>
              <div>
                <span className="font-medium">Asteroids:</span> {chartData.asteroids.length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ChartDataExport.displayName = 'ChartDataExport';

export { ChartDataExport };
export default ChartDataExport;
