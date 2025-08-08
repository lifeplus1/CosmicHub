import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AIChat from '../components/AIChat';
import { AuthProvider } from '@cosmichub/auth';

describe('AIChat', () => {
  it('renders input and send button', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AIChat />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
});
