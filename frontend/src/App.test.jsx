// frontend/src/App.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './components/AuthProvider';

describe('App', () => {
  it('renders App component', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/Cosmic Insights/)).toBeInTheDocument(); // Adjust based on actual content
  });
});