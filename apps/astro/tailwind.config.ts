import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Background color classes used dynamically in synastry components
    'bg-green-500','bg-green-600','bg-green-400','bg-blue-500','bg-blue-600','bg-blue-400',
    'bg-yellow-400','bg-yellow-500','bg-orange-500','bg-orange-600','bg-red-500','bg-red-600',
    'bg-purple-500','bg-purple-600','bg-pink-500','bg-pink-600','bg-gray-200','bg-gray-300',
  // Progress bar width step classes
  'w-step-0','w-step-5','w-step-10','w-step-15','w-step-20','w-step-25','w-step-30','w-step-35','w-step-40','w-step-45','w-step-50','w-step-55','w-step-60','w-step-65','w-step-70','w-step-75','w-step-80','w-step-85','w-step-90','w-step-95','w-step-100'
  ],
  theme: {
    extend: {
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'source-sans': ['Source Sans Pro', 'sans-serif'],
      },
      colors: {
        'cosmic': {
          'dark': '#0f0f23',
          'blue': '#1a202c',
          'purple': '#553c9a',
          'gold': '#f6ad55',
          'silver': '#e2e8f0',
        }
      },
      backdropBlur: {
        'lg': '16px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
