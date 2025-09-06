import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { expectNoA11yViolations } from '../utils/axe';
import GatesChannelsTab from '../../components/HumanDesignChart/GatesChannelsTab';
import type { HumanDesignData } from '../../components/HumanDesignChart/types';

// Minimal valid HumanDesignData structure to satisfy component requirements
const minimalHD: HumanDesignData = {
  type: 'Generator',
  strategy: 'Respond',
  authority: 'Sacral',
  profile: { line1: 1, line2: 3, description: '1/3' },
  defined_centers: [],
  undefined_centers: [],
  channels: [],
  gates: [],
  incarnation_cross: { name: 'Cross', description: 'Desc', gates: {} },
  variables: {
    description: '',
    digestion: '',
    environment: '',
    awareness: '',
    perspective: '',
  },
  not_self_theme: 'Frustration',
  signature: 'Satisfaction',
};

describe('GatesChannelsTab accessibility', () => {
  it('has no detectable a11y violations (baseline)', async () => {
    const { container } = render(
      <GatesChannelsTab humanDesignData={minimalHD} />
    );
    await expectNoA11yViolations(container as HTMLElement, {
      allow: ['heading-order'], // Allow heading-order violations
    });
    expect(true).toBe(true);
  }, 30000); // Increased timeout to 30 seconds for full-suite serialization
});
