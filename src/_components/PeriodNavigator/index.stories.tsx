import type { Meta, StoryObj } from '@storybook/react';
import { PeriodNavigator } from './index';

const meta: Meta<typeof PeriodNavigator> = {
  title: 'Components/PeriodNavigator',
  component: PeriodNavigator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    viewMode: {
      control: { type: 'select' },
      options: ['weekly', 'monthly'],
    },
    titleClickable: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Monthly: Story = {
  args: {
    currentDate: new Date(2024, 0, 15), // January 15, 2024
    viewMode: 'monthly',
    onDateChange: (date: Date) => console.log('Date changed to:', date),
    titleClickable: true,
  },
};

export const Weekly: Story = {
  args: {
    currentDate: new Date(2024, 0, 15), // January 15, 2024
    viewMode: 'weekly',
    onDateChange: (date: Date) => console.log('Date changed to:', date),
    titleClickable: true,
  },
};

export const NonClickableTitle: Story = {
  args: {
    currentDate: new Date(2024, 0, 15), // January 15, 2024
    viewMode: 'monthly',
    onDateChange: (date: Date) => console.log('Date changed to:', date),
    titleClickable: false,
  },
};

export const WithToggleView: Story = {
  args: {
    currentDate: new Date(2024, 0, 15), // January 15, 2024
    viewMode: 'monthly',
    onDateChange: (date: Date) => console.log('Date changed to:', date),
    onToggleView: () => console.log('Toggle view clicked'),
    titleClickable: true,
  },
};

export const WithDisabledButtons: Story = {
  args: {
    currentDate: new Date(2024, 0, 15), // January 15, 2024
    viewMode: 'monthly',
    onDateChange: (date: Date) => console.log('Date changed to:', date),
    titleClickable: false,
    disablePrevious: true,
    disableNext: true,
  },
};

export const WithDisabledNext: Story = {
  args: {
    currentDate: new Date(), // Current date
    viewMode: 'monthly',
    onDateChange: (date: Date) => console.log('Date changed to:', date),
    titleClickable: false,
    disableNext: true,
  },
}; 