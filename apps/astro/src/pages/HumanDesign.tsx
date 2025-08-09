import React from 'react';

const HumanDesign: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-silver/20 rounded-2xl border border-cosmic-silver/10">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Human Design Chart
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Discover your unique energy type and life strategy
        </p>
      </div>

      {/* Human Design Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-cosmic-silver/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🧬</span>
            </div>
            <h2 className="text-2xl font-semibold text-cosmic-gold mb-4 font-playfair">
              Your Human Design Chart
            </h2>
            <p className="text-cosmic-silver/80">
              A revolutionary system that combines ancient wisdom with modern science
            </p>
          </div>

          <div className="bg-cosmic-dark/30 rounded-lg p-6 border border-cosmic-silver/10 mb-6">
            <div className="text-center">
              <div className="w-48 h-48 bg-cosmic-purple/10 rounded-lg border border-cosmic-gold/30 mx-auto mb-4 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-6xl mb-2 block">⚡</span>
                  <p className="text-cosmic-silver/60 text-sm">
                    Your Human Design chart will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">Energy Type</h3>
              <p className="text-cosmic-silver/80 text-sm">
                Your unique way of interacting with the world's energy
              </p>
            </div>
            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">Strategy</h3>
              <p className="text-cosmic-silver/80 text-sm">
                How to make decisions that align with your design
              </p>
            </div>
            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">Authority</h3>
              <p className="text-cosmic-silver/80 text-sm">
                Your inner guidance system for making choices
              </p>
            </div>
            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">Profile</h3>
              <p className="text-cosmic-silver/80 text-sm">
                Your conscious and unconscious personality themes
              </p>
            </div>
          </div>
        </div>

        <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h2 className="text-xl font-semibold text-cosmic-gold mb-4 font-playfair">
              Generate Your Chart
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-cosmic-silver/80 mb-2">Date of Birth</label>
              <input 
                type="date" 
                title="Enter your birth date"
                className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-cosmic-silver/80 mb-2">Time of Birth</label>
              <input 
                type="time" 
                title="Enter your birth time"
                className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-cosmic-silver/80 mb-2">Birth Location</label>
              <input 
                type="text" 
                placeholder="City, Country"
                className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              />
            </div>
            
            <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cosmic-silver/30 to-cosmic-purple hover:from-cosmic-silver/40 hover:to-cosmic-purple/80 text-white rounded-lg transition-all duration-300 font-semibold">
              Generate Human Design Chart
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10">
              <h4 className="text-cosmic-gold font-semibold mb-2">The 5 Energy Types</h4>
              <ul className="text-cosmic-silver/70 text-sm space-y-1">
                <li>• Manifestor (8%) - Initiators</li>
                <li>• Generator (37%) - Builders</li>
                <li>• Manifesting Generator (33%) - Multi-passionate</li>
                <li>• Projector (21%) - Guides</li>
                <li>• Reflector (1%) - Evaluators</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanDesign;
