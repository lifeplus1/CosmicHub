import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import AIChat from '../../components/AIChat';

vi.mock('@cosmichub/auth', () => ({
  useAuth: () => ({ user: { uid: 'u1' }, loading: false }),
}));

vi.mock('../../services/api', () => ({
  getAuthToken: async () => 'token',
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: { choices: [{ message: { content: 'Hi' } }] },
    }),
  },
}));

vi.mock('../../components/ToastProvider', () => ({
  useToast: () => ({ toast: () => {} }),
}));

// Global axe lock to prevent concurrent runs
let axeLock = Promise.resolve();

describe('AIChat accessibility', () => {
  beforeEach(() => {
    // Wait for any previous axe runs to complete
    return axeLock;
  });

  it('baseline rendering has no critical axe violations', async () => {
    // Acquire the axe lock
    const currentRun = axeLock.then(async () => {
      const { container } = render(<AIChat />);
      const results = await axe(container, {
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
    });
    
    axeLock = currentRun;
    await currentRun;
  });
});
