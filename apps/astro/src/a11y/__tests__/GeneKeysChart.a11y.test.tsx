import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from '../utils/axe';
import GeneKeysChart from '../../components/GeneKeysChart/GeneKeysChart';

const minimalBirthData: any = {
  year: 2000,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
};

describe('GeneKeysChart a11y', () => {
  it('has no critical accessibility violations in empty state', async () => {
    const { container } = render(<GeneKeysChart birthData={undefined} />);
    await expectNoA11yViolations(container as HTMLElement);
    expect(true).toBe(true);
  });

  it('has no critical accessibility violations when calculating (loading)', async () => {
    const { container } = render(
      <GeneKeysChart birthData={minimalBirthData} />
    );
    // Loading state appears immediately before async resolves in tests (API mocked elsewhere if needed)
    await expectNoA11yViolations(container as HTMLElement);
    expect(true).toBe(true);
  });
});
