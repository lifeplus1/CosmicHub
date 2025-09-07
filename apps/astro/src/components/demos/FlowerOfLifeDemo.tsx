import React, { useState, useEffect, memo, useCallback } from 'react';
import { FlowerOfLifeViewer } from '@cosmichub/ui';
import type { SPIRITUAL_003_5_Data, ChakraData } from '../../types/spiritual-003-5.types';

/**
 * Demo component showcasing the Flower of Life and Metatron's Cube visualization
 * Integrates with SPIRITUAL-003.5 sacred geometry data for Phase 2 implementation
 */
export const FlowerOfLifeDemo: React.FC = memo(() => {
  const [sacredData, setSacredData] = useState<SPIRITUAL_003_5_Data | null>(null);
  const [showMetatronsCube, setShowMetatronsCube] = useState(false);
  const [chakraIntegration, setChakraIntegration] = useState(true);
  const [expertMode, setExpertMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load SPIRITUAL-003.5 data
  useEffect(() => {
    const loadSacredData = async () => {
      try {
        const response = await fetch('/api/spiritual-003-5');
        if (response.ok) {
          const data = await response.json() as SPIRITUAL_003_5_Data;
          setSacredData(data);
        } else {
          // Fallback to synthetic data for demonstration
          const syntheticData: SPIRITUAL_003_5_Data = {
            meta: {
              version: "SPIRITUAL-003.5-PHASE-2",
              timestamp: new Date().toISOString(),
              chakra_system: "7_POINT_TRADITIONAL",
              sacred_geometry_level: "ADVANCED"
            },
            constitutional_profile: {
              primary_type: "VATA_PITTA",
              elemental_balance: {
                fire: 0.35,
                earth: 0.15,
                air: 0.30,
                water: 0.20
              },
              chakra_resonance: {
                root: { frequency: 256, activation: 0.75, color: '#e53e3e' },
                sacral: { frequency: 288, activation: 0.80, color: '#fd8204' },
                solar_plexus: { frequency: 320, activation: 0.85, color: '#edb81e' },
                heart: { frequency: 341, activation: 0.90, color: '#2ba640' },
                throat: { frequency: 384, activation: 0.75, color: '#3572e8' },
                third_eye: { frequency: 426, activation: 0.70, color: '#6b46c1' },
                crown: { frequency: 480, activation: 0.65, color: '#9d4edd' }
              }
            },
            sacred_patterns: {
              flower_of_life: {
                sacred_radius: 1.618,
                golden_ratio_factor: 1.618033988749,
                pattern_layers: 3,
                fibonacci_scaling: [1, 1, 2, 3, 5, 8, 13],
                resonance_frequencies: [432, 528, 741, 852, 963]
              },
              metatrons_cube: {
                vertex_count: 13,
                sacred_connections: 78,
                dimensional_bridges: 5,
                platonic_solids_embedded: true,
                merkaba_activation: 0.85
              }
            },
            psychological_insights: {
              stress_patterns: {
                primary_trigger: "Spiritual disconnection",
                sacred_geometry_affinity: 0.92,
                flower_of_life_resonance: 0.88,
                recommended_meditation: "Merkaba breathing with Flower of Life visualization"
              },
              growth_potential: {
                spiritual_expansion: 0.95,
                geometric_intuition: 0.87,
                sacred_pattern_recognition: 0.91
              }
            }
          };
          setSacredData(syntheticData);
        }
      } catch (error) {
        console.warn('Failed to load sacred data, using synthetic data:', error);
        // Use synthetic data as fallback
      } finally {
        setLoading(false);
      }
    };

    void loadSacredData();
  }, []);

  // Memoized event handlers
  // Memoized event handlers (prefixed with _ to indicate future use)
  const _handleMetatronsCubeToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setShowMetatronsCube(e.target.checked);
  }, []);

  const _handleChakraIntegrationToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setChakraIntegration(e.target.checked);
  }, []);

  const _handleExpertModeToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpertMode(e.target.checked);
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gradient-to-b from-cosmic-dark to-cosmic-blue rounded-lg">
        <div className="text-gold text-lg">Loading Sacred Geometry...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gold">
          Flower of Life & Metatron&apos;s Cube
        </h1>
        <p className="text-lg text-cosmic-light max-w-3xl mx-auto">
          Interactive sacred geometry visualization integrating the Flower of Life pattern 
          with Metatron&apos;s Cube and chakra energy systems. Based on SPIRITUAL-003.5 
          advanced sacred pattern analysis.
        </p>
      </div>

      {/* Controls Panel */}
      <div className="bg-cosmic-dark/50 rounded-lg p-4 border border-cosmic-light/20">
        <h3 className="text-xl font-semibold text-gold mb-4">Visualization Controls</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 text-cosmic-light">
            <input
              type="checkbox"
              checked={showMetatronsCube}
              onChange={_handleMetatronsCubeToggle}
              className="rounded"
            />
            <span>Show Metatron&apos;s Cube</span>
          </label>
          
          <label className="flex items-center space-x-2 text-cosmic-light">
            <input
              type="checkbox"
              checked={chakraIntegration}
              onChange={_handleChakraIntegrationToggle}
              className="rounded"
            />
            <span>Chakra Color Integration</span>
          </label>
          
          <label className="flex items-center space-x-2 text-cosmic-light">
            <input
              type="checkbox"
              checked={expertMode}
              onChange={_handleExpertModeToggle}
              className="rounded"
            />
            <span>Expert Mode (Platonic Revelation)</span>
          </label>
        </div>
      </div>

      {/* Flower of Life Viewer */}
      <div className="bg-cosmic-dark/30 rounded-lg p-6 border border-cosmic-light/10">
        <FlowerOfLifeViewer
          showMetatronsCube={showMetatronsCube}
          chakraIntegration={chakraIntegration}
          expertMode={expertMode}
          data={sacredData ? {
            sacred_patterns: {
              flower_of_life: {
                circles: sacredData.sacred_patterns.flower_of_life.pattern_layers * 6,
                golden_ratio_factor: sacredData.sacred_patterns.flower_of_life.golden_ratio_factor,
                sacred_radius: sacredData.sacred_patterns.flower_of_life.sacred_radius,
              },
              metatrons_cube: {
                vertices: [],
                connections: [],
                platonic_revelation: sacredData.sacred_patterns.metatrons_cube.platonic_solids_embedded,
              }
            },
            chakra_correspondences: {
              root: { 
                color: sacredData.constitutional_profile.chakra_resonance.root.color, 
                frequency: sacredData.constitutional_profile.chakra_resonance.root.frequency 
              },
              sacral: { 
                color: sacredData.constitutional_profile.chakra_resonance.sacral.color, 
                frequency: sacredData.constitutional_profile.chakra_resonance.sacral.frequency 
              },
              solar: { 
                color: sacredData.constitutional_profile.chakra_resonance.solar_plexus.color, 
                frequency: sacredData.constitutional_profile.chakra_resonance.solar_plexus.frequency 
              },
              heart: { 
                color: sacredData.constitutional_profile.chakra_resonance.heart.color, 
                frequency: sacredData.constitutional_profile.chakra_resonance.heart.frequency 
              },
              throat: { 
                color: sacredData.constitutional_profile.chakra_resonance.throat.color, 
                frequency: sacredData.constitutional_profile.chakra_resonance.throat.frequency 
              },
              third_eye: { 
                color: sacredData.constitutional_profile.chakra_resonance.third_eye.color, 
                frequency: sacredData.constitutional_profile.chakra_resonance.third_eye.frequency 
              },
              crown: { 
                color: sacredData.constitutional_profile.chakra_resonance.crown.color, 
                frequency: sacredData.constitutional_profile.chakra_resonance.crown.frequency 
              },
            }
          } : undefined}
        />
      </div>

      {/* Sacred Data Insights */}
      {sacredData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Flower of Life Patterns */}
          <div className="bg-cosmic-dark/50 rounded-lg p-6 border border-cosmic-light/20">
            <h3 className="text-xl font-semibold text-gold mb-4">Sacred Pattern Analysis</h3>
            <div className="space-y-3 text-cosmic-light">
              <div className="flex justify-between">
                <span>Sacred Radius:</span>
                <span className="text-gold">{sacredData.sacred_patterns.flower_of_life.sacred_radius}</span>
              </div>
              <div className="flex justify-between">
                <span>Golden Ratio Factor:</span>
                <span className="text-gold">{sacredData.sacred_patterns.flower_of_life.golden_ratio_factor.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pattern Layers:</span>
                <span className="text-gold">{sacredData.sacred_patterns.flower_of_life.pattern_layers}</span>
              </div>
              <div className="flex justify-between">
                <span>Fibonacci Sequence:</span>
                <span className="text-gold text-sm">{sacredData.sacred_patterns.flower_of_life.fibonacci_scaling.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Metatron's Cube Data */}
          <div className="bg-cosmic-dark/50 rounded-lg p-6 border border-cosmic-light/20">
            <h3 className="text-xl font-semibold text-gold mb-4">Metatron&apos;s Cube Metrics</h3>
            <div className="space-y-3 text-cosmic-light">
              <div className="flex justify-between">
                <span>Vertex Count:</span>
                <span className="text-gold">{sacredData.sacred_patterns.metatrons_cube.vertex_count}</span>
              </div>
              <div className="flex justify-between">
                <span>Sacred Connections:</span>
                <span className="text-gold">{sacredData.sacred_patterns.metatrons_cube.sacred_connections}</span>
              </div>
              <div className="flex justify-between">
                <span>Dimensional Bridges:</span>
                <span className="text-gold">{sacredData.sacred_patterns.metatrons_cube.dimensional_bridges}</span>
              </div>
              <div className="flex justify-between">
                <span>Merkaba Activation:</span>
                <span className="text-gold">{(sacredData.sacred_patterns.metatrons_cube.merkaba_activation * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chakra Resonance Display */}
      {sacredData && chakraIntegration && (
        <div className="bg-cosmic-dark/50 rounded-lg p-6 border border-cosmic-light/20">
          <h3 className="text-xl font-semibold text-gold mb-4">Chakra Resonance Integration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {Object.entries(sacredData.constitutional_profile.chakra_resonance).map(([chakra, chakraData]) => {
              const data = chakraData as ChakraData;
              return (
                <div key={chakra} className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full border-2 border-cosmic-light/30 flex items-center justify-center text-xs font-semibold text-black bg-gradient-to-br from-yellow-400 to-orange-500">
                    {Math.round(data.activation * 100)}%
                  </div>
                  <div className="text-sm text-cosmic-light capitalize">
                    {chakra.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gold">
                    {data.frequency} Hz
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-cosmic-dark/30 rounded-lg p-6 border border-cosmic-light/10">
        <h3 className="text-xl font-semibold text-gold mb-4">Interaction Guide</h3>
        <div className="grid md:grid-cols-2 gap-6 text-cosmic-light">
          <div>
            <h4 className="font-semibold text-gold mb-2">Mouse Controls:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Left click + drag: Rotate view</li>
              <li>• Scroll wheel: Zoom in/out</li>
              <li>• Right click + drag: Pan camera</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gold mb-2">Sacred Geometry Features:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Flower of Life: Ancient symbol of creation</li>
              <li>• Metatron&apos;s Cube: Contains all Platonic solids</li>
              <li>• Chakra Integration: Color-coded energy centers</li>
              <li>• Expert Mode: Reveals hidden geometric relationships</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

FlowerOfLifeDemo.displayName = 'FlowerOfLifeDemo';

export default FlowerOfLifeDemo;
