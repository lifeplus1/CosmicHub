import type {
  InterpretationRequest,
  ChartId,
  UserId,
  InterpretationType,
  InterpretationFocusArea,
} from '../../services/api.types';

/**
 * Parameters for building a chart interpretation request
 */
export interface ChartInterpretationParams {
  chartId: ChartId;
  userId: UserId;
  type: InterpretationType;
  focus: InterpretationFocusArea[];
  question?: string;
  partnerBirthDate?: string;
  partnerBirthTime?: string;
  partnerBirthLocation?: string;
}

/**
 * Build a standardized interpretation request from chart parameters
 */
export const buildChartInterpretationRequest = (
  params: ChartInterpretationParams
): InterpretationRequest => {
  const baseRequest: InterpretationRequest = {
    chartId: params.chartId,
    userId: params.userId,
    type: params.type,
    focus_areas: params.focus,
    question: params.question,
    options: {
      technique_preference: 'modern',
      language_style: 'casual',
      include_sources: true,
      max_sections: 8,
      min_confidence: 0.6,
    },
  };

  // Note: Partner information for synastry would need to be handled
  // at the API level or through a different request structure
  // For now, we include it in the question field if present
  if (params.type === 'synastry' && params.partnerBirthDate) {
    const partnerInfo = `Partner birth details: ${params.partnerBirthDate}${
      params.partnerBirthTime ? ` at ${params.partnerBirthTime}` : ''
    }${
      params.partnerBirthLocation ? ` in ${params.partnerBirthLocation}` : ''
    }`;

    baseRequest.question = baseRequest.question
      ? `${baseRequest.question}\n\n${partnerInfo}`
      : partnerInfo;
  }

  return baseRequest;
};
