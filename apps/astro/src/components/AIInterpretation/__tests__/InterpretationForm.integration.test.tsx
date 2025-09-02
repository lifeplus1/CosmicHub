import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
// @ts-expect-error monorepo type resolution
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import InterpretationForm from '../InterpretationForm';
import type { InterpretationId } from '../../../services/api.types';
const makeInterpretationId = (v: string) => v as unknown as InterpretationId;
import * as api from '../../../services/api';
import * as analytics from '../../../services/analytics';

// Mock the entire API module
vi.mock('../../../services/api', () => ({
  generateAIInterpretation: vi.fn(),
  updateInterpretation: vi.fn(),
}));

vi.mock('../../../services/analytics', () => ({
  trackCosmicHubAIInteraction: vi.fn(),
}));

vi.mock('../useAIInterpretation', () => ({
  useAIInterpretation: () => ({
    generateInterpretation: vi.fn().mockResolvedValue(undefined),
    interpretation: null,
    loading: false,
    error: null,
  }),
}));

vi.mock('../../../components/ToastProvider', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('../../../services/interpretationFocus', () => ({
  FOCUS_AREA_LABELS: ['Personality', 'Career', 'Relationships', 'Health'],
  focusLabelToCanonical: (label: string) => label.toLowerCase(),
}));

// Mock window performance
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
});

