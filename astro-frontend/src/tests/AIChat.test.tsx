import { render, screen } from '@testing-library/react';
import AIChat from '../components/AIChat';

describe('AIChat', () => {
  it('renders input and send button', () => {
    render(<AIChat />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
});
