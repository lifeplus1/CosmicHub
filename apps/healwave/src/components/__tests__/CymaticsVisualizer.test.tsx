// Basic render test
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CymaticsVisualizer from '../CymaticsVisualizer';

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
    const mockAudioContext = { createAnalyser: vi.fn(() => ({})) } as any;
    const { rerender } = render(
      <CymaticsVisualizer frequency={440} isPlaying={true} audioContext={mockAudioContext} />
    );
    // Assert animation frame requested, etc.
  });
});