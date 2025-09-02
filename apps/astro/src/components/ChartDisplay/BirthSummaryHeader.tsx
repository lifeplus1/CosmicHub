import React, { useCallback } from 'react';
import { Card, Button } from '@cosmichub/ui';
import type { ExtendedBirthData } from '@cosmichub/types';

// Accessibility note: This header summarises the loaded chart context. We expose
// a landmark-ish grouping with aria-labelledby so screen reader users can jump
// directly here. We also add keyboard shortcuts for common actions.

interface Props {
  birthData: ExtendedBirthData;
  isLoading: boolean;
  onEdit: () => void;
  onRecalculate: () => void;
  onSave: () => void;
}

export const BirthSummaryHeader: React.FC<Props> = ({
  birthData,
  isLoading,
  onEdit,
  onRecalculate,
  onSave,
}) => {
  const {
    year,
    month,
    day,
    hour,
    minute,
    city,
    latitude: lat,
    longitude: lon,
  } = birthData;

  // Keyboard shortcuts (e to edit, r to recalc, s to save) when focus is inside region
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === 'e') {
        onEdit();
      } else if (e.key === 'r') {
        if (!isLoading) onRecalculate();
      } else if (e.key === 's') {
        onSave();
      }
    },
    [onEdit, onRecalculate, onSave, isLoading]
  );

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <div
      role='region'
      aria-describedby='birth-data-summary'
      aria-labelledby='chart-page-heading'
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <Card className='p-6'>
        <div className='flex flex-col md:flex-row md:justify-between gap-4 items-start'>
          <div>
            <h1 id='chart-page-heading' className='text-2xl font-bold mb-2'>
              Natal Chart
            </h1>
            <div
              id='birth-data-summary'
              className='text-sm text-gray-600 space-y-1'
            >
              <p>
                <span className='font-medium'>Born:</span>{' '}
                <time
                  dateTime={`${dateStr}T${timeStr}:00Z`}
                  suppressHydrationWarning
                >
                  {dateStr}
                </time>{' '}
                at{' '}
                <time
                  dateTime={`${dateStr}T${timeStr}:00Z`}
                  suppressHydrationWarning
                >
                  {timeStr}
                </time>
              </p>
              <p>
                <span className='font-medium'>Location:</span>{' '}
                {city ?? <span className='italic text-gray-500'>Unknown</span>}
              </p>
              {typeof lat === 'number' && typeof lon === 'number' && (
                <p>
                  <span className='font-medium'>Coordinates:</span>{' '}
                  <span
                    aria-label={`Latitude ${lat.toFixed(4)} degrees, Longitude ${lon.toFixed(4)} degrees`}
                  >
                    {lat.toFixed(4)}°, {lon.toFixed(4)}°
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className='flex flex-wrap gap-2' aria-label='Chart actions'>
            <Button
              variant='secondary'
              onClick={onEdit}
              aria-label='Edit birth data (e)'
            >
              Edit
            </Button>
            <Button
              onClick={onRecalculate}
              disabled={isLoading}
              aria-live='polite'
              aria-label={
                isLoading
                  ? 'Chart calculation in progress'
                  : 'Recalculate chart (r)'
              }
            >
              {isLoading ? 'Calculating…' : 'Recalculate'}
            </Button>
            <Button
              onClick={onSave}
              className='bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark'
              aria-label='Save chart (s)'
            >
              <span aria-hidden='true'>💾</span> Save
            </Button>
          </div>
        </div>
        <p className='sr-only mt-2'>
          Press e to edit birth data, r to recalculate, s to save when this
          region is focused.
        </p>
      </Card>
    </div>
  );
};
