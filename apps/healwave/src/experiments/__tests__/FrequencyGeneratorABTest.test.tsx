import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FrequencyGeneratorABTest } from '../FrequencyGeneratorABTest';

// Mock the auth hook
vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({
    user: { uid: 'test-user-123', email: 'test@example.com' }
  })
}));

// Mock dev console
vi.mock('../config/devConsole', () => ({
  devConsole: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

// Mock components
vi.mock('../components/FrequencyGenerator', () => ({
  HealWaveFrequencyGenerator: () => null
}));

vi.mock('../components/FrequencyControls', () => ({
  default: () => null
}));

vi.mock('../components/EnhancedFrequencyGenerator', () => ({
  EnhancedFrequencyGenerator: () => null
}));

vi.mock('../components/enhancements/EnhancedHealWave', () => ({
  EnhancedHealWave: () => null
}));

describe('FrequencyGeneratorABTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports the component correctly', () => {
    expect(FrequencyGeneratorABTest).toBeDefined();
    expect(typeof FrequencyGeneratorABTest).toBe('function');
  });

  it('can be instantiated with props', () => {
    const onFrequencyChange = vi.fn();
    const onVolumeChange = vi.fn();
    const onDurationChange = vi.fn();

    const component = (
      <FrequencyGeneratorABTest
        onFrequencyChange={onFrequencyChange}
        onVolumeChange={onVolumeChange}
        onDurationChange={onDurationChange}
      />
    );

    expect(component).toBeDefined();
    expect(component.props.onFrequencyChange).toBe(onFrequencyChange);
    expect(component.props.onVolumeChange).toBe(onVolumeChange);
    expect(component.props.onDurationChange).toBe(onDurationChange);
  });

  it('has proper TypeScript interface', () => {
    interface TestProps {
      onFrequencyChange?: (frequency: number) => void;
      onVolumeChange?: (volume: number) => void;
      onDurationChange?: (duration: number) => void;
    }

    const props: TestProps = {
      onFrequencyChange: (_frequency: number) => _frequency * 2,
      onVolumeChange: (_volume: number) => _volume / 100,
      onDurationChange: (_duration: number) => _duration + 60
    };

    expect(props.onFrequencyChange?.(440)).toBe(880);
    expect(props.onVolumeChange?.(50)).toBe(0.5);
    expect(props.onDurationChange?.(300)).toBe(360);
  });
});
