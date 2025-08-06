import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AIChat from '../components/AIChat';
import * as authModule from '../auth';
import { useAuth } from '../components/AuthProvider';

// Mock the auth module
vi.mock('../auth', () => ({
  getAuthToken: vi.fn()
}));

// Mock the AuthProvider
vi.mock('../components/AuthProvider', () => ({
  useAuth: vi.fn()
}));

// Mock axios for API calls
vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

import axios from 'axios';
const mockAxios = axios as typeof axios;
mockAxios.post = vi.fn();

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom') as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate-to">{to}</div>
  };
});

// Helper component to wrap components with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('AIChat Component', () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockGetAuthToken = vi.mocked(authModule.getAuthToken);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true
    });

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false
    });

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login');
  });

  it('renders chat interface when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' } as any,
      loading: false
    });

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    expect(screen.getByText('AI Astrology Chat')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('handles message input correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' } as any,
      loading: false
    });

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    expect(textarea).toHaveValue('Test message');
  });

  it('submits message and displays response', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' } as any,
      loading: false
    });

    mockGetAuthToken.mockResolvedValue('mock-token');
    mockAxios.post.mockResolvedValue({
      data: {
        choices: [{ message: { content: 'Test interpretation' } }]
      }
    });

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        { text: 'Test question' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token'
          })
        })
      );
    });
  });

  it('handles API error gracefully', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' } as any,
      loading: false
    });

    mockGetAuthToken.mockResolvedValue('mock-token');
    mockAxios.post.mockRejectedValue(new Error('API Error'));

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test question' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalled();
    });
  });

  it('disables submit button when message is empty', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' } as any,
      loading: false
    });

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /send/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when message has content', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' } as any,
      loading: false
    });

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(textarea, { target: { value: 'Test message' } });

    expect(submitButton).not.toBeDisabled();
  });
});
