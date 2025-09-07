import React from 'react';

interface TipsSectionProps {
  className?: string;
}

export const TipsSection: React.FC<TipsSectionProps> = React.memo(({
  className = '',
}) => {
  const tips = [
    {
      icon: '🎧',
      text: 'Use headphones for proper binaural effect',
    },
    {
      icon: '🔊',
      text: 'Start with lower volumes and gradually increase',
    },
    {
      icon: '😴',
      text: 'Delta waves (0.5-4 Hz) are best for sleep',
    },
    {
      icon: '🧘',
      text: 'Theta waves (4-8 Hz) enhance meditation',
    },
    {
      icon: '😌',
      text: 'Alpha waves (8-14 Hz) promote relaxation',
    },
    {
      icon: '🎯',
      text: 'Beta waves (14-30 Hz) improve focus',
    },
  ];

  return (
    <div className={`p-4 rounded-lg bg-cyan-500/10 backdrop-blur-sm border border-cyan-400/20 ${className}`}>
      <h5 className="mb-3 font-medium text-cyan-300 flex items-center space-x-2">
        <span className="text-lg" aria-hidden="true">💡</span>
        <span>Tips for Best Results</span>
      </h5>
      
      <ul className="space-y-2 mb-4">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start space-x-2 text-sm text-cyan-200/90">
            <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
              {tip.icon}
            </span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-cyan-400/20">
        <p className="text-sm text-cyan-200/90">
          Enhance your experience with astrological frequencies!{' '}
          <a
            href="/astro"
            className="text-cyan-400 hover:text-cyan-300 underline transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try our Astro app
          </a>
          {' '}for personalized cosmic-aligned healing sessions.
        </p>
      </div>

      {/* Additional Resources */}
      <div className="mt-3 pt-3 border-t border-cyan-400/20">
        <div className="text-xs text-cyan-200/80">
          <div className="font-medium mb-1">Quick Reference:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium">Sleep:</span> Delta (0.5-4 Hz)
            </div>
            <div>
              <span className="font-medium">Meditation:</span> Theta (4-8 Hz)
            </div>
            <div>
              <span className="font-medium">Relaxation:</span> Alpha (8-14 Hz)
            </div>
            <div>
              <span className="font-medium">Focus:</span> Beta (14-30 Hz)
            </div>
          </div>
        </div>
      </div>

      {/* Safety Note */}
      <div className="mt-3 p-2 rounded bg-yellow-500/10 border border-yellow-400/20">
        <div className="flex items-start space-x-2">
          <span className="text-yellow-400 text-sm flex-shrink-0 mt-0.5">⚠️</span>
          <div className="text-xs text-yellow-200">
            <div className="font-medium mb-1">Safety Note:</div>
            <div>
              If you have epilepsy or other neurological conditions, consult your healthcare provider before using binaural beats.
              Stop use if you experience discomfort, headaches, or dizziness.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TipsSection.displayName = 'TipsSection';

export default TipsSection;
