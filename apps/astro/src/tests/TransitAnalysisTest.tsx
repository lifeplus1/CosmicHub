import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCalendarAlt, FaRocket, FaHeart, FaArrowLeft, FaMoon, FaSun, FaQuestionCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import FeatureGuard from '../components/FeatureGuard';
import styles from './TransitAnalysisTest.module.css';

export const TransitAnalysisTest: React.FC = () => {
  const navigate = useNavigate();
  const [timeFrame, setTimeFrame] = useState('6months');
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const upcomingTransits = [
    {
      date: 'August 15, 2025',
      transit: 'Jupiter Trine Natal Venus',
      energy: 'positive',
      impact: 'High',
      description: 'Excellent time for love, creativity, and financial opportunities',
      duration: '3 days',
      icon: FaHeart,
      color: 'green'
    },
    {
      date: 'August 22, 2025',
      transit: 'Mars Square Natal Moon',
      energy: 'challenging',
      impact: 'Medium',
      description: 'Emotional tensions may arise, practice patience',
      duration: '2 days',
      icon: FaMoon,
      color: 'orange'
    },
    {
      date: 'September 3, 2025',
      transit: 'Saturn Sextile Natal Sun',
      energy: 'supportive',
      impact: 'High',
      description: 'Structure and discipline lead to lasting achievements',
      duration: '1 week',
      icon: FaSun,
      color: 'blue'
    },
    {
      date: 'September 18, 2025',
      transit: 'Pluto Trine Natal Mercury',
      energy: 'transformative',
      impact: 'Very High',
      description: 'Deep insights and powerful communication breakthroughs',
      duration: '2 weeks',
      icon: FaRocket,
      color: 'purple'
    }
  ];

  const currentTransits = [
    { planet: 'Jupiter', aspect: 'Conjunction', natal: 'Ascendant', intensity: 95 },
    { planet: 'Saturn', aspect: 'Square', natal: 'Mars', intensity: 78 },
    { planet: 'Uranus', aspect: 'Trine', natal: 'Venus', intensity: 85 },
    { planet: 'Neptune', aspect: 'Sextile', natal: 'Moon', intensity: 62 }
  ];

  const handleStartAnalysis = () => {
    setAnalysisStarted(true);
  };

  return (
    <FeatureGuard feature="transit_analysis" requiredTier="elite">
      <div className={styles.container}>
        <div className={styles['content-wrapper']}>
          <div className={styles['main-content']}>
            {/* Header Section */}
            <div className={styles.header}>
              <div className={styles['header-title']}>
                <FaClock className={styles['clock-icon']} />
                <h1 className={styles.title}>
                  Transit Analysis & Predictions
                </h1>
                <FaClock className={styles['clock-icon']} />
              </div>
              <p className={styles.subtitle}>
                Discover the cosmic timing of your life through precise planetary transit analysis
              </p>
              <div className={styles['elite-badge']}>
                👑 Elite Feature Active
              </div>
            </div>

            {/* Educational Guide */}
            <div>
              <button
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className={styles['guide-button']}
              >
                <FaQuestionCircle />
                <span>Transit Analysis Guide</span>
                {isGuideOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              
              {isGuideOpen && (
                <div className={styles['guide-panel']}>
                  <h3 className={styles['guide-title']}>
                    Understanding Planetary Transits
                  </h3>
                  <div className={styles['guide-content']}>
                    <p className={styles['guide-intro']}>
                      Transits reveal the cosmic weather of your life. By tracking current planetary positions 
                      relative to your birth chart, we can predict optimal timing for important decisions.
                    </p>
                    
                    <div className={styles['guide-grid']}>
                      <div>
                        <p className={styles['guide-section-title']}>
                          What Transits Show:
                        </p>
                        <div className={styles['guide-list']}>
                          <div>• Best times for career moves</div>
                          <div>• Relationship opportunities</div>
                          <div>• Creative breakthroughs</div>
                          <div>• Financial decisions</div>
                          <div>• Personal growth periods</div>
                        </div>
                      </div>
                      
                      <div>
                        <p className={styles['guide-section-title']}>
                          Transit Types:
                        </p>
                        <div className={styles['guide-list']}>
                          <div>• Conjunction: New beginnings</div>
                          <div>• Trine: Easy, beneficial energy</div>
                          <div>• Square: Challenges & growth</div>
                          <div>• Opposition: Balance & awareness</div>
                          <div>• Sextile: Opportunities</div>
                        </div>
                      </div>
                      
                      <div>
                        <p className={styles['guide-section-title']}>
                          Major Transits:
                        </p>
                        <div className={styles['guide-list']}>
                          <div>• Jupiter: Expansion & luck</div>
                          <div>• Saturn: Structure & lessons</div>
                          <div>• Uranus: Change & innovation</div>
                          <div>• Neptune: Spirituality & dreams</div>
                          <div>• Pluto: Transformation & power</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!analysisStarted ? (
              /* Configuration */
              <div className={styles['config-container']}>
                <div className={styles['config-header']}>
                  <div className={styles['config-header-content']}>
                    <FaCalendarAlt className={styles['config-header-icon']} />
                    <h3 className={styles['config-header-title']}>
                      Analysis Time Frame
                    </h3>
                  </div>
                </div>
                <div className={styles['config-body']}>
                  <div className={styles['config-form']}>
                    <div>
                      <label htmlFor="timeframe-select" className={styles['timeframe-label']}>
                        Analysis Time Frame
                      </label>
                      <select 
                        id="timeframe-select"
                        value={timeFrame} 
                        onChange={(e) => setTimeFrame(e.target.value)}
                        className={styles['timeframe-select']}
                      >
                        <option value="1month">Next 1 Month</option>
                        <option value="3months">Next 3 Months</option>
                        <option value="6months">Next 6 Months</option>
                        <option value="1year">Next Year</option>
                        <option value="2years">Next 2 Years</option>
                      </select>
                    </div>
                    
                    <p className={styles['config-description']}>
                      Select your preferred time frame for detailed transit predictions and cosmic timing analysis
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Analysis Results */
              <div className={styles['main-content']}>
                <div className={styles['success-message']}>
                  <div className={styles['success-icon-container']}>
                    <FaRocket className={styles['success-icon']} />
                  </div>
                  <div>
                    <p className={styles['success-title']}>Transit Analysis Complete!</p>
                    <p className={styles['success-description']}>Your cosmic timing report for the next {timeFrame.replace(/\d+/, (match) => match + ' ')} is ready</p>
                  </div>
                </div>

                <div className={styles['results-grid']}>
                  {/* Current Active Transits */}
                  <div className={styles.card}>
                    <div className={styles['card-header']}>
                      <div className={styles['card-header-content']}>
                        <FaRocket className="text-orange-500" />
                        <h3 className={styles['card-title']}>Active Transits</h3>
                      </div>
                    </div>
                    <div className={styles['card-body']}>
                      <div className={styles['card-content']}>
                        {currentTransits.map((transit, index) => (
                          <div key={index}>
                            <div className={styles['transit-item']}>
                              <div className={styles['transit-info']}>
                                <p className={styles['transit-title']}>
                                  {transit.planet} {transit.aspect} {transit.natal}
                                </p>
                                <p className={styles['transit-intensity']}>
                                  Current intensity: {transit.intensity}%
                                </p>
                              </div>
                              <div className={`${styles['intensity-badge']} ${
                                transit.intensity > 80 ? styles['intensity-high'] : 
                                transit.intensity > 60 ? styles['intensity-medium'] : 
                                styles['intensity-low']
                              }`}>
                                {transit.intensity}%
                              </div>
                            </div>
                            <div className={styles['progress-bar-container']}>
                              <div 
                                className={`${styles['progress-bar']} ${
                                  transit.intensity > 80 ? styles['progress-bar-high'] : 
                                  transit.intensity > 60 ? styles['progress-bar-medium'] : 
                                  styles['progress-bar-low']
                                } ${styles[`progress-${transit.intensity}`]}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Transit Timeline */}
                  <div className={styles.card}>
                    <div className={styles['card-header']}>
                      <div className={styles['card-header-content']}>
                        <FaCalendarAlt className="text-blue-500" />
                        <h3 className={styles['card-title']}>Upcoming Timeline</h3>
                      </div>
                    </div>
                    <div className={styles['card-body']}>
                      <div className={styles['card-content']}>
                        {upcomingTransits.slice(0, 3).map((transit, index) => (
                          <div key={index} className={styles['timeline-item']}>
                            <div className={`${styles['timeline-icon']} ${styles[`timeline-icon-${transit.color}`]}`}>
                              <transit.icon className={styles['timeline-icon-sm']} />
                            </div>
                            <div className={styles['timeline-content']}>
                              <p className={styles['timeline-date']}>{transit.date}</p>
                              <p className={styles['timeline-title']}>{transit.transit}</p>
                              <div className={`${styles['timeline-impact']} ${styles[`impact-${transit.color}`]}`}>
                                {transit.impact} Impact
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Transit Insights */}
                <div className={styles.card}>
                  <div className={styles['card-header']}>
                    <h3 className={styles['card-title']}>Detailed Transit Insights</h3>
                  </div>
                  <div className={styles['card-body']}>
                    <div className={styles['card-content']}>
                      {upcomingTransits.map((transit, index) => (
                        <div key={index}>
                          <div className={styles['insight-header']}>
                            <div className={styles['insight-title-section']}>
                              <div className={styles['insight-title-row']}>
                                <transit.icon className={styles[`insight-icon-${transit.color}`]} />
                                <p className={styles['insight-title']}>{transit.transit}</p>
                                <div className={`${styles['insight-energy']} ${styles[`energy-${transit.energy}`]}`}>
                                  {transit.energy}
                                </div>
                              </div>
                              <p className={styles['insight-date']}>{transit.date} • Duration: {transit.duration}</p>
                            </div>
                            <div className={styles['insight-impact']}>
                              {transit.impact} Impact
                            </div>
                          </div>
                          <p className={styles['insight-description']}>{transit.description}</p>
                          {index < upcomingTransits.length - 1 && <hr className={styles['insight-divider']} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Best Days Recommendations */}
                <div className={styles['recommendations-grid']}>
                  <div className={`${styles['recommendation-card']} ${styles['recommendation-card-green']}`}>
                    <div className={styles['recommendation-header']}>
                      <FaHeart className={`${styles['recommendation-icon']} ${styles['recommendation-icon-green']}`} />
                      <p className={`${styles['recommendation-title']} ${styles['recommendation-title-green']}`}>Best for Love</p>
                    </div>
                    <div className={styles['recommendation-body']}>
                      <p className={styles['recommendation-date']}>August 15-17, 2025</p>
                      <p className={styles['recommendation-transit']}>Jupiter Trine Venus</p>
                    </div>
                  </div>

                  <div className={`${styles['recommendation-card']} ${styles['recommendation-card-blue']}`}>
                    <div className={styles['recommendation-header']}>
                      <FaRocket className={`${styles['recommendation-icon']} ${styles['recommendation-icon-blue']}`} />
                      <p className={`${styles['recommendation-title']} ${styles['recommendation-title-blue']}`}>Best for Career</p>
                    </div>
                    <div className={styles['recommendation-body']}>
                      <p className={styles['recommendation-date']}>September 3-10, 2025</p>
                      <p className={styles['recommendation-transit']}>Saturn Sextile Sun</p>
                    </div>
                  </div>

                  <div className={`${styles['recommendation-card']} ${styles['recommendation-card-purple']}`}>
                    <div className={styles['recommendation-header']}>
                      <FaClock className={`${styles['recommendation-icon']} ${styles['recommendation-icon-purple']}`} />
                      <p className={`${styles['recommendation-title']} ${styles['recommendation-title-purple']}`}>Transformation</p>
                    </div>
                    <div className={styles['recommendation-body']}>
                      <p className={styles['recommendation-date']}>September 18-30, 2025</p>
                      <p className={styles['recommendation-transit']}>Pluto Trine Mercury</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles['action-buttons']}>
              <button 
                onClick={() => navigate('/')} 
                className={styles['back-button']}
              >
                <FaArrowLeft />
                <span>Back to Dashboard</span>
              </button>
              {!analysisStarted ? (
                <button 
                  onClick={handleStartAnalysis}
                  className={styles['analyze-button']}
                >
                  <FaClock />
                  <span>Analyze Transits</span>
                </button>
              ) : (
                <button 
                  onClick={() => setAnalysisStarted(false)}
                  className={styles['new-analysis-button']}
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </FeatureGuard>
  );
};

export default TransitAnalysisTest;