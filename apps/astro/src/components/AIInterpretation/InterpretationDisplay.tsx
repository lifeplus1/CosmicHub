import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Interpretation } from './types';
import {
  formatInterpretationContent,
  getConfidenceLevel,
  getInterpretationTypeEmoji,
} from './utils';

interface InterpretationDisplayProps {
  interpretation: Interpretation | null;
  loading?: boolean;
  error?: string | null;
  showFullContent?: boolean;
}

const InterpretationDisplay: React.FC<InterpretationDisplayProps> = ({
  interpretation,
  loading = false,
  error = null,
  showFullContent = false,
}) => {
  if (loading) {
    return (
      <div className='flex items-center justify-center p-8 bg-cosmic-dark/40 rounded-xl border border-cosmic-silver/20'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-cosmic-gold border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-cosmic-silver/80 font-playfair'>
            Generating your cosmic interpretation...
          </p>
        </div>
      </div>
    );
  }

  if (typeof error === 'string' && error !== '') {
    return (
      <div
        className='p-6 bg-red-900/20 border border-red-500/30 rounded-xl'
        role='alert'
      >
        <div className='flex items-center space-x-3'>
          <span className='text-2xl'>⚠️</span>
          <div>
            <h3 className='text-red-400 font-semibold'>
              Error Loading Interpretation
            </h3>
            <p className='text-red-300 text-sm mt-1'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (interpretation === null) {
    return (
      <div className='text-center p-12 bg-cosmic-dark/40 rounded-xl border border-cosmic-silver/20'>
        <div className='w-20 h-20 bg-cosmic-gold/20 rounded-full flex items-center justify-center mx-auto mb-6'>
          <span className='text-3xl'>🔮</span>
        </div>
        <h3 className='text-xl font-semibold text-cosmic-gold mb-3 font-playfair'>
          No Interpretation Available
        </h3>
        <p className='text-cosmic-silver/70 max-w-md mx-auto'>
          Generate your first AI-powered astrological interpretation to unlock
          personalized cosmic insights.
        </p>
      </div>
    );
  }

  const contentToShow = showFullContent
    ? interpretation.content
    : formatInterpretationContent(interpretation.content, 500);

  return (
    <article className='bg-cosmic-dark/60 backdrop-blur-xl border border-cosmic-silver/20 rounded-xl overflow-hidden'>
      {/* Header */}
      <header className='p-6 bg-gradient-to-r from-cosmic-gold/10 to-cosmic-purple/10 border-b border-cosmic-silver/20'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            <span
              className='text-3xl'
              role='img'
              aria-label={`${interpretation.type} interpretation`}
            >
              {getInterpretationTypeEmoji(interpretation.type)}
            </span>
            <div>
              <h2 className='text-2xl font-bold text-cosmic-gold font-playfair'>
                {interpretation.title !== '' && interpretation.title.length > 0
                  ? interpretation.title
                  : `${interpretation.type} Interpretation`}
              </h2>
              <p className='text-cosmic-silver/70 capitalize font-medium'>
                {interpretation.type} Analysis
              </p>
            </div>
          </div>

          <div className='text-right'>
            <div className='flex items-center space-x-2 mb-2'>
              <span className='text-xs text-cosmic-silver/60'>Confidence:</span>
              <span className='text-sm font-semibold text-cosmic-gold'>
                {getConfidenceLevel(interpretation.confidence)}
              </span>
            </div>
            <time
              className='text-xs text-cosmic-silver/60'
              dateTime={interpretation.createdAt}
            >
              {formatDistanceToNow(new Date(interpretation.createdAt), {
                addSuffix: true,
              })}
            </time>
          </div>
        </div>
      </header>

      {/* Summary */}
      {typeof interpretation.summary === 'string' &&
        interpretation.summary !== '' && (
          <div className='p-6 bg-cosmic-gold/5 border-b border-cosmic-silver/10'>
            <h3 className='text-sm font-semibold text-cosmic-gold mb-2 uppercase tracking-wide'>
              Key Insights
            </h3>
            <p className='text-cosmic-gold/90 font-medium leading-relaxed'>
              {interpretation.summary}
            </p>
          </div>
        )}

      {/* Content */}
      <div className='p-6'>
        <div className='prose prose-cosmic max-w-none'>
          <div className='text-cosmic-silver/90 leading-relaxed whitespace-pre-wrap'>
            {contentToShow}
          </div>

          {showFullContent === false &&
            typeof interpretation.content === 'string' &&
            interpretation.content.length > 500 && (
              <button
                className='mt-4 text-cosmic-gold hover:text-cosmic-gold/80 transition-colors text-sm font-medium'
                onClick={() => {
                  // TODO: This would typically be handled by parent component
                  // logger.info('Show full content for:', interpretation.id);
                  // Implement full content display functionality
                }}
              >
                Read Full Interpretation →
              </button>
            )}
        </div>
      </div>

      {/* Tags */}
      {Array.isArray(interpretation.tags) &&
        interpretation.tags.length !== 0 && (
          <div className='px-6 pb-6'>
            <h4 className='text-sm font-semibold text-cosmic-silver/70 mb-3'>
              Related Topics
            </h4>
            <div className='flex flex-wrap gap-2'>
              {interpretation.tags.map((tag, index) => (
                <span
                  key={index}
                  className='px-3 py-1 text-xs bg-cosmic-purple/20 text-cosmic-purple border border-cosmic-purple/30 rounded-full'
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

      {/* Footer */}
      <footer className='px-6 py-4 bg-cosmic-dark/20 border-t border-cosmic-silver/10'>
        <div className='flex items-center justify-between text-xs text-cosmic-silver/60'>
          <span>Chart ID: {interpretation.chartId}</span>
          <span>Interpretation ID: {interpretation.id.slice(0, 8)}...</span>
        </div>
      </footer>
    </article>
  );
};

export default InterpretationDisplay;
