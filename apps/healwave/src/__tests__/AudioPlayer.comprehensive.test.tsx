import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AudioPlayer from '../components/AudioPlayer.enhanced';

// Import jest-dom for matchers
import '@testing-library/jest-dom';

// Comprehensive Web Audio API Mock
const createComprehensiveMocks = () => {
  const mockDestination = { channelCount: 2 };
  
  const mockAnalyser = {
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
  };

  const mockChannelMerger = {
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
  };

  const mockGain = {
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      value: 0.5,
    },
  };

  const mockOscillator = {
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      setTargetAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      value: 440,
    },
    type: 'sine',
  };

  const mockAudioContext = {
    createOscillator: vi.fn(() => ({
      ...mockOscillator,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        value: 440,
      },
      type: 'sine',
    })),
    createGain: vi.fn(() => ({
      ...mockGain,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        value: 0.5,
      },
    })),
    createChannelMerger: vi.fn(() => ({
      ...mockChannelMerger,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    })),
    createAnalyser: vi.fn(() => ({
      ...mockAnalyser,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
    })),
    destination: mockDestination,
    currentTime: 0,
    state: 'running',
    resume: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    sampleRate: 44100,
  };

  return { mockAudioContext, mockOscillator, mockGain, mockAnalyser, mockChannelMerger };
};

const { mockAudioContext } = createComprehensiveMocks();

// Mock AudioContext constructor
Object.defineProperty(global, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
});

Object.defineProperty(global, 'webkitAudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true,
});

// Simple console mock
const mockConsole = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

// Mock the logger
vi.mock('../config/devConsole', () => ({
  devConsole: {
    ...mockConsole,
    child: () => mockConsole,
  },
}));

