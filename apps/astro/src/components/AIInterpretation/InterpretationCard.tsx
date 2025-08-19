import React, { useState, lazy, Suspense } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Interpretation } from './types';

const LazyInterpretationModal = lazy(() => import('./InterpretationModal')); // Lazy load for performance

interface InterpretationCardProps {
  interpretation: Interpretation;
}

const InterpretationCard: React.FC<InterpretationCardProps> = ({ interpretation }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getTypeEmoji = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'natal': return '🌟';
      case 'transit': return '🌙';
      case 'synastry': return '💫';
      case 'composite': return '🌌';
      default: return '✨';
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (typeof confidence !== 'number') return 'text-orange-400';
    if (confidence >= 0.8 && confidence <= 1.0) return 'text-green-400';
    if (confidence >= 0.6 && confidence < 0.8) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <article 
      className="p-6 bg-cosmic-dark/60 backdrop-blur-xl border border-cosmic-silver/20 rounded-xl hover:border-cosmic-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-gold/10"
      aria-labelledby={`interpretation-${interpretation.id}`}
    >
      {/* Header */}
      <header className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl" role="img" aria-label={`${interpretation.type} interpretation`}>
            {getTypeEmoji(interpretation.type)}
          </span>
          <div>
            <h3 
              id={`interpretation-${interpretation.id}`} 
              className="text-lg font-semibold text-cosmic-gold font-playfair"
            >
              {interpretation.title !== '' && interpretation.title.length > 0 ? interpretation.title : `${interpretation.type} Interpretation`}
            </h3>
            <p className="text-sm text-cosmic-silver/70 capitalize">
              {interpretation.type} Analysis
            </p>
          </div>
        </div>
        
        {/* Confidence Score */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-cosmic-silver/60">Confidence:</span>
          <span className={`text-sm font-semibold ${getConfidenceColor(interpretation.confidence)}`}>
            {Math.round(interpretation.confidence * 100)}%
          </span>
        </div>
      </header>

      {/* Summary */}
      {typeof interpretation.summary === 'string' && interpretation.summary !== '' && (
        <div className="mb-4 p-3 bg-cosmic-gold/5 border border-cosmic-gold/20 rounded-lg">
          <p className="text-sm text-cosmic-gold/90 font-medium">
            {interpretation.summary}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="mb-4">
        <p className="text-cosmic-silver/90 leading-relaxed">
          {typeof interpretation.content === 'string' && interpretation.content.length > 300 
            ? `${interpretation.content.substring(0, 300)}...` 
            : interpretation.content
          }
        </p>
      </div>

      {/* Tags */}
      {Array.isArray(interpretation.tags) && interpretation.tags.length !== 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {interpretation.tags.slice(0, 4).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-cosmic-purple/20 text-cosmic-purple border border-cosmic-purple/30 rounded-full"
              >
                {tag}
              </span>
            ))}
            {interpretation.tags.length > 4 && (
              <span className="px-2 py-1 text-xs text-cosmic-silver/60">
                +{interpretation.tags.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between pt-4 border-t border-cosmic-silver/10">
        <time 
          className="text-xs text-cosmic-silver/60"
          dateTime={interpretation.createdAt}
        >
          Generated {formatDistanceToNow(new Date(interpretation.createdAt), { addSuffix: true })}
        </time>
        
        <button
          className="text-xs text-cosmic-gold hover:text-cosmic-gold/80 transition-colors"
          onClick={() => setIsModalOpen(true)}
          aria-label={`View full ${interpretation.type} interpretation`}
        >
          View Full Analysis →
        </button>
      </footer>

      {/* Lazy-loaded Modal */}
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-cosmic-dark p-6 rounded-xl border border-cosmic-gold/20">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-cosmic-gold border-t-transparent rounded-full animate-spin" />
              <span className="text-cosmic-gold">Loading analysis...</span>
            </div>
          </div>
        </div>
      }>
        {isModalOpen === true && (
          <LazyInterpretationModal
            interpretation={interpretation}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </Suspense>
    </article>
  );
};

export default React.memo(InterpretationCard); // Memoize to optimize re-renders
