import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx|mdx)'
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y'
  ],
  features: {
    experimentalRSC: false
  },
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript'
  },
  core: {
    disableTelemetry: true
  },
  async viteFinal(config) {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, '../src'),
    };
    return config;
  }
};
export default config;
