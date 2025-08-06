import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HumanDesignChart from '../components/HumanDesignChart';
import { AuthProvider } from '../contexts/AuthContext';
import * as api from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  calculateHumanDesign: vi.fn()
}));

const mockCalculateHumanDesign = vi.mocked(api.calculateHumanDesign);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
);

const mockBirthData = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  city: 'New York'
};

const mockHumanDesignData = {
  type: 'Generator',
  strategy: 'To Respond',
  authority: 'Sacral',
  profile: '4/6',
  defined_centers: ['Sacral', 'Solar Plexus'],
  undefined_centers: ['Head', 'Ajna', 'Throat', 'Identity', 'Will', 'Spleen', 'Root'],
  channels: ['Channel of Initiation (51-25)'],
  gates: [51, 25, 42, 3],
  incarnation_cross: 'Right Angle Cross of the Four Ways'
};

describe('HumanDesignChart Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalculateHumanDesign.mockResolvedValue(mockHumanDesignData);
  });

  it('renders basic human design chart interface', () => {
    render(
      <TestWrapper>
        <HumanDesignChart />
      </TestWrapper>
    );

    expect(screen.getByText(/enter your birth information/i)).toBeInTheDocument();
  });

  it('renders with birth data props', () => {
    render(
      <TestWrapper>
        <HumanDesignChart birthData={mockBirthData} />
      </TestWrapper>
    );

    // When birth data is provided, component automatically starts calculating
    expect(screen.getByText(/calculating your human design chart/i)).toBeInTheDocument();
  });

  it('renders calculate button when onCalculate prop is provided', () => {
    const mockOnCalculate = vi.fn();
    
    render(
      <TestWrapper>
        <HumanDesignChart onCalculate={mockOnCalculate} />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /calculate human design/i })).toBeInTheDocument();
  });

  it('calls onCalculate when button is clicked', () => {
    const mockOnCalculate = vi.fn();
    
    render(
      <TestWrapper>
        <HumanDesignChart onCalculate={mockOnCalculate} />
      </TestWrapper>
    );

    const calculateButton = screen.getByRole('button', { name: /calculate human design/i });
    fireEvent.click(calculateButton);

    expect(mockOnCalculate).toHaveBeenCalled();
  });
});
