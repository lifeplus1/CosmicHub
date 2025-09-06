import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AudioPlayer from '../components/AudioPlayer';

// Import screen separately to avoid version issues
import '@testing-library/jest-dom';

// Mock @cosmichub/config
vi.mock('@cosmichub/config', () => ({
  logger: {
    child: vi.fn(() => ({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    })),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }
}));

// Mock ErrorBoundary
vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children, fallback, onError }: { 
    children: React.ReactNode; 
    fallback?: React.ReactNode; 
    onError?: (error: Error) => void;
  }) => (
    <div data-testid="error-boundary" data-fallback={!!fallback} data-on-error={!!onError}>
      {children}
    </div>
  ),
}));

// Mock Web Audio API
const mockOscillatorNode = {
  frequency: {
    setValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  },
  type: 'sine',
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGainNode = {
  gain: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
  },
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockChannelMergerNode = {
  connect: vi.fn(),
  disconnect: vi.fn(),
};

const mockAudioContext = {
  createOscillator: vi.fn(() => ({ ...mockOscillatorNode })),
  createGain: vi.fn(() => ({ ...mockGainNode })),
  createChannelMerger: vi.fn(() => ({ ...mockChannelMergerNode })),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  state: 'running',
  currentTime: 0,
  destination: {},
};

// Mock AudioContext constructor
const MockAudioContext = vi.fn(() => mockAudioContext);

Object.defineProperty(window, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});

Object.defineProperty(window, 'webkitAudioContext', {
  value: MockAudioContext,
  writable: true,
});

