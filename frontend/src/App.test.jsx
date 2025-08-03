// frontend/src/App.test.jsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import { AuthProvider } from './components/AuthProvider';

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: () => vi.fn(),
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
}));

vi.mock('./components/AuthProvider', () => ({
  // Mock the AuthProvider component
  AuthProvider: ({ children }) => <>{children}</>,
  // Mock the useAuth hook
  useAuth: () => ({ user: null, loading: false }),
}));

describe('App', () => {
  it('renders App component', () => {
    render(<App />);
    const elements = screen.getAllByText(/Cosmic Insights/);
    expect(elements.length).toBeGreaterThan(0);
  });
});