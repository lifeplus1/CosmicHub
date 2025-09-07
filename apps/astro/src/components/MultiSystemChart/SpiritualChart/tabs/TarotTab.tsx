import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { SpiritualTabProps, TarotCardData } from '../utils/types';

/**
 * Tarot Tab Component
 * Displays Tarot card analysis and spiritual guidance
 */
export const TarotTab: React.FC<SpiritualTabProps> = React.memo(function TarotTab({
  chartData,
  isLoading
}) {
  // Memoize Tarot card information
  const tarotCards = useMemo(() => {
    if (!chartData?.tarot) return [];
    
    const tarotData = chartData.tarot;
    const cards: TarotCardData[] = [];
    
    // Extract daily card data
    if (tarotData.daily_card) {
      cards.push({
        name: tarotData.daily_card.name || 'Unknown Card',
        meaning: tarotData.daily_card.meaning || 'No meaning available',
        guidance: tarotData.daily_card.upright_meaning || 'No guidance available',
        keywords: tarotData.daily_card.keywords || [],
        path: tarotData.daily_card.tree_path,
        hebrew_letter: tarotData.daily_card.hebrew_letter
      });
    }
    
    // Extract life path card data
    if (tarotData.life_path) {
      cards.push({
        name: tarotData.life_path.card || 'Unknown Card',
        meaning: tarotData.life_path.meaning || 'No meaning available',
        guidance: tarotData.life_path.guidance || 'No guidance available',
        keywords: [], // LifePathCardData doesn't have themes/keywords
        path: undefined,
        hebrew_letter: undefined
      });
    }
    
    return cards;
  }, [chartData?.tarot]);

  // Memoize correspondences
  const correspondences = useMemo(() => {
    if (!chartData?.correspondences) return null;
    
    return {
      daily_focus: chartData.correspondences.daily_focus,
      life_purpose: chartData.correspondences.life_purpose,
      spiritual_center: chartData.correspondences.spiritual_center
    };
  }, [chartData?.correspondences]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-cosmic-silver">Loading Tarot guidance...</div>
      </div>
    );
  }

  const tarotData = chartData?.tarot;
  if (!tarotData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No Tarot data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarot Cards Overview */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">🃏</span>
            Your Tarot Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tarotCards.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {tarotCards.map((card, index) => {
                const cardTypes = ['Daily Focus Card', 'Life Path Card'];
                const cardType = cardTypes[index] ?? 'Guidance Card';
                
                return (
                  <div key={`tarot-card-${index}`} className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-cosmic-gold font-semibold text-lg">{cardType}</h3>
                      <h4 className="text-cosmic-purple font-medium">{card.name}</h4>
                      {card.hebrew_letter && (
                        <p className="text-cosmic-silver text-sm">Hebrew: {card.hebrew_letter}</p>
                      )}
                      {card.path && (
                        <p className="text-cosmic-silver text-sm">Path: {card.path}</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-cosmic-blue font-medium mb-1">Meaning</h5>
                        <p className="text-cosmic-silver text-sm">{card.meaning}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-cosmic-green font-medium mb-1">Guidance</h5>
                        <p className="text-cosmic-silver text-sm">{card.guidance}</p>
                      </div>
                      
                      {card.keywords && card.keywords.length > 0 && (
                        <div>
                          <h5 className="text-cosmic-purple font-medium mb-1">Keywords</h5>
                          <div className="flex flex-wrap gap-1">
                            {card.keywords.map((keyword, keywordIndex) => (
                              <span 
                                key={`keyword-${index}-${keywordIndex}`}
                                className="px-2 py-1 bg-cosmic-purple/20 text-cosmic-purple text-xs rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-cosmic-silver">No Tarot cards available in the current analysis</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Correspondences */}
      {correspondences && (
        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="cosmic-title flex items-center">
              <span className="mr-2">🔗</span>
              Spiritual Correspondences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {correspondences.daily_focus && (
                <div>
                  <h4 className="text-cosmic-gold font-medium mb-3">Daily Focus</h4>
                  <div className="space-y-2 text-sm text-cosmic-silver">
                    <div><span className="text-cosmic-blue">Element:</span> {correspondences.daily_focus.element}</div>
                    <div><span className="text-cosmic-blue">Planet:</span> {correspondences.daily_focus.planet}</div>
                    <div><span className="text-cosmic-blue">Theme:</span> {correspondences.daily_focus.theme}</div>
                    {correspondences.daily_focus.tarot && (
                      <div><span className="text-cosmic-blue">Tarot:</span> {correspondences.daily_focus.tarot}</div>
                    )}
                    {correspondences.daily_focus.astrology && (
                      <div><span className="text-cosmic-blue">Astrology:</span> {correspondences.daily_focus.astrology}</div>
                    )}
                  </div>
                </div>
              )}
              
              {correspondences.life_purpose && (
                <div>
                  <h4 className="text-cosmic-purple font-medium mb-3">Life Purpose</h4>
                  <div className="space-y-2 text-sm text-cosmic-silver">
                    <div><span className="text-cosmic-green">Energy:</span> {correspondences.life_purpose.primary_energy}</div>
                    <div><span className="text-cosmic-green">Goal:</span> {correspondences.life_purpose.spiritual_goal}</div>
                    <div><span className="text-cosmic-green">Style:</span> {correspondences.life_purpose.manifestation_style}</div>
                  </div>
                </div>
              )}
              
              {correspondences.spiritual_center && (
                <div>
                  <h4 className="text-cosmic-green font-medium mb-3">Spiritual Center</h4>
                  <div className="space-y-2 text-sm text-cosmic-silver">
                    <div><span className="text-cosmic-purple">Chakra:</span> {correspondences.spiritual_center.chakra}</div>
                    <div><span className="text-cosmic-purple">Color:</span> {correspondences.spiritual_center.color}</div>
                    <div><span className="text-cosmic-purple">Focus:</span> {correspondences.spiritual_center.focus_area}</div>
                    {correspondences.spiritual_center.sephirah && (
                      <div><span className="text-cosmic-purple">Sephirah:</span> {correspondences.spiritual_center.sephirah}</div>
                    )}
                    {correspondences.spiritual_center.element && (
                      <div><span className="text-cosmic-purple">Element:</span> {correspondences.spiritual_center.element}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tarot Wisdom */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">Understanding Tarot in Spiritual Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-cosmic-gold font-medium mb-2">🎭 Major Arcana</h4>
              <p className="text-cosmic-silver text-sm">
                The 22 Major Arcana cards represent life&apos;s spiritual journey and major karmic influences.
                Each card corresponds to a path on the Tree of Life and carries deep archetypal wisdom.
              </p>
            </div>
            
            <div>
              <h4 className="text-cosmic-blue font-medium mb-2">🗡️ Minor Arcana</h4>
              <p className="text-cosmic-silver text-sm">
                The 56 Minor Arcana cards reflect daily life experiences through four suits representing
                the elements: Wands (Fire), Cups (Water), Swords (Air), and Pentacles (Earth).
              </p>
            </div>
            
            <div>
              <h4 className="text-cosmic-purple font-medium mb-2">🌳 Tree of Life Connections</h4>
              <p className="text-cosmic-silver text-sm">
                Each Tarot card maps to specific paths between the Sephiroth, creating a comprehensive
                system for understanding your spiritual development and life lessons.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-cosmic-gold/10 rounded-lg border border-cosmic-gold/20">
              <p className="text-cosmic-silver text-sm">
                💫 <strong>Integration Practice:</strong> Meditate on your cards&apos; imagery and symbolism.
                Journal about how their meanings resonate with your current spiritual path and daily experiences.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TarotTab.displayName = 'TarotTab';
