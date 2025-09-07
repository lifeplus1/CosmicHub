import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Import jest-dom for matchers
import '@testing-library/jest-dom';

// Mock dependencies first
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  setDoc: vi.fn(),
  doc: vi.fn(),
}));

vi.mock('@cosmichub/auth', () => ({
  signUp: vi.fn(),
}));

vi.mock('../../components/common/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}));

vi.mock('../../components/signup/BasicAccountForm', () => ({
  BasicAccountForm: () => <div data-testid="basic-account-form">Basic Account Form</div>,
}));

vi.mock('../../components/signup/PersonalInfoForm', () => ({
  PersonalInfoForm: () => <div data-testid="personal-info-form">Personal Info Form</div>,
}));

vi.mock('../../components/signup/PreferencesForm', () => ({
  PreferencesForm: () => <div data-testid="preferences-form">Preferences Form</div>,
}));

vi.mock('../../components/signup/ConsentForm', () => ({
  ConsentForm: () => <div data-testid="consent-form">Consent Form</div>,
}));

// Import after mocking
import SignupContainer from '../../components/signup/SignupContainer';

describe('SignupContainer Basic Tests', () => {
  const mockOnClose = vi.fn();
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<SignupContainer onClose={mockOnClose} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('displays initial step information', () => {
    const { getByText } = render(<SignupContainer onClose={mockOnClose} />);
    
    expect(getByText('Step 1 of 4')).toBeInTheDocument();
    expect(getByText('25%')).toBeInTheDocument();
  });

  it('shows basic account form on first step', () => {
    const { getByTestId } = render(<SignupContainer onClose={mockOnClose} />);
    
    expect(getByTestId('basic-account-form')).toBeInTheDocument();
  });

  it('shows continue button', () => {
    const { getByText } = render(<SignupContainer onClose={mockOnClose} />);
    
    expect(getByText('Continue')).toBeInTheDocument();
  });

  it('does not show back button on first step', () => {
    const { queryByText } = render(<SignupContainer onClose={mockOnClose} />);
    
    expect(queryByText('Back')).not.toBeInTheDocument();
  });

  it('shows "Sign In Instead" button when onSwitchToLogin is provided', () => {
    const { getByText } = render(
      <SignupContainer onClose={mockOnClose} onSwitchToLogin={mockOnSwitchToLogin} />
    );
    
    expect(getByText('Sign In Instead')).toBeInTheDocument();
  });

  it('does not show "Sign In Instead" button when onSwitchToLogin is not provided', () => {
    const { queryByText } = render(<SignupContainer onClose={mockOnClose} />);
    
    expect(queryByText('Sign In Instead')).not.toBeInTheDocument();
  });

  it('renders the SignupContainer component successfully', () => {
    const { container } = render(<SignupContainer onClose={mockOnClose} />);
    
    // Verify the main signup container structure is rendered
    const signupContainer = container.querySelector('[class*="signupContainer"]');
    expect(signupContainer).toBeInTheDocument();
  });
});
