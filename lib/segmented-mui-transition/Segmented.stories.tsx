import type { Meta, StoryObj } from '@storybook/react';

import { Segmented } from './Segmented';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/SegmentedMuiTransition',
  component: Segmented,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs']
} satisfies Meta<typeof Segmented>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const ValueOnly: Story = {
  args: {
    segmentedOptions: ['asparagus', 'tomato', 'onion'],
    value: 'onion',
    onChange: (value) => console.log(value)
  }
};

export const ValueAndLabel: Story = {
  args: {
    segmentedOptions: [
      { label: 'asparagus', value: 1 },
      { label: 'tomato', value: 2 },
      { label: 'onion', value: 3 }
    ],
    value: 2,
    onChange: (value) => console.log(value)
  }
};
