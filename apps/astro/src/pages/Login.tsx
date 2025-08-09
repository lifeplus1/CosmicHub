import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-purple/20 to-cosmic-blue/20 rounded-2xl border border-cosmic-silver/10 mb-8">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Sign In
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Welcome back to your cosmic journey
        </p>
      </div>

      <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-cosmic-silver/80 mb-2">Email</label>
            <input 
              type="email" 
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-cosmic-silver/80 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
            />
          </div>
          
          <button className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-purple to-cosmic-blue hover:from-cosmic-purple/80 hover:to-cosmic-blue/80 text-white rounded-lg transition-all duration-300 font-semibold">
            Sign In
          </button>

          <div className="text-center">
            <p className="text-cosmic-silver/70">
              Don't have an account?{' '}
              <a href="/signup" className="text-cosmic-gold hover:text-cosmic-gold/80 font-semibold">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
