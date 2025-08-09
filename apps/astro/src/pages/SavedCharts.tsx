import React from 'react';

const SavedCharts: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-blue/20 to-cosmic-purple/20 rounded-2xl border border-cosmic-silver/10">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Saved Charts
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Access your personal collection of astrological charts
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Empty State */}
        <div className="md:col-span-2 lg:col-span-3 text-center py-16">
          <div className="w-24 h-24 bg-cosmic-purple/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-2xl font-semibold text-cosmic-gold mb-4 font-playfair">
            No Saved Charts Yet
          </h3>
          <p className="text-cosmic-silver/80 mb-8 max-w-md mx-auto">
            Start creating charts to build your personal cosmic library. 
            All your charts will be saved here for easy access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/calculator'}
              className="px-8 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold"
            >
              Create Birth Chart
            </button>
            <button 
              onClick={() => window.location.href = '/numerology'}
              className="px-8 py-3 border border-cosmic-silver/30 hover:border-cosmic-silver/50 text-cosmic-silver hover:bg-cosmic-silver/10 rounded-lg transition-all duration-300 font-semibold"
            >
              Calculate Numerology
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
        <h3 className="text-xl font-semibold text-cosmic-gold mb-6 font-playfair flex items-center">
          <span className="w-8 h-8 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-3">
            ⚡
          </span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/calculator'}
            className="flex items-center p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10 hover:border-cosmic-purple/30 transition-colors duration-300 group"
          >
            <div className="w-12 h-12 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-cosmic-purple/30 transition-colors duration-300">
              <span className="text-xl">🔮</span>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-cosmic-gold">Birth Chart</h4>
              <p className="text-cosmic-silver/70 text-sm">Create natal chart</p>
            </div>
          </button>

          <button 
            onClick={() => window.location.href = '/numerology'}
            className="flex items-center p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10 hover:border-cosmic-gold/30 transition-colors duration-300 group"
          >
            <div className="w-12 h-12 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-cosmic-gold/30 transition-colors duration-300">
              <span className="text-xl">📊</span>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-cosmic-gold">Numerology</h4>
              <p className="text-cosmic-silver/70 text-sm">Calculate numbers</p>
            </div>
          </button>

          <button 
            onClick={() => window.location.href = '/human-design'}
            className="flex items-center p-4 bg-cosmic-dark/30 rounded-lg border border-cosmic-silver/10 hover:border-cosmic-silver/30 transition-colors duration-300 group"
          >
            <div className="w-12 h-12 bg-cosmic-silver/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-cosmic-silver/30 transition-colors duration-300">
              <span className="text-xl">🧬</span>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-cosmic-gold">Human Design</h4>
              <p className="text-cosmic-silver/70 text-sm">Energy blueprint</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedCharts;
