import React from 'react';

const Numerology: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-gold/20 to-cosmic-purple/20 rounded-2xl border border-cosmic-silver/10">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Numerology Calculator
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Discover the mystical meanings behind the numbers in your life
        </p>
      </div>

      {/* Numerology Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-2xl font-semibold text-cosmic-gold mb-4 font-playfair">
              Core Numbers
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">Life Path Number</h3>
              <p className="text-cosmic-silver/80 text-sm mb-3">
                Your life's purpose and the path you're meant to walk
              </p>
              <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-cosmic-gold">?</span>
              </div>
            </div>

            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">Expression Number</h3>
              <p className="text-cosmic-silver/80 text-sm mb-3">
                Your natural talents and abilities you're meant to develop
              </p>
              <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-cosmic-gold">?</span>
              </div>
            </div>

            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2">Soul Urge Number</h3>
              <p className="text-cosmic-silver/80 text-sm mb-3">
                Your heart's desire and inner motivations
              </p>
              <div className="w-12 h-12 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-cosmic-gold">?</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-semibold text-cosmic-gold mb-4 font-playfair">
              Calculate Your Numbers
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="block text-cosmic-silver/80 mb-2">Full Name at Birth</label>
              <input 
                id="full-name"
                type="text" 
                placeholder="Enter your full birth name"
                className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="birth-date-numerology" className="block text-cosmic-silver/80 mb-2">Date of Birth</label>
              <input 
                id="birth-date-numerology"
                type="date" 
                className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
              />
            </div>
            
            <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple hover:from-cosmic-gold/80 hover:to-cosmic-purple/80 text-white rounded-lg transition-all duration-300 font-semibold">
              Calculate My Numbers
            </button>

            <div className="mt-6 p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10">
              <h4 className="text-cosmic-gold font-semibold mb-2">About Numerology</h4>
              <p className="text-cosmic-silver/70 text-sm">
                Numerology is the ancient study of numbers and their mystical significance in your life. 
                Each number carries unique vibrations that can reveal insights about your personality, 
                destiny, and life purpose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Numerology;
