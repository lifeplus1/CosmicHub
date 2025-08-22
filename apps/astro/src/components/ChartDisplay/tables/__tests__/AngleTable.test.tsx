import { describe, it, expect } from 'vitest';
import { render, within } from '@testing-library/react';
import { AngleTable } from '../';

const sample = [
  { name: 'Ascendant', sign: 'Leo', degree: '15.00' },
  { name: 'Midheaven', sign: 'Taurus', degree: '02.50' }
];

const fallbackSample = [
  { name: 'UnknownAngle', sign: 'UnknownSign', degree: '10.00' }
];

describe('AngleTable', () => {
  it('renders angle rows with symbols', () => {
    const { container } = render(<AngleTable data={sample} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    const utils = within(table as HTMLElement);
    expect(utils.getAllByText('Ascendant').length).toBeGreaterThan(0);
    expect(utils.getAllByText('Midheaven').length).toBeGreaterThan(0);
  });

  it('renders fallback symbols for unknown angle/sign', () => {
    const { container } = render(<AngleTable data={fallbackSample} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    const utils = within(table as HTMLElement);
    expect(utils.getAllByText('●').length).toBeGreaterThan(0);
    expect(utils.getAllByText('○').length).toBeGreaterThan(0);
  });

  it('renders nothing for empty data', () => {
    const { container } = render(<AngleTable data={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
