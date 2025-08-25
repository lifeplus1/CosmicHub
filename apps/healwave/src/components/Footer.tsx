import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className='py-8 text-white border-t bg-black/20 backdrop-blur-md border-white/10'>
      <div className='container px-6 mx-auto'>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-4 space-x-2'>
            <div className='w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400'></div>
            <h3 className='text-xl font-semibold'>HealWave</h3>
          </div>
          <p className='max-w-md mx-auto mb-6 text-gray-300'>
            Therapeutic binaural beats designed to promote healing, relaxation,
            and enhanced well-being through the power of sound frequency.
          </p>
          <div className='flex justify-center mb-6 space-x-8 text-sm text-gray-400'>
            <a
              href='/privacy'
              className='transition-colors duration-200 hover:text-cyan-400'
            >
              Privacy Policy
            </a>
            <a
              href='/terms'
              className='transition-colors duration-200 hover:text-cyan-400'
            >
              Terms of Service
            </a>
            <a
              href='/contact'
              className='transition-colors duration-200 hover:text-cyan-400'
            >
              Contact Us
            </a>
            <a
              href='/science'
              className='transition-colors duration-200 hover:text-cyan-400'
            >
              The Science
            </a>
          </div>
          <div className='flex justify-center mb-4 space-x-6'>
            <div className='flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer bg-white/10 hover:bg-cyan-500/30'>
              <span className='text-xs'>📧</span>
            </div>
            <div className='flex items-center justify-center w-8 h-8 transition-colors rounded-full cursor-pointer bg-white/10 hover:bg-cyan-500/30'>
              <span className='text-xs'>🔗</span>
            </div>
          </div>
          <p className='text-sm text-gray-500'>
            © 2025 HealWave. All rights reserved. • Made with healing
            intentions
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
