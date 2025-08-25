import React from 'react';
import { describe, it, expect, vi } from 'vitest';
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
    post: vi
      .fn()
      .mockResolvedValue({
        data: { choices: [{ message: { content: 'Hi' } }] },
      }),
  },
}));

vi.mock('../../components/ToastProvider', () => ({
  useToast: () => ({ toast: () => {} }),
}));

describe('AIChat accessibility', () => {
  it('baseline rendering has no critical axe violations', async () => {
    const { container } = render(<AIChat />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
  });
});