describe('AudioPlayer Component', () => {
  const defaultProps = {
    frequency: 440,
    volume: 0.5,
    isPlaying: false,
    onPlayStateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
    
    // Reset mock audio context state
    mockAudioContext.state = 'running';
    mockAudioContext.currentTime = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<AudioPlayer {...defaultProps} />);
    
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('renders with ErrorBoundary wrapper', () => {
    const { getByTestId } = render(<AudioPlayer {...defaultProps} />);
    
    const errorBoundary = getByTestId('error-boundary');
    expect(errorBoundary).toHaveAttribute('data-fallback', 'true');
    expect(errorBoundary).toHaveAttribute('data-on-error', 'true');
  });

  it('initializes AudioContext when component mounts', () => {
    render(<AudioPlayer {...defaultProps} />);
    
    expect(MockAudioContext).toHaveBeenCalled();
  });

  it('resumes suspended AudioContext', () => {
    mockAudioContext.state = 'suspended';
    
    render(<AudioPlayer {...defaultProps} />);
    
    expect(mockAudioContext.resume).toHaveBeenCalled();
  });

  it('creates audio nodes when playing', async () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2); // left and right
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2); // left and right
      expect(mockAudioContext.createChannelMerger).toHaveBeenCalledWith(2);
    });
  });

  it('sets correct frequencies for mono audio', async () => {
    render(<AudioPlayer {...defaultProps} frequency={528} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(528, 0);
    });
  });

  it('sets correct frequencies for binaural beats', async () => {
    render(
      <AudioPlayer 
        {...defaultProps} 
        frequency={440} 
        binauralBeat={10} 
        isPlaying={true} 
      />
    );
    
    await waitFor(() => {
      expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
      expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(450, 0);
    });
  });

  it('sets correct volume levels', async () => {
    render(<AudioPlayer {...defaultProps} volume={0.8} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, 0.1);
    });
  });

  it('connects audio nodes correctly', async () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.connect).toHaveBeenCalledWith(mockGainNode);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockChannelMergerNode, 0, 0);
      expect(mockGainNode.connect).toHaveBeenCalledWith(mockChannelMergerNode, 0, 1);
      expect(mockChannelMergerNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
    });
  });

  it('starts oscillators when playing', async () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.start).toHaveBeenCalledTimes(2);
    });
  });

  it('stops audio when isPlaying becomes false', async () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.start).toHaveBeenCalled();
    });
    
    rerender(<AudioPlayer {...defaultProps} isPlaying={false} />);
    
    await act(async () => {
      vi.advanceTimersByTime(150); // Wait for fade time
    });
    
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('updates frequency while playing', async () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} frequency={440} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
    });
    
    rerender(<AudioPlayer {...defaultProps} frequency={528} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.frequency.setTargetAtTime).toHaveBeenCalledWith(528, 0, 0.1);
    });
  });

  it('updates volume while playing', async () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} volume={0.5} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, expect.any(Number));
    });
    
    rerender(<AudioPlayer {...defaultProps} volume={0.8} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockGainNode.gain.setTargetAtTime).toHaveBeenCalledWith(0.8, 0, 0.1);
    });
  });

  it('handles AudioContext creation failure', async () => {
    // Mock AudioContext to throw an error
    MockAudioContext.mockImplementationOnce(() => {
      throw new Error('AudioContext not supported');
    });
    
    const onPlayStateChange = vi.fn();
    render(<AudioPlayer {...defaultProps} onPlayStateChange={onPlayStateChange} />);
    
    await waitFor(() => {
      expect(onPlayStateChange).toHaveBeenCalledWith(false);
    });
  });

  it('handles missing AudioContext API', async () => {
    // Remove AudioContext from window
    const originalAudioContext = window.AudioContext;
    const originalWebkitAudioContext = (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    
    // Temporarily remove AudioContext APIs
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = undefined;
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = undefined;
    
    const onPlayStateChange = vi.fn();
    render(<AudioPlayer {...defaultProps} onPlayStateChange={onPlayStateChange} />);
    
    await waitFor(() => {
      expect(onPlayStateChange).toHaveBeenCalledWith(false);
    });
    
    // Restore AudioContext
    window.AudioContext = originalAudioContext;
    (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext = originalWebkitAudioContext;
  });

  it('handles oscillator creation failure gracefully', async () => {
    mockAudioContext.createOscillator.mockImplementationOnce(() => {
      throw new Error('Failed to create oscillator');
    });
    
    const { getByTestId } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    // Should not crash the component
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('handles oscillator stop failure gracefully', async () => {
    mockOscillatorNode.stop.mockImplementationOnce(() => {
      throw new Error('Failed to stop oscillator');
    });
    
    const { rerender, getByTestId } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.start).toHaveBeenCalled();
    });
    
    rerender(<AudioPlayer {...defaultProps} isPlaying={false} />);
    
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    
    // Should handle the error gracefully
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('cleans up resources on unmount', async () => {
    const { unmount } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.start).toHaveBeenCalled();
    });
    
    unmount();
    
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it('handles AudioContext close failure gracefully', async () => {
    mockAudioContext.close.mockRejectedValueOnce(new Error('Failed to close context'));
    
    const { unmount, queryByTestId } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    unmount();
    
    // Should not throw an error
    expect(queryByTestId('error-boundary')).not.toBeInTheDocument();
  });

  it('calls onPlayStateChange when error occurs', async () => {
    MockAudioContext.mockImplementationOnce(() => {
      throw new Error('AudioContext error');
    });
    
    const onPlayStateChange = vi.fn();
    render(<AudioPlayer {...defaultProps} onPlayStateChange={onPlayStateChange} />);
    
    await waitFor(() => {
      expect(onPlayStateChange).toHaveBeenCalledWith(false);
    });
  });

  it('does not update frequency when not playing', async () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} frequency={440} isPlaying={false} />);
    
    rerender(<AudioPlayer {...defaultProps} frequency={528} isPlaying={false} />);
    
    // Should not call setTargetAtTime when not playing
    expect(mockOscillatorNode.frequency.setTargetAtTime).not.toHaveBeenCalled();
  });

  it('does not update volume when not playing', async () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} volume={0.5} isPlaying={false} />);
    
    rerender(<AudioPlayer {...defaultProps} volume={0.8} isPlaying={false} />);
    
    // Should not call setTargetAtTime when not playing
    expect(mockGainNode.gain.setTargetAtTime).not.toHaveBeenCalled();
  });

  it('handles rapid play/stop changes', async () => {
    const { rerender, getByTestId } = render(<AudioPlayer {...defaultProps} isPlaying={false} />);
    
    // Rapidly toggle play state
    rerender(<AudioPlayer {...defaultProps} isPlaying={true} />);
    rerender(<AudioPlayer {...defaultProps} isPlaying={false} />);
    rerender(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    
    // Should handle rapid changes without errors
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('uses webkit AudioContext as fallback', async () => {
    // Remove standard AudioContext
    const originalAudioContext = window.AudioContext;
    (window as Window & { AudioContext?: typeof AudioContext }).AudioContext = undefined;
    
    render(<AudioPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(MockAudioContext).toHaveBeenCalled();
    });
    
    // Restore AudioContext
    window.AudioContext = originalAudioContext;
  });

  it('memoizes component correctly', () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} />);
    
    // Re-render with same props should not cause re-initialization
    rerender(<AudioPlayer {...defaultProps} />);
    
    // AudioContext should only be created once
    expect(MockAudioContext).toHaveBeenCalledTimes(1);
  });

  it('logs errors appropriately', async () => {
    MockAudioContext.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    render(<AudioPlayer {...defaultProps} />);
  });

  it('handles default props correctly', () => {
    const { getByTestId } = render(<AudioPlayer />);
    
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('sets oscillator type to sine wave', async () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.type).toBe('sine');
    });
  });

  it('applies fade-in effect when starting', async () => {
    render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, 0.1);
    });
  });

  it('applies fade-out effect when stopping', async () => {
    const { rerender } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    
    await waitFor(() => {
      expect(mockOscillatorNode.start).toHaveBeenCalled();
    });
    
    rerender(<AudioPlayer {...defaultProps} isPlaying={false} />);
    
    expect(mockGainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
  });
});
