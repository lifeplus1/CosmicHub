import React from 'react';

export default function Footer() {
  return (
    <footer
      className="py-6 mt-16 text-center border-t-2 border-cosmic-gold/60"
      style={{
        backdropFilter: 'blur(8px)',
        background: 'linear-gradient(90deg, rgba(36,0,70,0.95) 60%, rgba(244,180,0,0.12) 100%)',
        position: 'relative',
      }}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <svg
            viewBox="0 0 32 32"
            className="w-6 h-6 text-cosmic-gold"
            fill="currentColor"
          >
            <circle cx="16" cy="16" r="12" fill="#f8d477" opacity="0.25" />
            <circle cx="16" cy="16" r="7" fill="#f4b400" />
            <path 
              d="M16 6v-2M16 28v-2M6 16H4M28 16h-2M23.07 23.07l1.41 1.41M7.52 7.52l1.41 1.41M23.07 8.93l1.41-1.41M7.52 24.48l1.41-1.41" 
              stroke="#db9e00" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
            />
          </svg>
          <p className="tracking-wider text-cosmic-gold font-cinzel">
            © 2024 Cosmic Hub. All rights reserved.
          </p>
        </div>
        <div className="flex justify-center gap-4 mt-1">
          <a 
            href="/privacy" 
            className="text-yellow-200 transition-colors hover:text-cosmic-gold hover:underline"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms" 
            className="text-yellow-200 transition-colors hover:text-cosmic-gold hover:underline"
          >
            Terms of Service
          </a>
          <a 
            href="/contact" 
            className="text-yellow-200 transition-colors hover:text-cosmic-gold hover:underline"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
}