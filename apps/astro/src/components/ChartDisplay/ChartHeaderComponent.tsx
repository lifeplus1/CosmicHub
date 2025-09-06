import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';

export interface ChartHeaderProps {
  /** Chart title/name */
  title?: string;
  /** Birth date and time */
  birthDateTime?: Date;
  /** Location information */
  location?: {
    name: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  /** Chart type (natal, synastry, etc.) */
  chartType?: string;
  /** Export functionality */
  onExport?: () => void;
  /** Share functionality */
  onShare?: () => void;
  /** Print functionality */
  onPrint?: () => void;
  /** Show action buttons */
  showActions?: boolean;
}

/**
 * Header component for chart display with metadata and actions
 * Shows birth info, location, and export options
 */
export const ChartHeader: React.FC<ChartHeaderProps> = memo(({
  title = "Natal Chart",
  birthDateTime,
  location,
  chartType = "Natal",
  onExport,
  onShare,
  onPrint,
  showActions = true
}) => {
  // Format birth date and time
  const formattedDateTime = useMemo(() => {
    if (!birthDateTime) return null;
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    return {
      date: birthDateTime.toLocaleDateString('en-US', dateOptions),
      time: birthDateTime.toLocaleTimeString('en-US', timeOptions)
    };
  }, [birthDateTime]);

  // Format location coordinates
  const formattedLocation = useMemo(() => {
    if (!location) return null;
    
    const latDir = location.latitude >= 0 ? 'N' : 'S';
    const lonDir = location.longitude >= 0 ? 'E' : 'W';
    
    return {
      coordinates: `${Math.abs(location.latitude).toFixed(2)}°${latDir}, ${Math.abs(location.longitude).toFixed(2)}°${lonDir}`,
      name: location.name,
      timezone: location.timezone
    };
  }, [location]);

  // Action handlers
  const handleExport = useCallback(() => {
    onExport?.();
  }, [onExport]);

  const handleShare = useCallback(() => {
    onShare?.();
  }, [onShare]);

  const handlePrint = useCallback(() => {
    onPrint?.();
  }, [onPrint]);

  return (
    <Card className='w-full cosmic-glass border border-cosmic-purple/30 mb-6'>
      <CardHeader className='bg-gradient-to-r from-cosmic-purple to-cosmic-blue text-cosmic-gold rounded-t-xl'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <CardTitle className='text-2xl font-bold flex items-center gap-3'>
            <span className='text-3xl'>🌟</span>
            <div>
              <div>{title}</div>
              <div className='text-sm font-normal text-cosmic-gold/80 mt-1'>
                {chartType} Chart Analysis
              </div>
            </div>
          </CardTitle>
          
          {/* Action buttons */}
          {showActions && (
            <div className='flex gap-2'>
              {onPrint && (
                <button
                  onClick={handlePrint}
                  className='p-2 bg-cosmic-gold/20 hover:bg-cosmic-gold/30 rounded-lg transition-colors duration-200'
                  title='Print Chart'
                  aria-label='Print chart'
                >
                  🖨️
                </button>
              )}
              {onShare && (
                <button
                  onClick={handleShare}
                  className='p-2 bg-cosmic-gold/20 hover:bg-cosmic-gold/30 rounded-lg transition-colors duration-200'
                  title='Share Chart'
                  aria-label='Share chart'
                >
                  📤
                </button>
              )}
              {onExport && (
                <button
                  onClick={handleExport}
                  className='p-2 bg-cosmic-gold/20 hover:bg-cosmic-gold/30 rounded-lg transition-colors duration-200'
                  title='Export Chart'
                  aria-label='Export chart data'
                >
                  💾
                </button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className='p-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {/* Birth Information */}
          {formattedDateTime && (
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold text-cosmic-silver flex items-center gap-2'>
                📅 Birth Information
              </h4>
              <div className='text-sm text-cosmic-silver/80 space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='w-12'>Date:</span>
                  <span>{formattedDateTime.date}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-12'>Time:</span>
                  <span>{formattedDateTime.time}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Location Information */}
          {formattedLocation && (
            <div className='space-y-2'>
              <h4 className='text-sm font-semibold text-cosmic-silver flex items-center gap-2'>
                📍 Location
              </h4>
              <div className='text-sm text-cosmic-silver/80 space-y-1'>
                <div className='flex items-start gap-2'>
                  <span className='w-12 shrink-0'>Place:</span>
                  <span className='break-words'>{formattedLocation.name}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='w-12'>Coords:</span>
                  <span className='font-mono text-xs'>{formattedLocation.coordinates}</span>
                </div>
                {formattedLocation.timezone && (
                  <div className='flex items-center gap-2'>
                    <span className='w-12'>Zone:</span>
                    <span className='text-xs'>{formattedLocation.timezone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Chart generation timestamp */}
        <div className='mt-4 pt-3 border-t border-cosmic-purple/20'>
          <div className='text-xs text-cosmic-silver/60 text-center'>
            Chart generated on {new Date().toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ChartHeader.displayName = 'ChartHeader';
