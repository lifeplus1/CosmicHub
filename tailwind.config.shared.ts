// Shared Tailwind configuration for all CosmicHub applications
export const sharedTheme = {
  fontFamily: {
    cinzel: ['Cinzel', 'serif'],
    playfair: ['Playfair Display', 'serif'],
    inter: ['Inter', 'sans-serif'],
    'source-sans': ['Source Sans Pro', 'sans-serif'],
  },
  colors: {
    cosmic: {
      dark: '#0f0f23',
      blue: '#1a202c',
      purple: '#553c9a',
      gold: '#f6ad55',
      silver: '#e2e8f0',
      red: '#dc2626',
    },
    // Chart-specific colors
    chart: {
      // Aspect colors
      conjunction: '#ff0000',
      opposition: '#0066cc',
      trine: '#00aa00',
      square: '#ff6600',
      sextile: '#9966ff',
      quincunx: '#666666',
      // Planet colors
      sun: '#FFD700',
      moon: '#E8E8E8',
      mercury: '#87CEEB',
      venus: '#32CD32',
      mars: '#FF4500',
      jupiter: '#FF8C00',
      saturn: '#DAA520',
      uranus: '#4FD0E4',
      neptune: '#6495ED',
      pluto: '#DA70D6',
      // Background gradients
      'bg-start': '#f8f9fa',
      'bg-end': '#e9ecef',
    },
    // Progress component colors
    progress: {
      background: 'rgba(15, 15, 35, 0.3)', // cosmic-dark/30
      border: 'rgba(85, 60, 154, 0.2)', // cosmic-purple/20  
      fill: 'linear-gradient(to right, #553c9a, #1a202c)', // cosmic-purple to cosmic-blue
      shadow: 'rgba(85, 60, 154, 0.3)', // cosmic-purple/30
      text: '#e2e8f0', // cosmic-silver
    },
  },
  // Cosmic component classes for consistent UI patterns
  extend: {
    // Glass morphism utilities
    utilities: {
      '.cosmic-glass': {
        'background-color': 'rgba(15, 15, 35, 0.3)',
        '-webkit-backdrop-filter': 'blur(16px)',
        'backdrop-filter': 'blur(16px)',
        'border': '1px solid rgba(226, 232, 240, 0.2)',
      },
      '.cosmic-glow': {
        'box-shadow': '0 0 20px rgba(85, 60, 154, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      },
    },
  },
  backdropBlur: {
    lg: '16px',
  },
  animation: {
    float: 'float 6s ease-in-out infinite',
    shimmer: 'shimmer 2s linear infinite',
    spin: 'spin 1s linear infinite',
    // Chart-specific animations
    'planet-hover': 'planet-hover 0.3s ease',
    'aspect-draw': 'aspect-draw 0.8s ease',
    'chart-zoom': 'chart-zoom 0.2s ease',
  },
  keyframes: {
    float: {
      '0%, 100%': { transform: 'translateY(0px)' },
      '50%': { transform: 'translateY(-20px)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    // Chart-specific keyframes
    'planet-hover': {
      '0%': { transform: 'scale(1)' },
      '100%': { transform: 'scale(1.05)' },
    },
    'aspect-draw': {
      '0%': { strokeDashoffset: '100' },
      '100%': { strokeDashoffset: '0' },
    },
    'chart-zoom': {
      '0%': { transform: 'scale(1)' },
      '100%': { transform: 'scale(1.1)' },
    },
  },
};

const sharedConfig = {
  theme: {
    extend: sharedTheme,
  },
  plugins: [],
};

export default sharedConfig;
