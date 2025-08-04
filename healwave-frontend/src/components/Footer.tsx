import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
            <h3 className="text-xl font-semibold">HealWave</h3>
          </div>
          <p className="text-gray-300 mb-6 max-w-md mx-auto">
            Therapeutic binaural beats designed to promote healing, relaxation, and enhanced well-being through the power of sound frequency.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400 mb-6">
            <a href="/privacy" className="hover:text-cyan-400 transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-cyan-400 transition-colors duration-200">
              Terms of Service
            </a>
            <a href="/contact" className="hover:text-cyan-400 transition-colors duration-200">
              Contact Us
            </a>
            <a href="/science" className="hover:text-cyan-400 transition-colors duration-200">
              The Science
            </a>
          </div>
          <div className="flex justify-center space-x-6 mb-4">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyan-500/30 transition-colors cursor-pointer">
              <span className="text-xs">📧</span>
            </div>
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-cyan-500/30 transition-colors cursor-pointer">
              <span className="text-xs">🔗</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 HealWave. All rights reserved. • Made with healing intentions
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
