// frontend/src/App.test.jsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import { AuthProvider } from './components/AuthProvider';

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  useNavigate: vi.fn(),
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
}));

describe('App', () => {
  it('renders App component', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );
    expect(screen.getByText(/Cosmic Insights/)).toBeInTheDocument();
  });
});