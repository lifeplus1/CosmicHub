import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Variant 1: feature available so children should render directly
vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
  useSubscription: () => ({
    userTier: 'premium',
    hasFeature: () => true,
  })
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

import FeatureGuard from '../FeatureGuard';

describe('FeatureGuard (additional scenarios)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children normally when feature is available (no blur / upgrade card)', () => {
    const { container } = render(
      <FeatureGuard requiredTier="premium" feature="ai_interpretation">
        <div data-testid="feature-content">Visible Content</div>
      </FeatureGuard>
    );
    expect(screen.getByTestId('feature-content')).toBeInTheDocument();
    // Ensure no blur overlay wrapper (simple heuristic)
    expect(container.querySelector('.blur-lg')).toBeNull();
  // Ensure upgrade card container not rendered (cosmic-card class)
  expect(container.querySelector('.cosmic-card')).toBeNull();
  });
});
