import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@cosmichub/ui';
import type { SpiritualTabProps, SephirahInfo, KabbalahPathInfo as _KabbalahPathInfo } from '../utils/types';

/**
 * Kabbalah Tab Component
 * Displays Kabbalah Tree of Life analysis and Sephirah insights
 */
export const KabbalahTab: React.FC<SpiritualTabProps> = React.memo(function KabbalahTab({
  chartData,
  isLoading
}) {
  // Memoize Sephirah information - moved to top to avoid conditional hooks
  const sephirahInfo = useMemo(() => {
    const kabbalahData = chartData?.kabbalah;
    if (!kabbalahData) return [];
    
    const sephiroth: SephirahInfo[] = [];
    
    if (kabbalahData.primary_sephirah) {
      sephiroth.push({
        id: typeof kabbalahData.primary_sephirah.position === 'number' 
          ? kabbalahData.primary_sephirah.position 
          : kabbalahData.primary_sephirah.sphere_number || 0,
        name: kabbalahData.primary_sephirah.name || 'Unknown',
        meaning: kabbalahData.primary_sephirah.meaning || 'No meaning available',
        element: kabbalahData.primary_sephirah.element,
        planet: kabbalahData.primary_sephirah.planetary_association,
        color: undefined, // Not available in SephirahData
        attribute: undefined, // Not available in SephirahData
        spiritual_experience: kabbalahData.primary_sephirah.meditation_focus,
        virtue: undefined, // Not available in SephirahData
        vice: undefined // Not available in SephirahData
      });
    }
    
    if (kabbalahData.secondary_sephirah) {
      sephiroth.push({
        id: typeof kabbalahData.secondary_sephirah.position === 'number' 
          ? kabbalahData.secondary_sephirah.position 
          : kabbalahData.secondary_sephirah.sphere_number || 0,
        name: kabbalahData.secondary_sephirah.name || 'Unknown',
        meaning: kabbalahData.secondary_sephirah.meaning || 'No meaning available',
        element: kabbalahData.secondary_sephirah.element,
        planet: kabbalahData.secondary_sephirah.planetary_association,
        color: undefined, // Not available in SephirahData
        attribute: undefined, // Not available in SephirahData
        spiritual_experience: kabbalahData.secondary_sephirah.meditation_focus,
        virtue: undefined, // Not available in SephirahData
        vice: undefined // Not available in SephirahData
      });
    }
    
    return sephiroth;
  }, [chartData?.kabbalah]);

  // Memoize path information - moved to top to avoid conditional hooks
  const pathInfo = useMemo(() => {
    const kabbalahData = chartData?.kabbalah;
    if (!kabbalahData?.relevant_paths) return [];
    
    return kabbalahData.relevant_paths.map((path, index) => ({
      id: path.path_number || index + 1,
      from_sephirah: 0,  // Would need actual mapping
      to_sephirah: 0,    // Would need actual mapping
      hebrew_letter: path.hebrew_letter || 'Unknown',
      tarot_card: path.tarot_card || 'Unknown',
      element: undefined, // Not available in KabbalahPathData
      meaning: path.meaning || 'No meaning available',
      spiritual_lesson: path.guidance || 'No lesson available'
    }));
  }, [chartData?.kabbalah]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-cosmic-silver">Loading Kabbalah analysis...</div>
      </div>
    );
  }

  const kabbalahData = chartData?.kabbalah;
  if (!kabbalahData) {
    return (
      <div className="text-cosmic-silver text-center py-8">
        <p>No Kabbalah data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary & Secondary Sephiroth */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title flex items-center">
            <span className="mr-2">✨</span>
            Your Sephiroth
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sephirahInfo.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {sephirahInfo.map((sephirah, index) => {
                const sephirahTypes = ['Primary Sephirah', 'Secondary Sephirah'];
                const sephirahType = sephirahTypes[index] ?? 'Sephirah';
                
                return (
                  <div key={`sephirah-${index}`} className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-cosmic-gold font-semibold text-lg">{sephirahType}</h3>
                      <h4 className="text-cosmic-purple font-medium text-xl">{sephirah.name}</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-cosmic-blue font-medium mb-1">Meaning</h5>
                        <p className="text-cosmic-silver text-sm">{sephirah.meaning}</p>
                      </div>
                      
                      {sephirah.spiritual_experience && (
                        <div>
                          <h5 className="text-cosmic-purple font-medium mb-1">Meditation Focus</h5>
                          <p className="text-cosmic-silver text-sm">{sephirah.spiritual_experience}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {sephirah.planet && (
                          <div>
                            <h6 className="text-cosmic-gold font-medium text-sm">Planet</h6>
                            <p className="text-cosmic-silver text-sm">{sephirah.planet}</p>
                          </div>
                        )}
                        {sephirah.element && (
                          <div>
                            <h6 className="text-cosmic-gold font-medium text-sm">Element</h6>
                            <p className="text-cosmic-silver text-sm">{sephirah.element}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-cosmic-silver">No Sephirah information available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tree of Life Paths */}
      {pathInfo.length > 0 && (
        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="cosmic-title flex items-center">
              <span className="mr-2">🌳</span>
              Relevant Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pathInfo.map((path, index) => (
                <div key={`path-${index}`} className="p-4 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="text-cosmic-gold font-medium mb-2">Path Details</h5>
                      <div className="space-y-1 text-sm text-cosmic-silver">
                        <div><span className="text-cosmic-blue">Hebrew Letter:</span> {path.hebrew_letter}</div>
                        <div><span className="text-cosmic-blue">Tarot Card:</span> {path.tarot_card}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-cosmic-purple font-medium mb-2">Meaning</h5>
                      <p className="text-cosmic-silver text-sm">{path.meaning}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-cosmic-green font-medium mb-2">Spiritual Lesson</h5>
                      <p className="text-cosmic-silver text-sm">{path.spiritual_lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spiritual Focus & Guidance */}
      {kabbalahData && (
        <Card className="cosmic-card">
          <CardHeader>
            <CardTitle className="cosmic-title flex items-center">
              <span className="mr-2">🎯</span>
              Spiritual Focus & Tree Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {kabbalahData.spiritual_focus && (
                <div>
                  <h4 className="text-cosmic-gold font-medium mb-3">🎭 Spiritual Focus</h4>
                  <p className="text-cosmic-silver">{kabbalahData.spiritual_focus}</p>
                </div>
              )}
              
              {kabbalahData.tree_guidance && (
                <div>
                  <h4 className="text-cosmic-blue font-medium mb-3">🌳 Tree Guidance</h4>
                  <p className="text-cosmic-silver">{kabbalahData.tree_guidance}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kabbalah Wisdom */}
      <Card className="cosmic-card">
        <CardHeader>
          <CardTitle className="cosmic-title">Understanding the Tree of Life</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-cosmic-gold font-medium mb-2">✨ The Sephiroth</h4>
              <p className="text-cosmic-silver text-sm">
                The 10 Sephiroth represent divine emanations and different aspects of consciousness.
                Each Sephirah has its own qualities, planetary correspondence, and spiritual lessons.
              </p>
            </div>
            
            <div>
              <h4 className="text-cosmic-blue font-medium mb-2">🛤️ The 22 Paths</h4>
              <p className="text-cosmic-silver text-sm">
                The paths connecting the Sephiroth represent the journey of consciousness between
                different states of being. Each path corresponds to a Hebrew letter and Tarot card.
              </p>
            </div>
            
            <div>
              <h4 className="text-cosmic-purple font-medium mb-2">🔗 The Four Worlds</h4>
              <p className="text-cosmic-silver text-sm">
                Assiah (Action), Yetzirah (Formation), Briah (Creation), and Atziluth (Emanation)
                represent different levels of reality and consciousness in the Kabbalistic system.
              </p>
            </div>
            
            <div className="mt-6 p-4 bg-cosmic-purple/10 rounded-lg border border-cosmic-purple/20">
              <p className="text-cosmic-silver text-sm">
                🌟 <strong>Practice:</strong> Meditate on your primary Sephirah&apos;s qualities and work to 
                embody its virtues while transforming its corresponding vices. The Tree of Life is a 
                map for spiritual development and self-understanding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

KabbalahTab.displayName = 'KabbalahTab';
