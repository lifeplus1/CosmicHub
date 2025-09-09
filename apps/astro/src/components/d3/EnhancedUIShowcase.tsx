import React, { useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@cosmichub/ui';
import {
  D3Chart,
  AstrologyChartWheel,
  FrequencyWaveform,
  type D3ChartData,
  type AstrologyPlanet,
  type AstrologyAspect,
  type AstrologyHouse,
  type FrequencyData
} from './';

// Sample data for demonstrations
const generateSampleChartData = (): D3ChartData[] => [
  { id: 'sun', value: 85, label: 'Sun', color: '#ffd43b' },
  { id: 'moon', value: 72, label: 'Moon', color: '#9775fa' },
  { id: 'mercury', value: 68, label: 'Mercury', color: '#74c0fc' },
  { id: 'venus', value: 91, label: 'Venus', color: '#ff6b9d' },
  { id: 'mars', value: 45, label: 'Mars', color: '#ff6b6b' },
  { id: 'jupiter', value: 78, label: 'Jupiter', color: '#ffd43b' },
  { id: 'saturn', value: 62, label: 'Saturn', color: '#8ce99a' }
];

const generateSamplePlanets = (): AstrologyPlanet[] => [
  { name: 'Sun', sign: 'Leo', degree: 15.5, house: 5, color: '#ffd43b', symbol: '☉', element: 'fire', quality: 'fixed' },
  { name: 'Moon', sign: 'Cancer', degree: 22.3, house: 4, color: '#9775fa', symbol: '☽', element: 'water', quality: 'cardinal' },
  { name: 'Mercury', sign: 'Virgo', degree: 8.7, house: 6, color: '#74c0fc', symbol: '☿', element: 'earth', quality: 'mutable' },
  { name: 'Venus', sign: 'Libra', degree: 3.2, house: 7, color: '#ff6b9d', symbol: '♀', element: 'air', quality: 'cardinal' },
  { name: 'Mars', sign: 'Aries', degree: 18.9, house: 1, color: '#ff6b6b', symbol: '♂', element: 'fire', quality: 'cardinal', retrograde: true },
  { name: 'Jupiter', sign: 'Sagittarius', degree: 27.4, house: 9, color: '#ffd43b', symbol: '♃', element: 'fire', quality: 'mutable' },
  { name: 'Saturn', sign: 'Capricorn', degree: 11.6, house: 10, color: '#8ce99a', symbol: '♄', element: 'earth', quality: 'cardinal' }
];

const generateSampleAspects = (): AstrologyAspect[] => [
  { planet1: 'Sun', planet2: 'Moon', type: 'trine', orb: 2.1, applying: true, color: '#51cf66', strength: 0.8 },
  { planet1: 'Mercury', planet2: 'Venus', type: 'conjunction', orb: 1.5, applying: false, color: '#ffd43b', strength: 0.9 },
  { planet1: 'Mars', planet2: 'Saturn', type: 'square', orb: 3.2, applying: true, color: '#ff6b6b', strength: 0.6 }
];

const generateSampleHouses = (): AstrologyHouse[] => [
  { number: 1, sign: 'Aries', cusp: 0, ruler: 'Mars', color: '#ff6b6b' },
  { number: 2, sign: 'Taurus', cusp: 30, ruler: 'Venus', color: '#51cf66' },
  { number: 3, sign: 'Gemini', cusp: 60, ruler: 'Mercury', color: '#74c0fc' },
  { number: 4, sign: 'Cancer', cusp: 90, ruler: 'Moon', color: '#9775fa' },
  { number: 5, sign: 'Leo', cusp: 120, ruler: 'Sun', color: '#ffd43b' },
  { number: 6, sign: 'Virgo', cusp: 150, ruler: 'Mercury', color: '#69db7c' }
];

const generateSampleFrequencies = (): FrequencyData[] => [
  { frequency: 528, amplitude: 80, phase: 0, label: 'Love Frequency', color: '#ff6b9d', category: 'solfeggio', benefits: ['DNA Repair', 'Love', 'Harmony'] },
  { frequency: 432, amplitude: 75, phase: Math.PI/4, label: 'Universal Frequency', color: '#74c0fc', category: 'planetary', benefits: ['Universal Harmony', 'Peace'] },
  { frequency: 396, amplitude: 70, phase: Math.PI/2, label: 'Liberation', color: '#51cf66', category: 'solfeggio', benefits: ['Release Fear', 'Liberation'] },
  { frequency: 285, amplitude: 65, phase: 3*Math.PI/4, label: 'Quantum Healing', color: '#ffd43b', category: 'rife', benefits: ['Tissue Healing', 'Regeneration'] },
  { frequency: 174, amplitude: 60, phase: Math.PI, label: 'Foundation', color: '#9775fa', category: 'solfeggio', benefits: ['Grounding', 'Foundation'] }
];

// Enhanced UI Showcase Component
export const EnhancedUIShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'charts' | 'astrology' | 'frequencies'>('charts');
  const [selectedFrequency, setSelectedFrequency] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Memoized data
  const chartData = useMemo(() => generateSampleChartData(), []);
  const planets = useMemo(() => generateSamplePlanets(), []);
  const aspects = useMemo(() => generateSampleAspects(), []);
  const houses = useMemo(() => generateSampleHouses(), []);
  const frequencies = useMemo(() => generateSampleFrequencies(), []);

  // Chart configurations
  const d3Config = useMemo(() => ({
    width: 600,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    responsive: true,
    animation: { duration: 1000, easing: d3.easeCubicOut },
    accessibility: {
      title: 'Planetary Energy Distribution',
      description: 'Interactive chart showing planetary energy levels in the current chart'
    },
    theme: {
      colors: {
        primary: '#8b5cf6',
        secondary: '#553c9a',
        accent: '#f6ad55',
        background: '#0f0f23',
        text: '#e2e8f0'
      },
      fontSize: { title: 16, label: 12, axis: 11 }
    }
  }), []);

  const astrologyConfig = useMemo(() => ({
    width: 500,
    height: 500,
    innerRadius: 80,
    outerRadius: 200,
    showAspects: true,
    showHouses: true,
    showDegrees: true,
    animation: { duration: 1500, easing: d3.easeElasticOut },
    theme: {
      background: '#0f0f23',
      planets: {},
      aspects: {},
      houses: {},
      signs: {}
    },
    accessibility: {
      title: 'Interactive Astrology Chart Wheel',
      description: 'Complete astrological chart with planets, aspects, and houses'
    }
  }), []);

  const frequencyConfig = useMemo(() => ({
    width: 700,
    height: 300,
    showWaveform: true,
    showSpectrum: true,
    showFrequencyLabels: true,
    animation: { duration: 800, easing: d3.easeCubicOut },
    theme: {
      background: '#0f0f23',
      wave: '#8b5cf6',
      spectrum: '#553c9a',
      labels: '#e2e8f0',
      grid: '#553c9a'
    },
    accessibility: {
      title: 'Frequency Waveform Visualization',
      description: 'Real-time visualization of healing frequencies and their waveforms'
    }
  }), []);

  // Event handlers
  const handleFrequencySelect = useCallback((frequency: FrequencyData) => {
    setSelectedFrequency(frequency.frequency);
    setIsPlaying(true);
  }, []);

  const handleFrequencyHover = useCallback((_frequency: FrequencyData | null) => {
    // Handle hover effects
  }, []);

  const togglePlayback = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const tabs = [
    { id: 'charts', label: '📊 Data Charts', description: 'Enhanced D3 bar charts with animations' },
    { id: 'astrology', label: '🌟 Astrology Wheel', description: 'Interactive astrology chart visualization' },
    { id: 'frequencies', label: '🎵 Frequency Waves', description: 'Real-time frequency waveform visualization' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-dark via-cosmic-blue to-cosmic-purple text-cosmic-silver">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-cosmic-gold to-cosmic-purple bg-clip-text mb-4">
            ✨ Enhanced UI Showcase
          </h1>
          <p className="text-xl text-cosmic-silver/80 max-w-3xl mx-auto">
            Experience the next generation of CosmicHub visualizations with advanced D3.js integrations,
            smooth animations, and comprehensive accessibility features.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge className="bg-cosmic-gold/20 text-cosmic-gold border-cosmic-gold/30">
              ⚡ Performance Optimized
            </Badge>
            <Badge className="bg-cosmic-purple/20 text-cosmic-purple border-cosmic-purple/30">
              ♿ WCAG 2.1 AA Compliant
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              🎨 Cosmic Theme
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              📱 Responsive
            </Badge>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'charts' | 'astrology' | 'frequencies')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-cosmic-gold text-cosmic-dark shadow-lg'
                    : 'text-cosmic-silver hover:text-cosmic-gold hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Charts Tab */}
            {activeTab === 'charts' && (
              <div className="space-y-8">
                <Card className="cosmic-glass border-cosmic-purple/30">
                  <CardHeader>
                    <CardTitle className="text-2xl text-cosmic-gold flex items-center gap-2">
                      📊 Enhanced D3 Bar Chart
                      <Badge className="bg-cosmic-purple/20 text-cosmic-purple">
                        Interactive
                      </Badge>
                    </CardTitle>
                    <p className="text-cosmic-silver/80">
                      Planetary energy distribution with smooth animations and accessibility features
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <D3Chart
                        data={chartData}
                        config={d3Config}
                        onDataPointClick={(data) => console.log('Clicked:', data)}
                        onDataPointHover={(data) => console.log('Hovered:', data)}
                        testId="planetary-chart"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Astrology Tab */}
            {activeTab === 'astrology' && (
              <div className="space-y-8">
                <Card className="cosmic-glass border-cosmic-purple/30">
                  <CardHeader>
                    <CardTitle className="text-2xl text-cosmic-gold flex items-center gap-2">
                      🌟 Interactive Astrology Chart Wheel
                      <Badge className="bg-cosmic-purple/20 text-cosmic-purple">
                        3D-Ready
                      </Badge>
                    </CardTitle>
                    <p className="text-cosmic-silver/80">
                      Complete astrological visualization with planets, aspects, houses, and interactive features
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <AstrologyChartWheel
                        planets={planets}
                        aspects={aspects}
                        houses={houses}
                        config={astrologyConfig}
                        interactive={true}
                        onPlanetClick={(planet) => console.log('Planet clicked:', planet)}
                        onAspectClick={(aspect) => console.log('Aspect clicked:', aspect)}
                        onHouseClick={(house) => console.log('House clicked:', house)}
                        testId="astrology-wheel"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Frequencies Tab */}
            {activeTab === 'frequencies' && (
              <div className="space-y-8">
                <Card className="cosmic-glass border-cosmic-purple/30">
                  <CardHeader>
                    <CardTitle className="text-2xl text-cosmic-gold flex items-center gap-2">
                      🎵 Real-time Frequency Visualization
                      <Badge className="bg-cosmic-purple/20 text-cosmic-purple">
                        Live Audio
                      </Badge>
                    </CardTitle>
                    <p className="text-cosmic-silver/80">
                      Dynamic waveform and spectrum visualization with real-time playback animation
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-center">
                      <FrequencyWaveform
                        data={frequencies}
                        config={frequencyConfig}
                        currentFrequency={selectedFrequency ?? undefined}
                        isPlaying={isPlaying}
                        onFrequencySelect={handleFrequencySelect}
                        onFrequencyHover={handleFrequencyHover}
                        testId="frequency-waveform"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                      <Button
                        onClick={togglePlayback}
                        className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isPlaying
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-cosmic-gold hover:bg-cosmic-gold/90 text-cosmic-dark'
                        }`}
                      >
                        {isPlaying ? '⏹️ Stop' : '▶️ Play'}
                      </Button>

                      {selectedFrequency && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-cosmic-purple/20 border border-cosmic-purple/30 rounded-lg">
                          <span className="text-cosmic-gold font-medium">
                            Current: {selectedFrequency} Hz
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Features Showcase */}
        <motion.div
          className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            {
              icon: '⚡',
              title: 'Performance Optimized',
              description: 'Virtualization, memoization, and lazy loading for smooth 60fps experiences'
            },
            {
              icon: '♿',
              title: 'Accessibility First',
              description: 'WCAG 2.1 AA compliant with screen reader support and keyboard navigation'
            },
            {
              icon: '🎨',
              title: 'Cosmic Theme',
              description: 'Consistent design system with cosmic colors, gradients, and animations'
            },
            {
              icon: '📱',
              title: 'Responsive Design',
              description: 'Mobile-first approach with adaptive layouts and touch-optimized interactions'
            },
            {
              icon: '🔄',
              title: 'Real-time Updates',
              description: 'Live data synchronization with smooth transitions and loading states'
            },
            {
              icon: '🎯',
              title: 'Type Safe',
              description: 'Full TypeScript coverage with Zod validation and strict type checking'
            },
            {
              icon: '🧪',
              title: 'Test Coverage',
              description: 'Comprehensive unit and integration tests with visual regression testing'
            },
            {
              icon: '🚀',
              title: 'Production Ready',
              description: 'Error boundaries, monitoring, and graceful degradation for reliability'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Card className="cosmic-glass border-white/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:transform hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-cosmic-gold mb-2">{feature.title}</h3>
                  <p className="text-sm text-cosmic-silver/80">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedUIShowcase;
