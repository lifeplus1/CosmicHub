# Frequency Generator A/B Test

This directory contains a comprehensive A/B testing framework for comparing different frequency generator implementations in the CosmicHub HealWave application.

## Overview

The A/B test compares 4 different frequency generator variants to determine which provides the best user experience:

1. **Control**: Classic Frequency Generator (original implementation)
2. **Enhanced Controls**: Advanced controls with tier restrictions and custom presets
3. **D3 Visualization**: Professional D3.js charts with real-time frequency visualization
4. **Sacred Geometry**: Spiritual interface with sacred geometry patterns and chakra alignment

## Files

- `FrequencyGeneratorABTest.tsx` - Main A/B test component
- `FrequencyGeneratorExperimentConfig.ts` - Experiment configuration and metrics
- `__tests__/FrequencyGeneratorABTest.test.tsx` - Unit tests for the A/B test

## Usage

### Basic Integration

```tsx
import { FrequencyGeneratorABTest } from './experiments/FrequencyGeneratorABTest';

// Replace your existing frequency generator component
<FrequencyGeneratorABTest
  onFrequencyChange={(frequency) => console.log('Frequency:', frequency)}
  onVolumeChange={(volume) => console.log('Volume:', volume)}
  onDurationChange={(duration) => console.log('Duration:', duration)}
/>
```

### Advanced Integration

```tsx
import { FrequencyGeneratorABTest } from './experiments/FrequencyGeneratorABTest';
import { FREQUENCY_GENERATOR_EXPERIMENT_CONFIG } from './experiments/FrequencyGeneratorExperimentConfig';

const MyComponent = () => {
  const handleFrequencyChange = (frequency: number) => {
    // Your frequency change logic
    analytics.track('frequency_changed', { frequency });
  };

  const handleVolumeChange = (volume: number) => {
    // Your volume change logic
  };

  const handleDurationChange = (duration: number) => {
    // Your duration change logic
  };

  return (
    <FrequencyGeneratorABTest
      onFrequencyChange={handleFrequencyChange}
      onVolumeChange={handleVolumeChange}
      onDurationChange={handleDurationChange}
    />
  );
};
```

## Experiment Configuration

The experiment is configured with:

- **Duration**: 21 days
- **Allocation**: 25% per variant (equal distribution)
- **Target Metrics**:
  - Primary: User engagement score, session duration, feature discovery rate
  - Secondary: Frequency selections, preset usage, visualization interactions, etc.
- **Success Criteria**: Specific targets for each metric with improvement directions

## User Assignment

Users are assigned to variants using a consistent hash-based bucketing system:

```typescript
const getUserVariant = (userId: string) => {
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bucket = hash % 100;

  // 25% split for each variant
  if (bucket < 25) return 'control';
  if (bucket < 50) return 'enhanced-controls';
  if (bucket < 75) return 'd3-visualization';
  return 'sacred-geometry';
};
```

## Analytics & Tracking

The A/B test automatically tracks:

- **Experiment Events**: Started, session duration, interactions
- **User Interactions**: Frequency changes, volume adjustments, preset selections
- **Performance Metrics**: Component load times, error rates
- **Engagement Metrics**: Session duration, feature usage patterns

### Development Mode Features

When `NODE_ENV === 'development'`, the component displays:

- Current variant assignment
- Experiment metadata
- Session statistics
- Feature flags

## Testing

Run the A/B test validation:

```bash
npm test -- src/experiments/__tests__/FrequencyGeneratorABTest.test.tsx
```

## Metrics & Analysis

### Primary Metrics

- **User Engagement Score**: Combination of interaction frequency and depth
- **Session Duration**: How long users spend with each variant
- **Feature Discovery Rate**: Percentage of available features used

### Secondary Metrics

- **Frequency Selections**: How often users change frequencies
- **Preset Usage Rate**: Frequency of preset selections vs custom frequencies
- **Visualization Interactions**: Clicks, hovers on D3.js elements
- **Binaural Beat Usage**: Adoption rate of binaural features
- **Conversion to Paid Features**: Upgrade prompts effectiveness
- **User Satisfaction Rating**: Post-session feedback scores
- **Accessibility Compliance**: WCAG adherence metrics
- **Performance Metrics**: Load times, responsiveness
- **Error Rate**: JavaScript errors and failed interactions
- **Support Ticket Rate**: Help requests per variant

## Statistical Analysis

The experiment uses Bayesian A/B testing with:

- **Minimum Sample Size**: 1,000 users per variant
- **Confidence Level**: 95%
- **Analysis Periods**: Daily, weekly, and final analysis
- **Guardrail Metrics**: Error rate and performance monitoring

## Integration Checklist

- [ ] Import the A/B test component
- [ ] Replace existing frequency generator
- [ ] Configure analytics tracking
- [ ] Set up experiment monitoring
- [ ] Define success criteria
- [ ] Plan post-experiment analysis
- [ ] Prepare fallback strategies

## Best Practices

1. **Consistent User Experience**: Same user always sees the same variant
2. **Minimal Performance Impact**: Lightweight tracking and assignment
3. **Comprehensive Analytics**: Track all relevant user interactions
4. **Statistical Rigor**: Use proper statistical methods for analysis
5. **User Privacy**: Respect user consent for tracking
6. **Fail-Safe Design**: Graceful fallback if experiment fails

## Troubleshooting

### Common Issues

1. **Variant Assignment Inconsistency**
   - Check user ID generation
   - Verify hash function consistency

2. **Analytics Not Tracking**
   - Ensure analytics service is properly configured
   - Check network connectivity

3. **Performance Degradation**
   - Monitor bundle size impact
   - Optimize tracking calls

4. **User Experience Issues**
   - Test all variants thoroughly
   - Monitor error rates per variant

## Future Enhancements

- **Multi-armed Bandit**: Dynamic traffic allocation based on performance
- **Segmented Testing**: Different variants for different user segments
- **Progressive Rollout**: Gradual increase of winning variant
- **Automated Analysis**: Real-time statistical significance calculation
- **Personalization**: ML-based variant assignment

## Support

For questions about the A/B test implementation:

1. Check the experiment configuration in `FrequencyGeneratorExperimentConfig.ts`
2. Review the test file for usage examples
3. Monitor experiment metrics in your analytics dashboard
4. Consult the statistical analysis plan for result interpretation
