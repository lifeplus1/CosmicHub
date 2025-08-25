import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeneKeysChart from './GeneKeysChart';
import type { BirthData } from './types';

// Mock the API service
vi.mock('../../services/api', () => ({
  calculateGeneKeys: vi.fn(),
}));

// Mock the ToastProvider
vi.mock('../ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('GeneKeysChart', () => {
  const mockBirthData: BirthData = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    city: 'New York',
    timezone: 'America/New_York',
    lat: 40.7128,
    lon: -74.006,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders GeneKeysChart with data', () => {
    render(<GeneKeysChart birthData={mockBirthData} />);

    // The component shows loading message during calculation
    expect(
      screen.getByText(/Calculating your Gene Keys profile/i)
    ).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<GeneKeysChart birthData={mockBirthData} />);

    // During calculation, it shows loading message with spinner
    expect(
      screen.getByText(/Calculating your Gene Keys profile/i)
    ).toBeInTheDocument();
    // Check for the loading spinner container
    const loadingContainer = screen
      .getByText(/Calculating your Gene Keys profile/i)
      .closest('div');
    expect(loadingContainer).toBeInTheDocument();
  });

  it('displays empty state when no birth data provided', () => {
    render(<GeneKeysChart />);

    // When no birth data, shows instruction message
    const messages = screen.getAllByText(
      /Enter your birth information to calculate your Gene Keys profile/i
    );
    expect(messages.length).toBeGreaterThan(0);
  });
});
