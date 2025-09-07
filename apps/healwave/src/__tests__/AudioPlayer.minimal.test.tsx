import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Import jest-dom for assertions
import '@testing-library/jest-dom';

// Mock @cosmichub/config
vi.mock('@cosmichub/config', () => ({
  logger: {
    child: vi.fn(() => ({
      child: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Web Audio API
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 440 },
    type: 'sine',
  })),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 0.5 },
  })),
  destination: {},
  state: 'running',
  resume: vi.fn(),
};

// TypeScript interface for global
interface GlobalWithAudio extends NodeJS.Global {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}

const globalWithAudio = global as unknown as GlobalWithAudio;
globalWithAudio.AudioContext = vi.fn(() => mockAudioContext) as unknown as typeof AudioContext;
globalWithAudio.webkitAudioContext = vi.fn(() => mockAudioContext) as unknown as typeof AudioContext;

// Now import the component after mocks are set up
import AudioPlayer from '../components/AudioPlayer.enhanced';

describe('AudioPlayer Enhanced Component - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<AudioPlayer frequency={440} volume={0.5} isPlaying={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with basic props', () => {
    const { queryByTestId } = render(
      <AudioPlayer frequency={440} volume={0.5} isPlaying={false} />
    );
    
    // Should render either the main audio player or loading state
    const audioPlayer = queryByTestId('audio-player') || queryByTestId('audio-player-loading');
    expect(audioPlayer).toBeInTheDocument();
  });

  it('handles binaural beat prop', () => {
    const { container } = render(
      <AudioPlayer frequency={440} volume={0.5} isPlaying={false} binauralBeat={10} />
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles error states gracefully', () => {
    // Mock AudioContext to throw an error
    const originalAudioContext = globalWithAudio.AudioContext;
    globalWithAudio.AudioContext = vi.fn(() => {
      throw new Error('AudioContext not available');
    }) as unknown as typeof AudioContext;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { container } = render(<AudioPlayer frequency={440} volume={0.5} isPlaying={false} />);
    
    expect(container.firstChild).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
    globalWithAudio.AudioContext = originalAudioContext;
  });

  it('handles invalid frequency values', () => {
    const { container } = render(<AudioPlayer frequency={-100} volume={0.5} isPlaying={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles invalid volume values', () => {
    const { container } = render(<AudioPlayer frequency={440} volume={2} isPlaying={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders play button when ready', () => {
    const { queryByRole, queryByTestId } = render(
      <AudioPlayer frequency={440} volume={0.5} isPlaying={false} />
    );
    
    // Should have a button element somewhere, either immediately or after loading
    const button = queryByRole('button') || queryByTestId('play-button');
    if (button) {
      expect(button).toBeInTheDocument();
    } else {
      // Component might be in loading state
      const loadingElement = queryByTestId('audio-player-loading');
      expect(loadingElement).toBeInTheDocument();
    }
  });
});
