// Basic render test
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CymaticsVisualizer from '../CymaticsVisualizer';

// Mock the @cosmichub/ui module
vi.mock('@cosmichub/ui', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    isPositiveNumber: vi.fn((value: unknown): value is number => {
      return typeof value === 'number' && value > 0 && !isNaN(value);
    }),
    ErrorBoundary: ({ children }: { children: React.ReactNode; fallback?: React.ReactNode }) => children,
  };
});

describe('CymaticsVisualizer', () => {
  it('renders canvas with ARIA label for valid frequency', () => {
    render(<CymaticsVisualizer frequency={440} isPlaying={true} />);
    const canvas = screen.getByRole('img');
    expect(canvas).toHaveAttribute('aria-label', expect.stringContaining('440 Hz'));
  });

  it('shows invalid message for bad frequency', () => {
    render(<CymaticsVisualizer frequency={-1} isPlaying={true} />);
    expect(screen.getByText(/Invalid frequency/)).toBeInTheDocument();
  });

  // Integration: Mock AudioContext and verify drawCymatics calls
  it('animates on play with analyser', () => {
    const mockAnalyser = { disconnect: vi.fn(), frequencyBinCount: 256, getByteFrequencyData: vi.fn() };
    const mockAudioContext = { createAnalyser: vi.fn(() => mockAnalyser) } as unknown as AudioContext;
    render(
      <CymaticsVisualizer frequency={440} isPlaying={true} audioContext={mockAudioContext} />
    );
    // Assert animation frame requested, etc.
  });
});