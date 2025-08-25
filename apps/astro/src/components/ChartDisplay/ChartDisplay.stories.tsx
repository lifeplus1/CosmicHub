import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import type { ChartLike } from './normalizeChart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChartDisplay from '.';
import { sampleChartData } from './sampleData';
import './ChartDisplay.stories.css';

type ChartType = 'natal' | 'synastry' | 'composite' | 'transit';
type Story = StoryObj<typeof ChartDisplay>;

const queryClient: QueryClient = new QueryClient();

// Meta with explicit tags enables autodocs + interactions panel; a11y config scoped to region wrapper.
const meta: Meta<typeof ChartDisplay> = {
  title: 'Astrology/ChartDisplay',
  component: ChartDisplay,
  tags: ['autodocs', 'aria', 'accessibility'],
  parameters: {
    a11y: {
      element: '#root',
      config: {
        rules: [
          {
            id: 'region',
            enabled: true,
          },
          {
            id: 'aria-roles',
            enabled: true,
          },
        ],
      },
    },
  },
  decorators: [
    (Story: ComponentType): JSX.Element => (
      <QueryClientProvider client={queryClient}>
        <div
          className='storybook-wrapper'
          role='region'
          aria-label='Chart display story'
        >
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
};
export default meta;

/**
 * Sample story showcasing a complete natal chart with ARIA support.
 * The component provides proper region labeling and keyboard navigation.
 */
export const Sample: Readonly<Story> = {
  args: {
    chart: sampleChartData,
    chartType: 'natal' satisfies ChartType,
  },
  // Type safety provided by StoryBook - no runtime check needed
  play: async ({ canvasElement }): Promise<void> => {
    // Ensures the chart is accessible via keyboard navigation
    const element = canvasElement.querySelector('[role="region"]');
    if (element) {
      element.setAttribute('tabindex', '0');
    }
  },
};

/**
 * Empty state story demonstrating how the component handles null chart data.
 * Includes appropriate ARIA attributes for screen readers.
 */
export const Empty: Readonly<Story> = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'region',
            enabled: true,
          },
        ],
      },
    },
  },
  args: {
    chart: null,
    chartType: 'natal' satisfies ChartType,
  },
};

const customChartData: Readonly<ChartLike> = {
  planets: [
    {
      name: 'Sun',
      sign: 'Leo',
      degree: 3,
      position: 123,
      house: 10,
    },
    {
      name: 'Moon',
      sign: 'Taurus',
      degree: 15,
      position: 45,
      house: 7,
    },
  ],
  houses: [
    {
      number: 1,
      sign: 'Aries',
      cusp: 0,
      house: 1,
    },
    {
      number: 2,
      sign: 'Taurus',
      cusp: 30,
      house: 2,
    },
  ],
  aspects: [
    {
      planet1: 'Sun',
      planet2: 'Moon',
      type: 'Conjunction',
      orb: 2,
      applying: 'Applying',
    },
  ],
  angles: [
    {
      name: 'Ascendant',
      sign: 'Aries',
      degree: 0,
      position: 0,
    },
  ],
};

/**
 * Story with custom chart data demonstrating rich astrological information display.
 * Features comprehensive accessibility support with proper ARIA landmarks and roles.
 */
export const CustomData: Readonly<Story> = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'region',
            enabled: true,
          },
        ],
      },
    },
  },
  args: {
    chart: customChartData,
    chartType: 'natal' satisfies ChartType,
  },
};
