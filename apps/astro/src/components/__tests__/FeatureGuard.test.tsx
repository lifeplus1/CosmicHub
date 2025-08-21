import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FeatureGuard from '../FeatureGuard';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ user: { uid: 'x' } }),
  useSubscription: () => ({
    userTier: 'free',
    hasFeature: () => false,
  })
}));

describe('FeatureGuard', () => {
  it('renders upgrade card when feature not available', () => {
    render(<FeatureGuard requiredTier="premium" feature="ai_interpretation"><div>Hidden</div></FeatureGuard>);
  expect(screen.getAllByText(/Upgrade/i).length).toBeGreaterThan(0);
  });

  it('shows preview content blurred', () => {
    const { container } = render(<FeatureGuard requiredTier="premium" feature="ai_interpretation"><div data-testid="preview-content">Content</div></FeatureGuard>);
    const blurContainer = container.querySelector('.blur-lg');
    expect(blurContainer).not.toBeNull();
  });
});
