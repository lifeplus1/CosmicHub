import React from 'react';
import { devConsole } from '../config/environment';
import { useNavigate } from 'react-router-dom';
import { Card } from '@cosmichub/ui';
import { SimpleBirthForm } from '../components/SimpleBirthForm';
import { useBirthData } from '../contexts/BirthDataContext';

const Calculator: React.FC = () => {
  const navigate = useNavigate();
  const { birthData } = useBirthData();

  devConsole.log?.('🧮 Calculator page rendered with birth data:', birthData);

  const navigateToSystem = (system: string) => {
    if (birthData === null) {
      alert('Please enter your birth data first to access chart systems.');
      return;
    }
    navigate(system);
  };

  return (
    <div className='space-y-8'>
      {/* Hero Section */}
      <div className='text-center py-16 bg-gradient-to-br from-cosmic-purple/20 via-cosmic-blue/20 to-cosmic-gold/10 rounded-2xl border border-cosmic-silver/10'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-5xl font-bold text-cosmic-gold mb-6 font-cinzel'>
            Cosmic Calculator
          </h1>
          <p className='text-xl text-cosmic-silver/90 mb-8 font-playfair leading-relaxed'>
            Your gateway to understanding the cosmic forces that shaped your
            birth moment.
            <br />
            <span className='text-cosmic-gold'>
              One form. Multiple astrological systems. Infinite insights.
            </span>
          </p>

          {/* Feature Highlights */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-8'>
            {[
              {
                icon: '🎯',
                title: 'Western Charts',
                desc: 'Tropical zodiac & houses',
              },
              {
                icon: '🕉️',
                title: 'Vedic Analysis',
                desc: 'Sidereal & traditional',
              },
              {
                icon: '🌌',
                title: 'Multi-System',
                desc: 'Compare all traditions',
              },
              {
                icon: '🤖',
                title: 'AI Insights',
                desc: 'Intelligent interpretations',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className='bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-purple/20'
              >
                <div className='text-2xl mb-2'>{feature.icon}</div>
                <h3 className='text-cosmic-gold font-semibold text-sm'>
                  {feature.title}
                </h3>
                <p className='text-cosmic-silver/70 text-xs'>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Birth Form */}
      <SimpleBirthForm
        title='Universal Birth Data'
        submitButtonText='Calculate All Charts'
        showSampleButton={true}
      />

      {/* Quick Navigation - Only show when data exists */}
      {birthData !== null && (
        <Card title='🚀 Quick Access to Chart Systems'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[
              {
                id: 'chart',
                title: 'Natal Chart',
                description:
                  'Classic Western astrology wheel with planets and aspects',
                icon: '⭐',
                color: 'cosmic-gold',
                available: true,
              },
              {
                id: 'multi-system',
                title: 'Multi-System',
                description:
                  'Compare Western, Vedic, Uranian systems side by side',
                icon: '🌍',
                color: 'cosmic-purple',
                available: true,
              },
              {
                id: 'numerology',
                title: 'Numerology',
                description: 'Life path, destiny, and personality numbers',
                icon: '🔢',
                color: 'cosmic-blue',
                available: true,
              },
              {
                id: 'human-design',
                title: 'Human Design',
                description: 'Your energetic blueprint and strategy',
                icon: '🧬',
                color: 'cosmic-silver',
                available: true,
              },
            ].map(system => (
              <button
                key={system.id}
                onClick={() => navigateToSystem(`/${system.id}`)}
                disabled={!system.available}
                className={`p-6 rounded-xl border transition-all duration-300 text-left hover:scale-105 ${
                  system.available
                    ? `border-${system.color}/30 hover:border-${system.color}/50 bg-${system.color}/5 hover:bg-${system.color}/10`
                    : 'border-gray-600 bg-gray-800/20 cursor-not-allowed opacity-50'
                }`}
              >
                <div className='text-3xl mb-3'>{system.icon}</div>
                <h3
                  className={`font-semibold mb-2 ${
                    system.available ? `text-${system.color}` : 'text-gray-500'
                  }`}
                >
                  {system.title}
                </h3>
                <p className='text-cosmic-silver/70 text-sm leading-relaxed'>
                  {system.description}
                </p>
                {system.available && (
                  <div className='mt-3 text-xs text-cosmic-silver/50'>
                    ✨ Ready to calculate
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className='mt-6 p-4 bg-cosmic-gold/10 rounded-lg border border-cosmic-gold/20'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>💡</span>
              <div>
                <h4 className='text-cosmic-gold font-semibold'>Pro Tip</h4>
                <p className='text-cosmic-silver/80 text-sm'>
                  Your birth data is automatically saved and shared across all
                  chart systems. Edit anytime by clicking the &quot;Edit&quot;
                  button on any page.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Information Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card title='🎯 Precise Calculations'>
          <div className='space-y-4'>
            <div className='flex items-start gap-3'>
              <span className='text-cosmic-gold mt-1'>✦</span>
              <div>
                <h4 className='text-cosmic-silver font-medium'>
                  Swiss Ephemeris
                </h4>
                <p className='text-cosmic-silver/70 text-sm'>
                  Industry-standard astronomical calculations
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-cosmic-gold mt-1'>✦</span>
              <div>
                <h4 className='text-cosmic-silver font-medium'>
                  Multiple House Systems
                </h4>
                <p className='text-cosmic-silver/70 text-sm'>
                  Placidus, Koch, Equal, Whole Sign options
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-cosmic-gold mt-1'>✦</span>
              <div>
                <h4 className='text-cosmic-silver font-medium'>
                  Advanced Aspects
                </h4>
                <p className='text-cosmic-silver/70 text-sm'>
                  Major and minor aspects with precise orbs
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card title='🔮 Integrated Systems'>
          <div className='space-y-4'>
            <div className='flex items-start gap-3'>
              <span className='text-cosmic-purple mt-1'>◆</span>
              <div>
                <h4 className='text-cosmic-silver font-medium'>
                  Cross-Traditional
                </h4>
                <p className='text-cosmic-silver/70 text-sm'>
                  Western, Vedic, and Uranian astrology
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-cosmic-purple mt-1'>◆</span>
              <div>
                <h4 className='text-cosmic-silver font-medium'>
                  Synthesis Views
                </h4>
                <p className='text-cosmic-silver/70 text-sm'>
                  Combined insights from multiple systems
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <span className='text-cosmic-purple mt-1'>◆</span>
              <div>
                <h4 className='text-cosmic-silver font-medium'>
                  Modern Integration
                </h4>
                <p className='text-cosmic-silver/70 text-sm'>
                  Numerology and Human Design compatibility
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;
