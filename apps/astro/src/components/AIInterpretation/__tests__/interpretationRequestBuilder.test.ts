import { describe, it, expect } from 'vitest';
import { buildChartInterpretationRequest } from '../interpretationRequestBuilder';
import type { ChartInterpretationParams } from '../interpretationRequestBuilder';
import type {
  InterpretationFocusArea,
  InterpretationType,
} from '../../../services/api.types';

describe('interpretationRequestBuilder', () => {
  describe('buildChartInterpretationRequest', () => {
    const baseParams: ChartInterpretationParams = {
      chartId: 'chart-123' as any, // test fixture casting retained
      userId: 'user-456' as any,
      type: 'natal',
      focus: ['personality', 'career'] as InterpretationFocusArea[],
    };

    it('builds a basic interpretation request correctly', () => {
      const result = buildChartInterpretationRequest(baseParams);

      expect(result).toEqual({
        chartId: 'chart-123',
        userId: 'user-456',
        type: 'natal',
        focus_areas: ['personality', 'career'],
        question: undefined,
        options: {
          technique_preference: 'modern',
          language_style: 'casual',
          include_sources: true,
          max_sections: 8,
          min_confidence: 0.6,
        },
      });
    });

    it('includes question when provided', () => {
      const params = {
        ...baseParams,
        question: 'What is my life purpose?',
      };

      const result = buildChartInterpretationRequest(params);

      expect(result.question).toBe('What is my life purpose?');
    });

    it('handles empty focus areas', () => {
      const params = {
        ...baseParams,
        focus: [],
      };

      const result = buildChartInterpretationRequest(params);

      expect(result.focus_areas).toEqual([]);
    });

    it('handles different interpretation types', () => {
      const types: InterpretationType[] = [
        'natal',
        'transit',
        'synastry',
        'composite',
      ];

      types.forEach(type => {
        const params: ChartInterpretationParams = {
          ...baseParams,
          type,
        };
        const result = buildChartInterpretationRequest(params);
        expect(result.type).toBe(type);
      });
    });

    describe('synastry handling', () => {
      it('appends partner information to question for synastry requests', () => {
        const params: ChartInterpretationParams = {
          ...baseParams,
          type: 'synastry',
          focus: baseParams.focus,
          partnerBirthDate: '1985-03-15',
          partnerBirthTime: '10:30',
          partnerBirthLocation: 'London, UK',
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toContain(
          'Partner birth details: 1985-03-15 at 10:30 in London, UK'
        );
      });

      it('handles synastry with existing question', () => {
        const params: ChartInterpretationParams = {
          ...baseParams,
          type: 'synastry',
          focus: baseParams.focus,
          question: 'How compatible are we?',
          partnerBirthDate: '1985-03-15',
          partnerBirthTime: '10:30',
          partnerBirthLocation: 'London, UK',
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toBe(
          'How compatible are we?\n\nPartner birth details: 1985-03-15 at 10:30 in London, UK'
        );
      });

      it('handles synastry with partial partner data', () => {
        const params: ChartInterpretationParams = {
          ...baseParams,
          type: 'synastry',
          focus: baseParams.focus,
          partnerBirthDate: '1985-03-15',
          // No time or location
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toBe('Partner birth details: 1985-03-15');
      });

      it('handles synastry with only date and time', () => {
        const params: ChartInterpretationParams = {
          ...baseParams,
          type: 'synastry',
          focus: baseParams.focus,
          partnerBirthDate: '1985-03-15',
          partnerBirthTime: '10:30',
          // No location
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toBe(
          'Partner birth details: 1985-03-15 at 10:30'
        );
      });

      it('does not append partner info for non-synastry types even if provided', () => {
        const params: ChartInterpretationParams = {
          ...baseParams,
          type: 'natal',
          focus: baseParams.focus,
          partnerBirthDate: '1985-03-15',
          partnerBirthTime: '10:30',
          partnerBirthLocation: 'London, UK',
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toBeUndefined();
      });

      it('does not append partner info if no partner birth date provided', () => {
        const params: ChartInterpretationParams = {
          ...baseParams,
          type: 'synastry',
          focus: baseParams.focus,
          partnerBirthTime: '10:30',
          partnerBirthLocation: 'London, UK',
          // No partnerBirthDate
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toBeUndefined();
      });
    });

    describe('options configuration', () => {
      it('sets consistent default options', () => {
        const result = buildChartInterpretationRequest(baseParams);

        expect(result.options).toEqual({
          technique_preference: 'modern',
          language_style: 'casual',
          include_sources: true,
          max_sections: 8,
          min_confidence: 0.6,
        });
      });

      it('maintains the same options regardless of input parameters', () => {
        const params1: ChartInterpretationParams = {
          ...baseParams,
          type: 'natal',
          focus: ['personality'] as InterpretationFocusArea[],
        };

        const params2: ChartInterpretationParams = {
          ...baseParams,
          type: 'transit',
          focus: ['career', 'relationships'] as InterpretationFocusArea[],
          question: 'Some question',
        };

        const result1 = buildChartInterpretationRequest(params1);
        const result2 = buildChartInterpretationRequest(params2);

        expect(result1.options).toEqual(result2.options);
      });
    });

    describe('edge cases', () => {
      it('handles empty string parameters', () => {
        const params = {
          ...baseParams,
          question: '',
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toBe('');
      });

      it('handles whitespace-only question', () => {
        const params = {
          ...baseParams,
          question: '   \n\t   ',
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toBe('   \n\t   ');
      });

      it('handles special characters in partner location', () => {
        const params = {
          ...baseParams,
          type: 'synastry' as const,
          partnerBirthDate: '1985-03-15',
          partnerBirthLocation: 'São Paulo, Brazil (UTC-3)',
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.question).toContain('São Paulo, Brazil (UTC-3)');
      });
    });

    describe('type safety', () => {
      it('maintains type safety for all parameters', () => {
        // This test ensures TypeScript compilation succeeds with proper types
        const params: ChartInterpretationParams = {
          chartId: 'chart-123' as any,
          userId: 'user-456' as any,
          type: 'composite',
          focus: ['health', 'spirituality'] as InterpretationFocusArea[],
          question: 'Test question',
          partnerBirthDate: '1990-01-01',
          partnerBirthTime: '12:00',
          partnerBirthLocation: 'Test Location',
        };

        const result = buildChartInterpretationRequest(params);

        expect(result.chartId).toBe('chart-123');
        expect(result.userId).toBe('user-456');
        expect(result.type).toBe('composite');
        expect(result.focus_areas).toEqual(['health', 'spirituality']);
      });
    });
  });
});
