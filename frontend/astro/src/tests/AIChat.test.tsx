
import { render, screen } from '@testing-library/react';
import AIChat from '../components/AIChat';
import { AuthProvider } from '../shared/AuthContext';
import { MemoryRouter } from 'react-router-dom';

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
