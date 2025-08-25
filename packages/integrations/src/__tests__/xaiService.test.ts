import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XAIService } from '../xaiService';
import { InterpretationRequest } from '../types';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
  vi.restoreAllMocks();
});

describe('XAIService', () => {
  const mockRequest: InterpretationRequest = {
    birthDate: '1990-01-01',
    birthTime: '12:00',
    birthLocation: 'New York',
    interpretationType: 'general',
  };

  describe('generateInterpretation', () => {
    it('generates interpretation successfully with valid API key', async () => {
      process.env.XAI_API_KEY = 'test-api-key';

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test interpretation result',
            },
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await XAIService.generateInterpretation(mockRequest);
      expect(result).toBe('Test interpretation result');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.x.ai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('throws error when API key is missing', async () => {
      delete process.env.XAI_API_KEY;

      await expect(
        XAIService.generateInterpretation(mockRequest)
      ).rejects.toThrow(
        'xAI API error: XAI_API_KEY environment variable is not set'
      );
    });

    it('throws error on API failure', async () => {
      process.env.XAI_API_KEY = 'test-api-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Invalid API key' }),
      });

      await expect(
        XAIService.generateInterpretation(mockRequest)
      ).rejects.toThrow(
        'xAI API error: xAI API request failed: Unauthorized (401)'
      );
    });

    it('throws error when response has no interpretation', async () => {
      process.env.XAI_API_KEY = 'test-api-key';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [] }),
      });

      await expect(
        XAIService.generateInterpretation(mockRequest)
      ).rejects.toThrow(
        'xAI API error: No interpretation received from xAI API'
      );
    });

    it('validates request data', async () => {
      process.env.XAI_API_KEY = 'test-api-key';

      const invalidRequest = {
        ...mockRequest,
        interpretationType: 'invalid' as any,
      };

      await expect(
        XAIService.generateInterpretation(invalidRequest)
      ).rejects.toThrow('Invalid request data:');
    });

    it('builds correct prompts for different interpretation types', async () => {
      process.env.XAI_API_KEY = 'test-api-key';

      const mockResponse = {
        choices: [{ message: { content: 'Test interpretation' } }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Test personality interpretation
      await XAIService.generateInterpretation({
        ...mockRequest,
        interpretationType: 'personality',
      });

      const lastCall = (global.fetch as any).mock.calls.slice(-1)[0];
      const requestBody = JSON.parse(lastCall[1].body);

      expect(requestBody.messages[1].content).toContain('personality analysis');
      expect(requestBody.messages[1].content).toContain('1990-01-01');
      expect(requestBody.messages[1].content).toContain('12:00');
      expect(requestBody.messages[1].content).toContain('New York');
    });
  });

  describe('generateMockInterpretation', () => {
    it('generates mock interpretation without API call', async () => {
      const result = await XAIService.generateMockInterpretation(mockRequest);

      expect(result).toContain('1990-01-01');
      expect(result).toContain('12:00');
      expect(result).toContain('New York');
      expect(result).toContain('astrological chart');
    });

    it('generates different interpretations for different types', async () => {
      const generalResult = await XAIService.generateMockInterpretation({
        ...mockRequest,
        interpretationType: 'general',
      });

      const personalityResult = await XAIService.generateMockInterpretation({
        ...mockRequest,
        interpretationType: 'personality',
      });

      expect(generalResult).not.toBe(personalityResult);
      expect(personalityResult).toContain('personality');
    });

    it('has appropriate delay simulation', async () => {
      const startTime = Date.now();
      await XAIService.generateMockInterpretation(mockRequest);
      const endTime = Date.now();

      // Should take at least 1000ms due to the simulated delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(1000);
    });
  });
});
