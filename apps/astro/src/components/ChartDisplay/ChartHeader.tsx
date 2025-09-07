import React, { useCallback } from 'react';
import { CardTitle, Button, Tooltip, Input } from '@cosmichub/ui';

export interface ChartHeaderProps {
  chartType: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onShare: () => void;
  onExport: (format: 'json' | 'csv' | 'txt') => void;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({
  chartType,
  searchTerm,
  onSearchChange,
  onShare,
  onExport,
}) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  }, [onSearchChange]);

  const handleShareClick = useCallback(() => {
    onShare();
  }, [onShare]);

  const handleExportJSON = useCallback(() => {
    onExport('json');
  }, [onExport]);

  const handleExportCSV = useCallback(() => {
    onExport('csv');
  }, [onExport]);

  const handleExportTXT = useCallback(() => {
    onExport('txt');
  }, [onExport]);

  const handleShareKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleShareClick();
    }
  }, [handleShareClick]);

  const handleExportKeyDown = useCallback((format: 'json' | 'csv' | 'txt') => 
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onExport(format);
      }
    }, [onExport]
  );
  return (
    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
      <CardTitle className='text-2xl font-bold text-cosmic-gold'>
        ✨ {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
        Analysis
      </CardTitle>
      <div className='flex items-center gap-3'>
        <Input
          placeholder='🔍 Search planets, signs, aspects...'
          value={searchTerm}
          onChange={handleSearchChange}
          className='w-full sm:w-64 bg-cosmic-dark/30 border-cosmic-purple/30 text-cosmic-silver placeholder-cosmic-silver/60'
          aria-label='Search chart data'
          aria-describedby='chart-search-hint'
        />
        <span id='chart-search-hint' className='sr-only'>
          Type to filter rows across all tables by planet, sign, aspect or house
        </span>
        <div className='flex gap-2'>
          <Tooltip content='Share Chart'>
            <Button
              variant='default'
              onClick={handleShareClick}
              onKeyDown={handleShareKeyDown}
              className='text-xs px-3 py-1'
              aria-label='Share chart'
            >
              📤 Share
            </Button>
          </Tooltip>
          <Tooltip content='Export as JSON'>
            <Button
              variant='secondary'
              onClick={handleExportJSON}
              onKeyDown={handleExportKeyDown('json')}
              className='text-xs px-3 py-1'
              aria-label='Export chart data as JSON'
            >
              JSON
            </Button>
          </Tooltip>
          <Tooltip content='Export as CSV'>
            <Button
              variant='secondary'
              onClick={handleExportCSV}
              onKeyDown={handleExportKeyDown('csv')}
              className='text-xs px-3 py-1'
              aria-label='Export chart data as CSV'
            >
              CSV
            </Button>
          </Tooltip>
          <Tooltip content='Export as Text'>
            <Button
              variant='secondary'
              onClick={handleExportTXT}
              onKeyDown={handleExportKeyDown('txt')}
              className='text-xs px-3 py-1'
              aria-label='Export chart data as plain text'
            >
              TXT
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

// Memoize component to prevent unnecessary re-renders
const MemoizedChartHeader = React.memo(ChartHeader);
MemoizedChartHeader.displayName = 'ChartHeader';

export { MemoizedChartHeader as ChartHeader };
export default MemoizedChartHeader;