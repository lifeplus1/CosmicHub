import { render, screen } from '@testing-library/react';
import AIChat from '../components/AIChat';
import { AuthProvider } from '../shared/AuthContext';

describe('AIChat', () => {
  it('renders input and send button', () => {
    render(
      <AuthProvider>
        <AIChat />
      </AuthProvider>
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
});
