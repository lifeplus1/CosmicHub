import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import AIChat from '../../AIChat';
import * as apiModule from '../../../services/api';
import axios, { AxiosResponse } from 'axios';

// Define types for mocks
interface AuthUser {
  uid: string;
}

interface AuthContext {
  user: AuthUser | null;
  loading: boolean;
}

// Create a mock function that we can control in tests
const mockUseAuth = vi.hoisted(() => vi.fn());

// Mock the api module (correct relative path to services/api)
vi.mock('../../../services/api', () => ({
  getAuthToken: vi.fn(),
}));

// Mock the auth package with our controllable mock
vi.mock('@cosmichub/auth', () => ({
  useAuth: mockUseAuth,
}));

// Mock the ToastProvider
vi.mock('../components/ToastProvider', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock axios for API calls
vi.mock('axios');

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    Navigate: ({ to }: { to: string }) => (
      <div data-testid='navigate-to'>{to}</div>
    ),
  };
});

// Helper component to wrap components with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('AIChat Component', () => {
  const mockGetAuthToken = vi.mocked(apiModule.getAuthToken as any);
  const mockAxios = vi.mocked(axios);
  const mockAxiosPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthToken.mockReset();
    mockAxiosPost.mockReset();
    mockAxios.post = mockAxiosPost;
    mockUseAuth.mockReset();
    cleanup(); // Clean up DOM between tests
  });

  afterEach(() => {
    cleanup(); // Additional cleanup after each test
  });

  it('renders loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    } as AuthContext);

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    expect(screen.getAllByText('Loading...')[0]).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    } as AuthContext);

    render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    expect(screen.getByTestId('navigate-to')).toHaveTextContent('/login');
  });

  it('renders chat interface when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
    } as AuthContext);

    const { container } = render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const chatInterface = container.querySelector('[aria-label="AI Astrology Chat Interface"]');
    expect(chatInterface).toBeInTheDocument();
    
    if (chatInterface) {
      const withinChat = within(chatInterface as HTMLElement);
      expect(withinChat.getByText('AI Astrology Chat')).toBeInTheDocument();
      expect(withinChat.getByPlaceholderText('Ask about your chart...')).toBeInTheDocument();
      expect(withinChat.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    }
  });

  it('handles message input correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
    } as AuthContext);

    const { container } = render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const chatInterface = container.querySelector('[aria-label="AI Astrology Chat Interface"]');
    expect(chatInterface).toBeInTheDocument();
    
    if (chatInterface) {
      const withinChat = within(chatInterface as HTMLElement);
      const textarea = withinChat.getByPlaceholderText('Ask about your chart...') as HTMLTextAreaElement;
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      expect(textarea).toHaveValue('Test message');
    }
  });

  it('submits message and displays response', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
    } as AuthContext);

    mockGetAuthToken.mockResolvedValue('mock-token');
    mockAxiosPost.mockResolvedValue({
      data: {
        choices: [{ message: { content: 'Test interpretation' } }],
      },
    } as AxiosResponse);

    const { container } = render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const chatInterface = container.querySelector('[aria-label="AI Astrology Chat Interface"]');
    expect(chatInterface).toBeInTheDocument();
    
    if (chatInterface) {
      const withinChat = within(chatInterface as HTMLElement);
      const textarea = withinChat.getByRole('textbox') as HTMLTextAreaElement;
      const submitButton = withinChat.getByRole('button', { name: /send message/i });

      fireEvent.change(textarea, { target: { value: 'Test question' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          expect.stringContaining('/chat'),
          { text: 'Test question' },
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-token',
            }),
          })
        );
      });
    }
  });

  it('handles API error gracefully', async () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
    } as AuthContext);

    mockGetAuthToken.mockResolvedValue('mock-token');
    mockAxiosPost.mockRejectedValue(new Error('API Error'));

    const { container } = render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const chatInterface = container.querySelector('[aria-label="AI Astrology Chat Interface"]');
    expect(chatInterface).toBeInTheDocument();
    
    if (chatInterface) {
      const withinChat = within(chatInterface as HTMLElement);
      const textarea = withinChat.getByRole('textbox') as HTMLTextAreaElement;
      const submitButton = withinChat.getByRole('button', { name: /send message/i });

      fireEvent.change(textarea, { target: { value: 'Test question' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalled();
      });
    }
  });

  it('disables submit button when message is empty', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
    } as AuthContext);

    const { container } = render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const chatInterface = container.querySelector('[aria-label="AI Astrology Chat Interface"]');
    expect(chatInterface).toBeInTheDocument();
    
    if (chatInterface) {
      const withinChat = within(chatInterface as HTMLElement);
      const submitButton = withinChat.getByRole('button', { name: /send message/i });
      expect(submitButton).toBeDisabled();
    }
  });

  it('enables submit button when message has content', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-user' },
      loading: false,
    } as AuthContext);

    const { container } = render(
      <TestWrapper>
        <AIChat />
      </TestWrapper>
    );

    const chatInterface = container.querySelector('[aria-label="AI Astrology Chat Interface"]');
    expect(chatInterface).toBeInTheDocument();
    
    if (chatInterface) {
      const withinChat = within(chatInterface as HTMLElement);
      const textarea = withinChat.getByRole('textbox') as HTMLTextAreaElement;
      const submitButton = withinChat.getByRole('button', { name: /send message/i });

      fireEvent.change(textarea, { target: { value: 'Test message' } });
      expect(submitButton).not.toBeDisabled();
    }
  });
});
