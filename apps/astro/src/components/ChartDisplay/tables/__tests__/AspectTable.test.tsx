import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { AspectTable } from '../';

const sample = [
  { planet1: 'Sun', planet2: 'Moon', type: 'Conjunction', orb: '1.2', applying: 'Applying' },
  { planet1: 'Mars', planet2: 'Venus', type: 'Trine', orb: '0.05', applying: 'Separating' },
  { planet1: 'Jupiter', planet2: 'Saturn', type: 'Square', orb: '0.0', applying: 'Exact' }
];

const fallbackSample = [
  { planet1: 'Foo', planet2: 'Bar', type: 'WeirdAspect', orb: '2.0', applying: 'Separating' }
];

describe('AspectTable', () => {
  it('renders aspects with symbols and statuses', () => {
    const { container } = render(<AspectTable data={sample} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    const utils = within(table as HTMLElement);
    expect(utils.getAllByText('Conjunction').length).toBeGreaterThan(0);
    expect(utils.getAllByText('Trine').length).toBeGreaterThan(0);
    expect(utils.getAllByText('Square').length).toBeGreaterThan(0);
    const applyingEl = utils.getAllByText('Applying')[0];
    const separatingEl = utils.getAllByText('Separating')[0];
    const exactEl = utils.getAllByText('Exact')[0];
    expect(applyingEl.className).toMatch(/text-green-400/);
    expect(separatingEl.className).toMatch(/text-cosmic-silver/);
    expect(exactEl.className).toMatch(/text-cosmic-gold/);
    expect((table as HTMLElement).textContent).toContain('☌');
    expect((table as HTMLElement).textContent).toContain('△');
    expect((table as HTMLElement).textContent).toContain('□');
  });

  it('falls back to generic aspect symbol for unknown type', () => {
    const { container } = render(<AspectTable data={fallbackSample} />);
    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect((table as HTMLElement).textContent).toContain('◇');
  });
});
