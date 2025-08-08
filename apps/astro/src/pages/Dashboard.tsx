import React from 'react';
import { useAuth } from '@cosmichub/auth';
import { isFeatureEnabled } from '@cosmichub/config';
import EnvironmentStatus from '../components/EnvironmentStatus';
import { PageLoading } from '../components/CosmicLoading';

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl border border-cosmic-silver/10">
        <h1 className="text-5xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Welcome to CosmicHub
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          {user ? `Hello, ${user.email}!` : 'Your cosmic journey begins here'}
        </p>
        <div className="mt-6 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-cosmic-gold to-cosmic-purple rounded-full"></div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="group bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-6 hover:border-cosmic-purple/50 hover:bg-cosmic-purple/10 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-purple/25">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-cosmic-purple/20 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🌟</span>
            </div>
            <h3 className="text-xl font-semibold text-cosmic-gold font-playfair">Birth Chart</h3>
          </div>
          <p className="text-cosmic-silver/80 mb-6 leading-relaxed">
            Generate your personalized astrological birth chart with detailed planetary positions and aspects
          </p>
          <button 
            onClick={() => window.location.href = '/chart'}
            className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold group-hover:shadow-lg"
          >
            Create Chart
          </button>
        </div>

        {isFeatureEnabled('healwave') && (
          <div className="group bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-6 hover:border-cosmic-gold/50 hover:bg-cosmic-gold/5 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-gold/25">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-xl font-semibold text-cosmic-gold font-playfair">Healwave Integration</h3>
            </div>
            <p className="text-cosmic-silver/80 mb-6 leading-relaxed">
              Access personalized healing frequencies based on your astrological chart
            </p>
            <button 
              onClick={() => window.location.href = '/healwave'}
              className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple hover:from-cosmic-gold/80 hover:to-cosmic-purple/80 text-white rounded-lg transition-all duration-300 font-semibold group-hover:shadow-lg"
            >
              Explore Healwave
            </button>
          </div>
        )}

        <div className="group bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-6 hover:border-cosmic-silver/50 hover:bg-cosmic-silver/5 transition-all duration-300 hover:shadow-lg hover:shadow-cosmic-silver/25">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-cosmic-silver/20 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="text-xl font-semibold text-cosmic-gold font-playfair">Your Profile</h3>
          </div>
          <p className="text-cosmic-silver/80 mb-6 leading-relaxed">
            Manage your account settings, preferences, and cosmic profile
          </p>
          <button 
            onClick={() => window.location.href = '/profile'}
            className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-silver/20 to-cosmic-blue hover:from-cosmic-silver/30 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold group-hover:shadow-lg"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Environment Status Section */}
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <EnvironmentStatus className="bg-cosmic-blue/20 backdrop-blur-lg border-cosmic-silver/20 hover:border-cosmic-purple/30 transition-colors duration-300" />
        </div>
      </div>

      {/* Recent Activity Section */}
      {user && (
        <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-cosmic-gold/20 rounded-lg flex items-center justify-center mr-4">
              <span className="text-xl">📈</span>
            </div>
            <h3 className="text-2xl font-semibold text-cosmic-gold font-playfair">Recent Activity</h3>
          </div>
          <div className="bg-cosmic-dark/30 rounded-lg p-6 border border-cosmic-silver/10">
            <p className="text-cosmic-silver/70 text-center italic">
              Your recent charts and cosmic sessions will appear here as you explore the cosmos.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Message for Non-Authenticated Users */}
      {!user && (
        <div className="bg-gradient-to-r from-cosmic-purple/20 to-cosmic-gold/20 backdrop-blur-lg border border-cosmic-gold/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-cosmic-gold mb-4 font-playfair">
            Begin Your Cosmic Journey
          </h3>
          <p className="text-cosmic-silver/80 mb-6 leading-relaxed max-w-2xl mx-auto">
            Discover the mysteries of the universe through personalized astrology charts, 
            healing frequencies, and cosmic insights tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-cosmic-gold hover:bg-cosmic-gold/80 text-cosmic-dark font-semibold rounded-lg transition-colors duration-300">
              Sign Up
            </button>
            <button className="px-8 py-3 border border-cosmic-silver/30 hover:border-cosmic-silver/50 text-cosmic-silver hover:bg-cosmic-silver/10 font-semibold rounded-lg transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
