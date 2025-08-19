import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { PlanetTable } from '../';

const sample = [
  { name: 'Sun', sign: 'Aries', degree: '10.25', house: 1, retrograde: false },
  { name: 'Moon', sign: 'Taurus', degree: '23.50', house: 2, retrograde: false }
];

const fallbackSample = [
  { name: 'FooPlanet', sign: 'UnknownSign', degree: '12.00', house: 3 }
];

describe('PlanetTable', () => {
  it('renders planet rows with symbols and formatted degrees', () => {
    const { container } = render(<PlanetTable data={sample} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    const utils = within(table as HTMLElement);
    expect(utils.getAllByText('Sun').length).toBeGreaterThan(0);
    expect(utils.getAllByText('Moon').length).toBeGreaterThan(0);
    expect(utils.getAllByText(/°/).length).toBeGreaterThan(0);
    expect(utils.getAllByText('☉').length).toBeGreaterThan(0);
    expect(utils.getAllByText('☽').length).toBeGreaterThan(0);
  });

  it('falls back to generic symbols for unknown planet/sign', () => {
    const { container } = render(<PlanetTable data={fallbackSample} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    const utils = within(table as HTMLElement);
    expect(utils.getAllByText('FooPlanet').length).toBeGreaterThan(0);
    expect(utils.getAllByText('●').length).toBeGreaterThan(0);
    expect(utils.getAllByText('○').length).toBeGreaterThan(0);
  });
});
