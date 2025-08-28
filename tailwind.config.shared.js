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
  },
  backdropBlur: {
    lg: '16px',
  },
  animation: {
    float: 'float 6s ease-in-out infinite',
    shimmer: 'shimmer 2s linear infinite',
    spin: 'spin 1s linear infinite',
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
  },
};

const sharedConfig = {
  theme: {
    extend: sharedTheme,
  },
  plugins: [],
};

export default sharedConfig;
