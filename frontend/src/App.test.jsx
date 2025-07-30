import { render, screen } from '@testing-library/react';
import App from './App';

test('renders astrology app', () => {
  render(<App />);
  expect(screen.getByText(/astrology/i)).toBeInTheDocument(); // Adjust text to match your app
});