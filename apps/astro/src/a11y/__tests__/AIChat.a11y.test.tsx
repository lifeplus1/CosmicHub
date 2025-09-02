import React from 'react';
import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import AIChat from '../../components/AIChat';
import { expectNoA11yViolations } from '../utils/axe';

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

describe('AIChat accessibility', () => {
  it('baseline rendering has no critical axe violations', async () => {
    const { container } = render(<AIChat />);
    await expectNoA11yViolations(container as HTMLElement, {
      allow: ['color-contrast'],
    });
  }, 30000);
});
