import React from 'react';

const Calculator: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl border border-cosmic-silver/10">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Astrological Calculator
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Calculate your personalized birth chart and cosmic insights
        </p>
      </div>

      {/* Calculator Content */}
      <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔮</span>
          </div>
          <h2 className="text-2xl font-semibold text-cosmic-gold mb-4 font-playfair">
            Birth Chart Calculator
          </h2>
          <p className="text-cosmic-silver/80 mb-8 max-w-2xl mx-auto">
            Enter your birth details to generate a detailed astrological chart with planetary positions, 
            houses, and aspects. This powerful tool will reveal the cosmic blueprint of your personality.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-cosmic-dark/30 rounded-lg p-6 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Birth Information</h3>
              <div className="space-y-4 text-left">
                <div>
                  <label htmlFor="birth-date" className="block text-cosmic-silver/80 mb-2">Date of Birth</label>
                  <input 
                    id="birth-date"
                    type="date" 
                    className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="birth-time" className="block text-cosmic-silver/80 mb-2">Time of Birth</label>
                  <input 
                    id="birth-time"
                    type="time" 
                    className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="birth-location" className="block text-cosmic-silver/80 mb-2">Location of Birth</label>
                  <input 
                    id="birth-location"
                    type="text" 
                    placeholder="City, Country"
                    className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-cosmic-dark/30 rounded-lg p-6 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Chart Preview</h3>
              <div className="text-center">
                <div className="w-32 h-32 bg-cosmic-purple/10 rounded-full border border-cosmic-gold/30 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">⭐</span>
                </div>
                <p className="text-cosmic-silver/60 text-sm">
                  Your personalized birth chart will appear here after entering your birth details.
                </p>
              </div>
            </div>
          </div>

          <button className="mt-8 px-8 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold">
            Generate Birth Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
