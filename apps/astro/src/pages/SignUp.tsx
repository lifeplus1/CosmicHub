import React from 'react';

const SignUp: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center py-12 bg-gradient-to-r from-cosmic-gold/20 to-cosmic-purple/20 rounded-2xl border border-cosmic-silver/10 mb-8">
        <h1 className="text-4xl font-bold text-cosmic-gold mb-4 font-cinzel">
          Sign Up
        </h1>
        <p className="text-xl text-cosmic-silver/80 font-playfair">
          Begin your cosmic journey today
        </p>
      </div>

      <div className="bg-cosmic-blue/30 backdrop-blur-lg border border-cosmic-silver/20 rounded-xl p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-cosmic-silver/80 mb-2">Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
            />
          </div>
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
              placeholder="Create a password"
              className="w-full px-4 py-2 bg-cosmic-blue/20 border border-cosmic-silver/30 rounded-lg text-cosmic-silver focus:border-cosmic-purple focus:outline-none"
            />
          </div>
          
          <button className="w-full px-6 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-purple hover:from-cosmic-gold/80 hover:to-cosmic-purple/80 text-white rounded-lg transition-all duration-300 font-semibold">
            Create Account
          </button>

          <div className="text-center">
            <p className="text-cosmic-silver/70">
              Already have an account?{' '}
              <a href="/login" className="text-cosmic-gold hover:text-cosmic-gold/80 font-semibold">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
