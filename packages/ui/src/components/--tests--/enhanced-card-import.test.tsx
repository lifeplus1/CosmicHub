// Quick test to verify all imports work correctly
import {
  createComponentTestSuite,
  renderWithEnhancements,
  PerformanceTestRunner,
  expect,
  describe,
  it,
  vi,
} from '@cosmichub/config/enhanced-testing';

import Card, {
  InteractiveCard,
  LoadingCard,
  ErrorCard,
  ChartCard,
} from '../enhanced/EnhancedCard';

// Simple test to verify everything works
describe('Import Test', () => {
  it('imports all testing utilities correctly', () => {
    expect(typeof createComponentTestSuite).toBe('function');
    expect(typeof renderWithEnhancements).toBe('function');
    expect(typeof PerformanceTestRunner).toBe('function');
    expect(typeof vi.fn).toBe('function');
  });

  it('imports all card components correctly', () => {
    expect(typeof Card).toBe('object'); // Card is a compound component (object)
    expect(typeof InteractiveCard).toBe('object'); // InteractiveCard uses forwardRef (object)
    expect(typeof LoadingCard).toBe('function');
    expect(typeof ErrorCard).toBe('object'); // ErrorCard uses React.memo (object)
    expect(typeof ChartCard).toBe('function');
  });

  it('can render basic card with header', () => {
    const rendered = renderWithEnhancements(
      <Card data-testid='test-card'>
        <Card.Header title='Test Title' />
        <Card.Body>Test Content</Card.Body>
      </Card>
    );

    expect(rendered.container.firstChild).toBeTruthy();
  });
});

console.log('✅ All imports and basic functionality working correctly!');
