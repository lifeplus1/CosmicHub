import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BirthSummaryHeader } from '../BirthSummaryHeader';
import { createStubBirthData } from '../../../test-utils/createStubBirthData';

describe('BirthSummaryHeader accessibility & shortcuts', () => {
  const base = createStubBirthData({
    year: 1990,
    month: 5,
    day: 17,
    hour: 10,
    minute: 45,
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    timezone: 'America/New_York',
  });

  it('announces recalculation state changes', () => {
    const onEdit = vi.fn();
    const onRecalc = vi.fn();
    const onSave = vi.fn();
    const { rerender } = render(
      <BirthSummaryHeader
        birthData={base}
        isLoading={false}
        onEdit={onEdit}
        onRecalculate={onRecalc}
        onSave={onSave}
      />
    );

    const region = screen.getByRole('region', { name: /natal chart/i });
    expect(region).toBeInTheDocument();

    // Simulate loading state toggle
    rerender(
      <BirthSummaryHeader
        birthData={base}
        isLoading={true}
        onEdit={onEdit}
        onRecalculate={onRecalc}
        onSave={onSave}
      />
    );
    expect(
      screen.getByRole('button', { name: /chart calculation in progress/i })
    ).toBeDisabled();
  });

  it('supports keyboard shortcuts (e, r, s)', () => {
    const onEdit = vi.fn();
    const onRecalc = vi.fn();
    const onSave = vi.fn();
    render(
      <BirthSummaryHeader
        birthData={base}
        isLoading={false}
        onEdit={onEdit}
        onRecalculate={onRecalc}
        onSave={onSave}
      />
    );
    const region = screen.getByRole('region', { name: /natal chart/i });
    region.focus();
    fireEvent.keyDown(region, { key: 'e' });
    fireEvent.keyDown(region, { key: 'r' });
    fireEvent.keyDown(region, { key: 's' });
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onRecalc).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
