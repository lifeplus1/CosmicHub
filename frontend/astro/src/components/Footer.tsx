import React from 'react';

export default function Footer(): JSX.Element {
  return (
    <footer className="py-6 mt-16 text-center text-yellow-200 border-t-2 border-yellow-400 relative backdrop-blur-md bg-gradient-to-r from-purple-900/95 via-purple-900/80 to-yellow-400/10">
      <div className="flex justify-center items-center flex-col gap-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg viewBox="0 0 32 32" className="w-6 h-6 text-yellow-300">
            <circle cx="16" cy="16" r="12" fill="#f8d477" opacity="0.25" />
            <circle cx="16" cy="16" r="7" fill="#f4b400" />
            <path d="M16 6v-2M16 28v-2M6 16H4M28 16h-2M23.07 23.07l1.41 1.41M7.52 7.52l1.41 1.41M23.07 8.93l1.41-1.41M7.52 24.48l1.41-1.41" stroke="#db9e00" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-md font-serif tracking-widest text-yellow-200">
            © 2024 Cosmic Hub. All rights reserved.
          </p>
        </div>
        <div className="mt-1 flex gap-4 justify-center">
          <a 
            href="/privacy" 
            className="text-yellow-200 hover:text-yellow-400 hover:underline transition-colors"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="text-yellow-200 hover:text-yellow-400 hover:underline transition-colors"
          >
            Terms of Service
          </a>
          <a 
            href="/contact" 
            className="text-yellow-200 hover:text-yellow-400 hover:underline transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}