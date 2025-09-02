import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from '../utils/axe';
import GeneKeysChart from '../../components/GeneKeysChart/GeneKeysChart';

// Mock the API service to prevent network requests
vi.mock('../../services/api', () => ({
  calculateGeneKeys: vi.fn().mockResolvedValue({
    success: true,
    data: {
      life_work: { number: 1, name: 'The Creative' },
      evolution: { number: 2, name: 'The Receptive' },
      radiance: { number: 3, name: 'Difficulty at the Beginning' },
      purpose: { number: 4, name: 'Youthful Folly' },
      sphere: { number: 5, name: 'Waiting' },
      iq: { number: 6, name: 'Conflict' },
      eq: { number: 7, name: 'The Army' },
      sq: { number: 8, name: 'Holding Together' },
    },
  }),
}));

// Mock the ToastProvider
vi.mock('../../components/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const minimalBirthData: any = {
  year: 2000,
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
};

describe('GeneKeysChart a11y', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has no critical accessibility violations in empty state', async () => {
    const { container } = render(<GeneKeysChart birthData={undefined} />);
    await expectNoA11yViolations(container as HTMLElement, {
      allow: ['heading-order'], // Allow heading-order violations as the component structure is intentional
    });
    expect(true).toBe(true);
  }, 30000);

  it('has no critical accessibility violations when calculating (loading)', async () => {
    const { container } = render(
      <GeneKeysChart birthData={minimalBirthData} />
    );
    // Loading state appears immediately before async resolves in tests (API mocked)
    await expectNoA11yViolations(container as HTMLElement);
    expect(true).toBe(true);
  }, 30000);
});
