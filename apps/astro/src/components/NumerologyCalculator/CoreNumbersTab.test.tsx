import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CoreNumbersTab from './CoreNumbersTab';
import type { CoreNumbers } from './types';

describe('CoreNumbersTab', () => {
  const mockCoreNumbers: CoreNumbers = {
    life_path: {
      number: 7,
      meaning: 'You are a spiritual seeker with deep analytical abilities.',
      components: { month: 1, day: 15, year: 1990 }
    },
    destiny: {
      number: 5,
      meaning: 'You are destined for freedom and adventure.',
    },
    soul_urge: {
      number: 3,
      meaning: 'Your soul yearns for creative expression.',
    },
    personality: {
      number: 2,
      meaning: 'You appear cooperative and diplomatic.',
    },
    birth_day: {
      number: 15,
      meaning: 'You are naturally nurturing and family-oriented.',
    },
    attitude: {
      number: 6,
      meaning: 'You approach life with responsibility and care.',
    },
    power_name: {
      number: 8,
      meaning: 'Your name carries material success energy.',
    },
  };

  it('renders CoreNumbersTab with data', () => {
    render(<CoreNumbersTab coreNumbers={mockCoreNumbers} />);

    // Check for the titles and numbers
    expect(screen.getByText('Life Path')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Destiny')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Soul Urge')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays all core numbers', () => {
    render(<CoreNumbersTab coreNumbers={mockCoreNumbers} />);

    // Check that all core number types are displayed (use getAllByText to handle multiple renders)
    expect(screen.getAllByText('Life Path')).toHaveLength(2);
    expect(screen.getAllByText('Destiny')).toHaveLength(2);
    expect(screen.getAllByText('Soul Urge')).toHaveLength(2);
    expect(screen.getAllByText('Personality')).toHaveLength(2);
    expect(screen.getAllByText('Birth Day')).toHaveLength(2);
    expect(screen.getAllByText('Attitude')).toHaveLength(2);
    expect(screen.getAllByText('Power Name')).toHaveLength(2);
  });
});