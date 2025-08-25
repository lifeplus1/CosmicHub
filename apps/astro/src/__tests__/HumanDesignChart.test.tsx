import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HumanDesignChart from '../components/HumanDesignChart/HumanDesignChart';
import * as api from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  calculateHumanDesign: vi.fn(),
}));

// Mock the auth hook
vi.mock('@cosmichub/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'test-user' },
    loading: false,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the ToastProvider
vi.mock('../components/ToastProvider', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

const mockCalculateHumanDesign = vi.mocked(api.calculateHumanDesign);

const TestWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => <MemoryRouter>{children}</MemoryRouter>;

const mockBirthData = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  city: 'New York',
};

const mockHumanDesignSuccess = {
  success: true as const,
  data: {
    human_design: {
      type: 'Generator',
      strategy: 'To Respond',
      authority: 'Sacral',
      profile: {
        line1: 4,
        line2: 6,
        description: '4/6 Profile - Opportunist/Role Model',
      },
      signature: 'Satisfaction',
      not_self_theme: 'Frustration',
      defined_centers: ['Sacral', 'Solar Plexus'],
      undefined_centers: [
        'Head',
        'Ajna',
        'Throat',
        'Identity',
        'Will',
        'Spleen',
        'Root',
      ],
      channels: [
        {
          gate1: 51,
          gate2: 25,
          name: 'Channel of Initiation',
          description: 'The Channel of Initiation (51-25)',
        },
      ],
      gates: [
        {
          number: 51,
          name: 'Gate of Shock',
          center: 'Heart',
          type: 'personality' as const,
        },
        {
          number: 25,
          name: 'Gate of Innocence',
          center: 'Identity',
          type: 'design' as const,
        },
      ],
      incarnation_cross: {
        name: 'Right Angle Cross of the Four Ways',
        description:
          'A cross focused on bringing new directions and possibilities',
        gates: {
          personality_sun: 51,
          personality_earth: 25,
          design_sun: 42,
          design_earth: 3,
        },
      },
      variables: {
        description: 'Left Angle Variable',
        digestion: 'Hot',
        environment: 'Markets',
        awareness: 'Taste',
        perspective: 'Power',
      },
    },
  },
};

describe('HumanDesignChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalculateHumanDesign.mockResolvedValue(mockHumanDesignSuccess);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders basic human design chart interface', () => {
    render(
      <TestWrapper>
        <HumanDesignChart />
      </TestWrapper>
    );

    expect(
      screen.getByText(/enter your birth information/i)
    ).toBeInTheDocument();
  });

  it('renders with birth data props', () => {
    render(
      <TestWrapper>
        <HumanDesignChart birthData={mockBirthData} />
      </TestWrapper>
    );

    // When birth data is provided, component automatically starts calculating
    expect(
      screen.getByText(/calculating your human design chart/i)
    ).toBeInTheDocument();
  });

  it('renders calculate button when onCalculate prop is provided', () => {
    const mockOnCalculate = vi.fn();

    render(
      <TestWrapper>
        <HumanDesignChart onCalculate={mockOnCalculate} />
      </TestWrapper>
    );

    expect(
      screen.getByRole('button', { name: /calculate human design/i })
    ).toBeInTheDocument();
  });

  it('calls onCalculate when button is clicked', () => {
    const mockOnCalculate = vi.fn();

    const { container } = render(
      <TestWrapper>
        <HumanDesignChart onCalculate={mockOnCalculate} />
      </TestWrapper>
    );

    // Find the button within this specific component instance
    const calculateButton = container.querySelector('button');
    expect(calculateButton).toBeTruthy();

    fireEvent.click(calculateButton!);

    expect(mockOnCalculate).toHaveBeenCalled();
  });
});
