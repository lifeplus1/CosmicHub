import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaRobot, FaMagic, FaLightbulb, FaArrowLeft, FaComments, FaUser, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import FeatureGuard from '../components/FeatureGuard';
import styles from './AIInterpretationTest.module.css';

export const AIInterpretationTest: React.FC = () => {
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState('personality');
  const [userQuestion, setUserQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const aiInsights = [
    {
      category: 'Core Personality',
      insight: 'Your Sagittarius Sun combined with Pisces Moon creates a fascinating blend of philosophical exploration and emotional depth.',
      confidence: 94,
      color: 'blue'
    },
    {
      category: 'Relationship Patterns', 
      insight: 'With Venus in Scorpio, you experience love intensely and transformatively.',
      confidence: 89,
      color: 'pink'
    }
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setCurrentResponse('AI analysis complete! Your chart shows strong intuitive abilities...');
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  return (
    <FeatureGuard feature="aiInterpretation" requiredTier="premium">
      <div className={styles.container}>
        <div className={styles['content-wrapper']}>
          <div className={styles['main-content']}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles['header-title']}>
                <FaBrain className={styles['brain-icon']} />
                <h1 className={styles.title}>
                  AI Chart Interpretation
                </h1>
                <FaBrain className={styles['brain-icon']} />
              </div>
              <p className={styles.subtitle}>
                Experience the future of astrology with our advanced AI that understands the deepest layers of your cosmic blueprint.
              </p>
              <div className={styles['ai-badge']}>
                🤖 Powered by Advanced AI
              </div>
            </div>

            {/* Guide Toggle */}
            <div className={styles['guide-toggle']}>
              <button
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className={styles['guide-button']}
              >
                <FaQuestionCircle />
                <span>How AI Interpretation Works</span>
                {isGuideOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>

            {/* Collapsible Guide */}
            {isGuideOpen && (
              <div className={styles['guide-panel']}>
                <h3 className={styles['guide-title']}>
                  Understanding AI Chart Interpretation
                </h3>
                <div className={styles['guide-content']}>
                  <p>
                    Our AI system analyzes your birth chart using advanced algorithms that consider:
                  </p>
                  <ul className={styles['guide-list']}>
                    <li>Planetary positions and their meanings</li>
                    <li>House placements and their significance</li>
                    <li>Aspect patterns between celestial bodies</li>
                    <li>Traditional and modern astrological wisdom</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Analysis Type Selection */}
            <div className={styles['analysis-card']}>
              <h3 className={styles['analysis-title']}>Choose Analysis Type</h3>
              <div className={styles['analysis-grid']}>
                {['personality', 'relationships', 'career', 'spiritual'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setAnalysisType(type)}
                    className={`${styles['analysis-option']} ${
                      analysisType === type ? styles['analysis-option-active'] : ''
                    }`}
                  >
                    <div className={styles['analysis-option-content']}>
                      <div className={styles['analysis-emoji']}>
                        {type === 'personality' && '👤'}
                        {type === 'relationships' && '💕'}
                        {type === 'career' && '💼'}
                        {type === 'spiritual' && '🔮'}
                      </div>
                      <div className={styles['analysis-label']}>{type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Input */}
            <div className={styles['question-card']}>
              <h3 className={styles['question-title']}>Ask AI About Your Chart</h3>
              <div className={styles['question-form']}>
                <textarea
                  value={userQuestion}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUserQuestion(e.target.value)}
                  onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAnalyze();
                    }
                  }}
                  placeholder="Ask anything about your chart... (e.g., 'What does my Mars in Scorpio mean for my career?')"
                  className={styles['question-textarea']}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !userQuestion.trim()}
                  className={styles['analyze-button']}
                >
                  {isAnalyzing ? (
                    <div className={styles['analyze-button-content']}>
                      <div className={styles['loading-spinner']}></div>
                      <span>AI Analyzing...</span>
                    </div>
                  ) : (
                    <div className={styles['analyze-button-content']}>
                      <FaRobot />
                      <span>Get AI Interpretation</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* AI Response */}
            {(analysisComplete || currentResponse) && (
              <div className={styles['ai-response']}>
                <div className={styles['ai-response-header']}>
                  <FaRobot className={styles['ai-response-icon']} />
                  <div className={styles['ai-response-content']}>
                    <h4 className={styles['ai-response-title']}>AI Interpretation</h4>
                    <p className={styles['ai-response-text']}>{currentResponse}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Insights */}
            <div className={styles['insights-grid']}>
              {aiInsights.map((insight, index) => (
                <div key={index} className={styles['insight-card']}>
                  <div className={styles['insight-header']}>
                    <h4 className={styles['insight-category']}>{insight.category}</h4>
                    <div className={styles['insight-confidence']}>{insight.confidence}% confidence</div>
                  </div>
                  <p className={styles['insight-text']}>{insight.insight}</p>
                  <div className={styles['confidence-bar-container']}>
                    <div 
                      className={`${styles['confidence-bar']} ${styles[`confidence-bar-${insight.color}`]} ${styles[`confidence-${insight.confidence}`]}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Back Button */}
            <div className={styles['back-button-container']}>
              <button
                onClick={() => navigate('/dashboard')}
                className={styles['back-button']}
              >
                <FaArrowLeft />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </FeatureGuard>
  );
};

export default AIInterpretationTest;