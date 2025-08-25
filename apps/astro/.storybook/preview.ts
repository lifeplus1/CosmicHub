import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'centered',
    a11y: {
      element: '#root',
      manual: false,
    },
    backgrounds: {
      default: 'cosmic-dark',
      values: [
        { name: 'cosmic-dark', value: '#0c0f17' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    docs: {
      source: { type: 'code' },
    },
    test: {
      dangerouslyIgnoreUnhandledErrors: true,
    },
  },
};

export default preview;
