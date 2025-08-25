import React from 'react';

const Synastry: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-gold/20 rounded-2xl border border-cosmic-silver/10">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Synastry Analysis
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Explore the cosmic compatibility between two souls
        </p>
        <div className="mt-4 inline-flex items-center px-4 py-2 bg-cosmic-purple/20 rounded-full border border-cosmic-purple/30">
          <span className="text-cosmic-purple mr-2">🌟</span>
          <span className="text-cosmic-purple font-semibold">Premium Feature</span>
        </div>
      </div>

      {/* Synastry Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-cosmic-gold mb-6 font-playfair flex items-center">
            <span className="w-8 h-8 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mr-3">
              👫
            </span>
            Partner Information
          </h2>
          
          <div className="space-y-6">
            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Person A</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Name (optional)"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="Name (optional)"

                />
                <input 
                  type="date" 
                  title="Birth date for Person A"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="date input"

                />
                <input 
                  type="time" 
                  title="Birth time for Person A"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="time input"

                />
                <input 
                  type="text" 
                  placeholder="Birth location"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="Birth location"

                />
              </div>
            </div>

            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-4">Person B</h3>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Name (optional)"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="Name (optional)"

                />
                <input 
                  type="date" 
                  title="Birth date for Person B"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="date input"

                />
                <input 
                  type="time" 
                  title="Birth time for Person B"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="time input"

                />
                <input 
                  type="text" 
                  placeholder="Birth location"
                  className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
                aria-label="Birth location"

                />
              </div>
            </div>
          </div>

          <button className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-gold hover:from-cosmic-purple/80 hover:to-cosmic-gold/80 text-white rounded-lg transition-all duration-300 font-semibold">
            Analyze Compatibility
          </button>
        </div>

        <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-cosmic-gold mb-6 font-playfair">
            Compatibility Insights
          </h2>
          
          <div className="space-y-4">
            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h3 className="text-lg font-semibold text-cosmic-gold mb-2 flex items-center">
                <span className="text-xl mr-2">💝</span>
                Overall Compatibility
              </h3>
              <div className="w-full bg-cosmic-purple/20 rounded-full h-4 mb-2">
                <div className="bg-gradient-to-r from-cosmic-purple to-cosmic-gold h-4 rounded-full w-0 transition-all duration-1000"></div>
              </div>
              <p className="text-cosmic-silver/80 text-sm">
                Enter both birth details to see compatibility analysis
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10 text-center">
                <span className="text-2xl mb-2 block">🔥</span>
                <h4 className="text-cosmic-gold font-semibold">Passion</h4>
                <p className="text-cosmic-silver/70 text-sm">Romance & attraction</p>
              </div>
              <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10 text-center">
                <span className="text-2xl mb-2 block">🧠</span>
                <h4 className="text-cosmic-gold font-semibold">Mental</h4>
                <p className="text-cosmic-silver/70 text-sm">Communication style</p>
              </div>
              <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10 text-center">
                <span className="text-2xl mb-2 block">💖</span>
                <h4 className="text-cosmic-gold font-semibold">Emotional</h4>
                <p className="text-cosmic-silver/70 text-sm">Feeling connection</p>
              </div>
              <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10 text-center">
                <span className="text-2xl mb-2 block">⚖️</span>
                <h4 className="text-cosmic-gold font-semibold">Balance</h4>
                <p className="text-cosmic-silver/70 text-sm">Life harmony</p>
              </div>
            </div>

            <div className="bg-cosmic-dark/30 rounded-lg p-4 border border-cosmic-silver/10">
              <h4 className="text-cosmic-gold font-semibold mb-2">What is Synastry?</h4>
              <p className="text-cosmic-silver/70 text-sm">
                Synastry compares two birth charts to reveal the dynamics between relationships. 
                It examines how planetary positions interact to show compatibility, challenges, 
                and growth opportunities in partnerships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Synastry;
