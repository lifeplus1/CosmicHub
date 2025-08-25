import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
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
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
