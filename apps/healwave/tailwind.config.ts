import { sharedTheme } from '../../tailwind.config.shared.js';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    // Include node_modules for Radix UI styles
    './node_modules/@radix-ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: sharedTheme,
  },
  plugins: [],
};