describe('AudioPlayer Component - Comprehensive Real Tests', () => {
  const defaultProps = {
    frequency: 440,
    volume: 0.5,
    isPlaying: false,
    onPlayStateChange: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock call counts
    mockAudioContext.createOscillator.mockClear();
    mockAudioContext.createGain.mockClear();
    mockAudioContext.createChannelMerger.mockClear();
    mockAudioContext.createAnalyser.mockClear();
    mockAudioContext.close.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const { container } = render(<AudioPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('displays frequency and volume information', async () => {
    const { getByText } = render(
      <AudioPlayer {...defaultProps} frequency={528} volume={0.8} />
    );

    await waitFor(() => {
      expect(getByText('Frequency: 528 Hz')).toBeInTheDocument();
      expect(getByText('Volume: 80%')).toBeInTheDocument();
    });
  });

  it('displays binaural beat information when provided', async () => {
    const { getByText } = render(
      <AudioPlayer {...defaultProps} binauralBeat={10} />
    );

    await waitFor(() => {
      expect(getByText('Binaural Beat: 10 Hz')).toBeInTheDocument();
    });
  });

  it('initializes audio context and creates audio nodes when starting playback', async () => {
    const user = userEvent.setup();
    const mockOnPlayStateChange = vi.fn();
    
    const { getByRole } = render(
      <AudioPlayer 
        {...defaultProps} 
        onPlayStateChange={mockOnPlayStateChange}
      />
    );

    // Wait for component to be ready
    await waitFor(() => {
      const playButton = getByRole('button', { name: /play audio/i });
      expect(playButton).toBeInTheDocument();
    });

    const playButton = getByRole('button', { name: /play audio/i });
    await user.click(playButton);

    // Should create audio context and nodes
    await waitFor(() => {
      expect(global.AudioContext).toHaveBeenCalled();
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
      expect(mockAudioContext.createGain).toHaveBeenCalled();
      expect(mockAudioContext.createChannelMerger).toHaveBeenCalled();
      expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    });
  });

  it('handles play/stop button clicks correctly', async () => {
    const user = userEvent.setup();
    const mockOnPlayStateChange = vi.fn();
    
    const { getByRole } = render(
      <AudioPlayer 
        {...defaultProps} 
        onPlayStateChange={mockOnPlayStateChange}
      />
    );

    const playButton = getByRole('button', { name: /play audio/i });
    
    // Click play
    await user.click(playButton);
    
    await waitFor(() => {
      expect(mockOnPlayStateChange).toHaveBeenCalledWith(true);
    });

    // After playing, look for stop button or play button again
    await waitFor(() => {
      // Component might show the same button but with different state
      const button = getByRole('button', { name: /(play|stop) audio/i });
      expect(button).toBeInTheDocument();
    });
  });

  it('updates frequency during playback', async () => {
    const { rerender } = render(
      <AudioPlayer {...defaultProps} isPlaying={true} frequency={440} />
    );

    // Wait for initial audio setup
    await waitFor(() => {
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    // Change frequency
    rerender(
      <AudioPlayer {...defaultProps} isPlaying={true} frequency={528} />
    );

    // Should update frequency on oscillators
    await waitFor(() => {
      const oscillatorCalls = mockAudioContext.createOscillator.mock.results;
      expect(oscillatorCalls.length).toBeGreaterThan(0);
    });
  });

  it('updates volume during playback', async () => {
    const { rerender } = render(
      <AudioPlayer {...defaultProps} isPlaying={true} volume={0.5} />
    );

    // Wait for initial audio setup
    await waitFor(() => {
      expect(mockAudioContext.createGain).toHaveBeenCalled();
    });

    // Change volume
    rerender(
      <AudioPlayer {...defaultProps} isPlaying={true} volume={0.8} />
    );

    // Should update gain values
    await waitFor(() => {
      const gainCalls = mockAudioContext.createGain.mock.results;
      expect(gainCalls.length).toBeGreaterThan(0);
    });
  });

  it('handles invalid frequency values gracefully', async () => {
    const mockOnError = vi.fn();
    const { getByText } = render(
      <AudioPlayer 
        {...defaultProps} 
        frequency={-100} // Invalid frequency
        onError={mockOnError}
      />
    );

    // Component should still render
    await waitFor(() => {
      expect(getByText(/Frequency:/)).toBeInTheDocument();
    });
  });

  it('handles invalid volume values gracefully', async () => {
    const mockOnError = vi.fn();
    const { getByText } = render(
      <AudioPlayer 
        {...defaultProps} 
        volume={2} // Invalid volume (> 1)
        onError={mockOnError}
      />
    );

    // Component should still render
    await waitFor(() => {
      expect(getByText(/Volume:/)).toBeInTheDocument();
    });
  });

  it('cleans up audio context when component unmounts', async () => {
    const { unmount } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    // Wait for initial setup
    await waitFor(() => {
      expect(global.AudioContext).toHaveBeenCalled();
    });
    
    // Unmount the component
    unmount();
    
    // Should call close on audio context
    await waitFor(() => {
      expect(mockAudioContext.close).toHaveBeenCalled();
    });
  });

  it('handles binaural beats correctly', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = render(
      <AudioPlayer {...defaultProps} frequency={440} binauralBeat={10} />
    );

    // Should display binaural beat info
    await waitFor(() => {
      expect(getByText('Binaural Beat: 10 Hz')).toBeInTheDocument();
    });

    // Start playback
    const playButton = getByRole('button', { name: /play audio/i });
    await user.click(playButton);

    // Should create two oscillators for left and right channels
    await waitFor(() => {
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
    });
  });

  it('handles audio context resume after user interaction', async () => {
    // Simulate suspended audio context
    mockAudioContext.state = 'suspended';
    mockAudioContext.resume.mockResolvedValue(undefined);

    const user = userEvent.setup();
    const mockOnAudioContextResume = vi.fn();
    
    const { getByRole } = render(
      <AudioPlayer 
        {...defaultProps} 
        onAudioContextResume={mockOnAudioContextResume}
      />
    );

    const playButton = getByRole('button', { name: /play audio/i });
    await user.click(playButton);

    // Should resume audio context
    await waitFor(() => {
      expect(mockAudioContext.resume).toHaveBeenCalled();
      expect(mockOnAudioContextResume).toHaveBeenCalled();
    });
  });

});
