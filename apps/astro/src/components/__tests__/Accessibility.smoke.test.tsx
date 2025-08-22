import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { GatesChannelsTab } from '../HumanDesignChart/GatesChannelsTab';
import type { HumanDesignData } from '../HumanDesignChart/types';

describe('Accessibility smoke tests', () => {
  beforeAll(() => {
    const canvas = HTMLCanvasElement.prototype as unknown;
    const hasContext = canvas !== null && 
                       canvas !== undefined && 
                       typeof canvas === 'object' && 
                       !('getContext' in canvas);
                       
    if (hasContext) {
      (HTMLCanvasElement.prototype as any).getContext = (): Record<string, unknown> => ({});
    }
  });
  const minimalData: HumanDesignData = {
    type: 'Generator',
    strategy: 'Respond',
    authority: 'Sacral',
    profile: { line1: 3, line2: 5, description: '3/5' },
    defined_centers: [],
    undefined_centers: [],
    channels: [],
    gates: [
      { number: 1, name: 'Gate 1', type: 'personality', line: 1, planet: 'sun', planet_symbol: '☉', center: 'G' },
      { number: 2, name: 'Gate 2', type: 'design', line: 2, planet: 'earth', planet_symbol: '⊕', center: 'G' }
    ],
    incarnation_cross: { name: 'Test', description: 'Test cross', gates: {} },
    variables: { description: '', digestion: '', environment: '', awareness: '', perspective: '' },
    not_self_theme: 'Frustration',
    signature: 'Satisfaction'
  };

  it('GatesChannelsTab has no critical a11y violations', async () => {
    const { container } = render(<GatesChannelsTab humanDesignData={minimalData} />);
  const results = await axe(container);
  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical.length).toBe(0);
  });
});
