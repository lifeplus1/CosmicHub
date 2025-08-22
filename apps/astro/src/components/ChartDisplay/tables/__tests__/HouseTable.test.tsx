import { describe, it, expect } from 'vitest';
import { render, within } from '@testing-library/react';
import { HouseTable } from '../';

const sample = [
  { number: 1, sign: 'Aries', cuspDegree: '0.00', planetsInHouse: '' },
  { number: 2, sign: 'Taurus', cuspDegree: '29.59', planetsInHouse: 'Venus' }
];

describe('HouseTable', () => {
  it('renders houses with signs and degrees', () => {
    const { container } = render(<HouseTable data={sample} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    const utils = within(table as HTMLElement);
    expect(utils.getAllByText('1').length).toBeGreaterThan(0);
    expect(utils.getAllByText('Aries').length).toBeGreaterThan(0);
    expect(utils.getAllByText('Taurus').length).toBeGreaterThan(0);
  });

  it('returns null (renders nothing) for empty data', () => {
    const { container } = render(<HouseTable data={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
