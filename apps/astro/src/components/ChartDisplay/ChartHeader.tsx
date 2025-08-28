import React from 'react';
import { CardTitle, Button, Tooltip, Input } from '@cosmichub/ui';

export interface ChartHeaderProps {
  chartType: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onShare: () => void;
  onExport: (format: 'json' | 'csv' | 'txt') => void;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  chartType,
  searchTerm,
  onSearchChange,
  onShare,
  onExport,
}) => {
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            onSearchChange(e.target.value)
          }
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
              onClick={onShare}
              className='text-xs px-3 py-1'
              aria-label='Share chart'
            >
              📤 Share
            </Button>
          </Tooltip>
          <Tooltip content='Export as JSON'>
            <Button
              variant='secondary'
              onClick={() => onExport('json')}
              className='text-xs px-3 py-1'
              aria-label='Export chart data as JSON'
            >
              JSON
            </Button>
          </Tooltip>
          <Tooltip content='Export as CSV'>
            <Button
              variant='secondary'
              onClick={() => onExport('csv')}
              className='text-xs px-3 py-1'
              aria-label='Export chart data as CSV'
            >
              CSV
            </Button>
          </Tooltip>
          <Tooltip content='Export as Text'>
            <Button
              variant='secondary'
              onClick={() => onExport('txt')}
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
