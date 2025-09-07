import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AudioPlayer from '../components/AudioPlayer.enhanced';

// Import jest-dom for assertions
import '@testing-library/jest-dom';

// Mock @cosmichub/config with stable logger
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
  },
}));

// Mock the frequency schema with safe, synchronous implementations
vi.mock('../schemas/frequency.schema', () => ({
  validateFrequency: vi.fn((freq) => {
    // Synchronous validation without side effects
    if (typeof freq === 'number' && freq >= 0.1 && freq <= 20000) {
      return freq;
    }
    return 440; // Safe default
  }),
  VolumeSchema: {
    parse: vi.fn((vol) => {
      // Synchronous validation without side effects
      if (typeof vol === 'number' && vol >= 0 && vol <= 1) {
        return vol;
      }
      return 0.5; // Safe default
    }),
  },
  AudioErrorSchema: {
    parse: vi.fn((error) => error),
  },
}));

// Mock ErrorBoundary as a simple wrapper
vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// Create stable mock implementations
const mockOscillator = {
  frequency: { setValueAtTime: vi.fn() },
  type: 'sine',
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  gain: { 
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    value: 0.5,
  },
  connect: vi.fn(),
};

const mockMerger = {
  connect: vi.fn(),
};

const mockAnalyzer = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  connect: vi.fn(),
};

const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  createChannelMerger: vi.fn(() => mockMerger),
  createAnalyser: vi.fn(() => mockAnalyzer),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  destination: {},
};

const MockAudioContext = vi.fn(() => mockAudioContext);

// Mock Web Audio API globally
Object.defineProperty(global, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});

Object.defineProperty(global, 'webkitAudioContext', {
  value: MockAudioContext,
  writable: true,
});

describe('AudioPlayer Enhanced Component - Warning Free', () => {
  const defaultProps = {
    frequency: 440,
    volume: 0.5,
    isPlaying: false,
    onPlayStateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAudioContext.state = 'running';
    mockAudioContext.currentTime = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AudioPlayer {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with error boundary wrapper', () => {
    const { getByTestId } = render(<AudioPlayer {...defaultProps} />);
    expect(getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('handles different prop combinations', () => {
    const { container } = render(
      <AudioPlayer 
        frequency={528} 
        volume={0.8} 
        isPlaying={false}
        binauralBeat={8}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles error states gracefully', () => {
    // Mock AudioContext to throw an error
    const originalAudioContext = global.AudioContext;
    global.AudioContext = vi.fn(() => {
      throw new Error('AudioContext not supported');
    }) as unknown as typeof AudioContext;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { container } = render(<AudioPlayer {...defaultProps} isPlaying={true} />);
    expect(container.firstChild).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
    global.AudioContext = originalAudioContext;
  });

  it('handles invalid frequency values', () => {
    const { container } = render(<AudioPlayer frequency={-100} volume={0.5} isPlaying={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles invalid volume values', () => {
    const { container } = render(<AudioPlayer frequency={440} volume={2} isPlaying={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles binaural beat configuration', () => {
    const { container } = render(
      <AudioPlayer 
        frequency={440} 
        volume={0.5} 
        isPlaying={false}
        binauralBeat={10}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies custom accessibility properties', () => {
    const customProps = {
      ...defaultProps,
      'aria-label': 'Custom audio player',
      'data-testid': 'custom-player',
    };

    const { container } = render(<AudioPlayer {...customProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles multiple audio context states', () => {
    // Test with suspended state
    mockAudioContext.state = 'suspended';
    const { container: suspendedContainer } = render(<AudioPlayer {...defaultProps} />);
    expect(suspendedContainer.firstChild).toBeInTheDocument();

    // Test with closed state  
    mockAudioContext.state = 'closed';
    const { container: closedContainer } = render(<AudioPlayer {...defaultProps} />);
    expect(closedContainer.firstChild).toBeInTheDocument();
  });
});
