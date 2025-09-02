import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
// @ts-expect-error: types may not resolve in monorepo test context
import userEvent from '@testing-library/user-event';

// Mock Firebase auth completely
vi.mock('../../firebase', () => ({
  auth: {
    currentUser: { uid: 'test-user', getIdToken: vi.fn().mockResolvedValue('mock-token') }
  }
}));

// Mock the entire API module
vi.mock('../../services/api', () => ({
  generateAIInterpretation: vi.fn(),
  updateInterpretation: vi.fn(),
}));

// Mock the useAIInterpretation hook
vi.mock('../useAIInterpretation', () => ({
  useAIInterpretation: vi.fn(),
}));

// Import the component after mocks
import InterpretationForm from '../InterpretationForm';
import { generateAIInterpretation, updateInterpretation } from '../../services/api';
import { useAIInterpretation } from '../useAIInterpretation';

// Type the mocks
const mockGenerateAIInterpretation = vi.mocked(generateAIInterpretation);
const mockUpdateInterpretation = vi.mocked(updateInterpretation);
const mockUseAIInterpretation = vi.mocked(useAIInterpretation);

describe('InterpretationForm - Fixed Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock return for useAIInterpretation hook
    mockUseAIInterpretation.mockReturnValue({
      generateInterpretation: vi.fn(),
      clearInterpretation: vi.fn(),
      interpretation: null,
      loading: false,
      error: null,
    } as any);
  });

  describe('API Integration', () => {
    it('calls generateAIInterpretation with correct chart data', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      mockGenerateAIInterpretation.mockResolvedValueOnce({
        success: true,
        data: { content: 'Test interpretation' }
      } as any);
      
      render(
        <InterpretationForm 
          mode="chart" 
          chartId="test-chart"
        />
      );
      
      // Add a focus area
      const personalityFocus = screen.getByRole('button', { name: /personality overview/i });
      await user.click(personalityFocus);
      
      // Add a question
      const questionInput = screen.getByLabelText(/specific question/i);
      await user.type(questionInput, 'What is my purpose?');
      
      // Generate interpretation
      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);
      
      // Verify API call
      await waitFor(() => {
        expect(mockGenerateAIInterpretation).toHaveBeenCalledWith(
          expect.objectContaining({
            chartId: 'test-chart',
            type: 'natal',
            focus_areas: expect.arrayContaining(['personality']),
            question: 'What is my purpose?',
          })
        );
      });
    });

    it('handles authentication errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock auth error
      mockGenerateAIInterpretation.mockRejectedValueOnce(
        new Error('Authentication required')
      );
      
      render(<InterpretationForm mode="chart" chartId="test-chart" />);
      
      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);
      
      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/failed to generate interpretation/i)).toBeInTheDocument();
      });
    });
  });
});