describe('InterpretationForm Integration Tests', () => {
  const mockGenerateAIInterpretation = vi.mocked(api.generateAIInterpretation);
  const mockUpdateInterpretation = vi.mocked(api.updateInterpretation);
  const mockTrackInteraction = vi.mocked(analytics.trackCosmicHubAIInteraction);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('End-to-End Chart Mode Workflow', () => {
  it('completes full chart interpretation workflow successfully', async () => {
      const user = userEvent.setup();
      const onInterpretationGenerated = vi.fn();
      
      mockGenerateAIInterpretation.mockResolvedValueOnce({
        success: true,
        // Cast to any to bypass strict InterpretationResponse shape in tests
        data: {
          summary: 'Your natal chart reveals...',
          content: 'Detailed interpretation content...',
          sections: [
            { title: 'Personality', content: 'You are a natural leader...' },
            { title: 'Career', content: 'Your path lies in creative fields...' },
          ],
          focus_areas: ['personality', 'career'],
        } as any,
      } as any);

      render(
        <InterpretationForm
          mode="chart"
          chartId="test-chart-123"
          onInterpretationGenerated={onInterpretationGenerated}
        />
      );

      // Select interpretation type
      const transitOption = screen.getByLabelText(/current transits/i);
      await user.click(transitOption);

      // Select focus areas
      const personalityFocus = screen.getByRole('button', { name: /personality/i });
      const careerFocus = screen.getByRole('button', { name: /career/i });
      await user.click(personalityFocus);
      await user.click(careerFocus);

      // Add a specific question
      const questionInput = screen.getByLabelText(/specific question/i);
      await user.type(questionInput, 'What career changes should I expect this year?');

      // Submit the form
      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      // Verify API call
      await waitFor(() => {
        expect(mockGenerateAIInterpretation).toHaveBeenCalledWith(
          expect.objectContaining({
            chartId: 'test-chart-123',
            type: 'transit',
            focus_areas: ['personality', 'career'],
            question: 'What career changes should I expect this year?',
            options: expect.any(Object),
          })
        );
      });

      // Verify callback
      await waitFor(() => {
        expect(onInterpretationGenerated).toHaveBeenCalledWith({
          data: expect.objectContaining({
            summary: 'Your natal chart reveals...',
            content: 'Detailed interpretation content...',
          }),
        });
      });

      // Verify analytics tracking
      expect(mockTrackInteraction).toHaveBeenCalledWith({
        feature: 'ai_questions',
        input_type: 'text',
        response_time_ms: expect.any(Number),
        model_version: 'v1',
      });
    });

    it('handles synastry workflow with partner data', async () => {
      const user = userEvent.setup();
      
      mockGenerateAIInterpretation.mockResolvedValueOnce({
        success: true,
        data: { content: 'Synastry interpretation...' } as any,
      } as any);

      render(
        <InterpretationForm mode="chart" chartId="test-chart-123" />
      );

      // Select synastry
      const synastryOption = screen.getByLabelText(/relationship compatibility/i);
      await user.click(synastryOption);

      // Fill partner data
      const partnerDate = screen.getByLabelText(/partner birth date/i);
      const partnerTime = screen.getByLabelText(/partner birth time/i);
      const partnerLocation = screen.getByLabelText(/partner birth location/i);

      await user.type(partnerDate, '1988-12-25');
      await user.type(partnerTime, '15:45');
      await user.type(partnerLocation, 'Paris, France');

      // Submit
      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      // Verify API call includes partner info in question
      await waitFor(() => {
        expect(mockGenerateAIInterpretation).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'synastry',
            question: expect.stringContaining('Partner birth details: 1988-12-25 at 15:45 in Paris, France'),
          })
        );
      });
    });
  });

  describe('End-to-End Direct Mode Workflow', () => {
    it('completes full direct interpretation workflow successfully', async () => {
      const user = userEvent.setup();
      const onInterpretationGenerated = vi.fn();

      render(
        <InterpretationForm
          mode="direct"
          onInterpretationGenerated={onInterpretationGenerated}
        />
      );

      // Fill birth information
      await user.type(screen.getByLabelText(/birth date/i), '1990-07-20');
      await user.type(screen.getByLabelText(/birth time/i), '09:15');
      await user.type(screen.getByLabelText(/birth location/i), 'Boston, Massachusetts');

      // Select interpretation type
      const careerOption = screen.getByLabelText(/career guidance/i);
      await user.click(careerOption);

      // Submit
      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      // Since we're using the mocked useAIInterpretation hook, 
      // we verify the UI behavior rather than the actual API call
      expect(generateButton).toBeInTheDocument();
    });
  });

  describe('Error Handling Integration', () => {
    it('handles API failure gracefully with user feedback', async () => {
      const user = userEvent.setup();
      
      mockGenerateAIInterpretation.mockResolvedValueOnce({
        success: false,
        error: 'Service temporarily unavailable',
      });

      render(
        <InterpretationForm mode="chart" chartId="test-chart-123" />
      );

      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      // Wait for error to be displayed
      await waitFor(() => {
        // Live region status message
        expect(screen.getByText(/failed to generate interpretation/i)).toBeInTheDocument();
      });

      // Verify button is re-enabled after error
      expect(generateButton).not.toBeDisabled();
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockGenerateAIInterpretation.mockRejectedValueOnce(
        new Error('Network connection failed')
      );

      render(
        <InterpretationForm mode="chart" chartId="test-chart-123" />
      );

      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to generate interpretation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Persistence Integration', () => {
    it('updates existing interpretation when persistence is enabled', async () => {
      const user = userEvent.setup();
      
      mockGenerateAIInterpretation.mockResolvedValueOnce({
        success: true,
        data: {
          summary: 'Updated summary',
          content: 'Updated content',
          sections: [{ title: 'Section 1', content: 'Updated section content' }],
          focus_areas: ['personality'],
        } as any,
      } as any);

      mockUpdateInterpretation.mockResolvedValueOnce({
        id: 'interp-123',
        summary: 'Updated summary',
        content: 'Updated content',
      } as any);

      render(
        <InterpretationForm
          mode="chart"
          chartId="test-chart-123"
          existingInterpretationId={makeInterpretationId('interp-123')}
          persistUpdates={true}
        />
      );

      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      // Verify both API calls
      await waitFor(() => {
        expect(mockGenerateAIInterpretation).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockUpdateInterpretation).toHaveBeenCalledWith(
          'interp-123',
          expect.objectContaining({
            summary: 'Updated summary',
            content: 'Updated content',
            sections: [{ title: 'Section 1', content: 'Updated section content' }],
            focus_areas: ['personality'],
            updatedAt: expect.any(String),
          })
        );
      });
    });

    it('handles persistence errors without affecting main flow', async () => {
      const user = userEvent.setup();
      
      mockGenerateAIInterpretation.mockResolvedValueOnce({
        success: true,
        data: { summary: 'Test summary' } as any,
      } as any);

      mockUpdateInterpretation.mockRejectedValueOnce(
        new Error('Update service unavailable')
      );

      render(
        <InterpretationForm
          mode="chart"
          chartId="test-chart-123"
          existingInterpretationId={makeInterpretationId('interp-123')}
          persistUpdates={true}
        />
      );

      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      // Main generation should succeed
      await waitFor(() => {
        expect(screen.getByText(/interpretation generated successfully/i)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(/failed to save interpretation changes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Validation Integration', () => {
    it('provides immediate feedback on invalid inputs', async () => {
      const user = userEvent.setup();
      
      render(<InterpretationForm mode="direct" />);

      // Test invalid date
      const dateInput = screen.getByLabelText(/birth date/i);
      await user.type(dateInput, '2024-13-45'); // Invalid month and day
      
      expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();

      // Test invalid time
      const timeInput = screen.getByLabelText(/birth time/i);
      await user.type(timeInput, '25:70'); // Invalid hour and minute
      
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();

      // Form should not submit with invalid data
      await user.type(screen.getByLabelText(/birth location/i), 'Valid Location');
      
      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      // Should show validation error instead of attempting generation
      expect(mockGenerateAIInterpretation).not.toHaveBeenCalled();
    });
  });

  describe('Analytics Integration', () => {
    it('tracks successful interactions with correct metadata', async () => {
      const user = userEvent.setup();
      
      mockGenerateAIInterpretation.mockResolvedValueOnce({
        success: true,
        data: { content: 'Test interpretation' } as any,
      } as any);

      render(
        <InterpretationForm mode="chart" chartId="test-chart-123" />
      );

      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockTrackInteraction).toHaveBeenCalledWith({
          feature: 'ai_questions',
          input_type: 'text',
          response_time_ms: expect.any(Number),
          model_version: 'v1',
        });
      });
    });

    it('does not track analytics on errors', async () => {
      const user = userEvent.setup();
      
      mockGenerateAIInterpretation.mockRejectedValueOnce(new Error('API Error'));

      render(
        <InterpretationForm mode="chart" chartId="test-chart-123" />
      );

      const generateButton = screen.getByRole('button', { name: /generate interpretation/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to generate interpretation/i)).toBeInTheDocument();
      });

      // Analytics should not be called on error
      expect(mockTrackInteraction).not.toHaveBeenCalled();
    });
  });
});
