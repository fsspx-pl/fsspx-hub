import type { Meta, StoryObj } from '@storybook/react'
import { Day } from './index'

const meta: Meta<typeof Day> = {
  title: 'Components/Calendar/Day',
  component: Day,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    date: { control: 'date' },
    isSelected: { control: 'boolean' },
    hideDayName: { control: 'boolean' },
    hasMoreLeft: { control: 'boolean' },
    hasMoreRight: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Day>

// Helper to create dates
const createDate = (day: number, month: number = 4, year: number = 2025) => {
  return new Date(year, month - 1, day) // month is 0-indexed
}

export const Default: Story = {
  args: {
    date: createDate(15), // Monday, May 15, 2025
    onClick: () => console.log('Day clicked'),
  },
}

export const Selected: Story = {
  args: {
    date: createDate(15),
    isSelected: true,
    onClick: () => console.log('Selected day clicked'),
  },
}

export const Sunday: Story = {
  args: {
    date: createDate(18), // Sunday, May 18, 2025
    onClick: () => console.log('Sunday clicked'),
  },
}

export const SundaySelected: Story = {
  args: {
    date: createDate(18), // Sunday, May 18, 2025
    isSelected: true,
    onClick: () => console.log('Selected Sunday clicked'),
  },
}

export const WithGradientLeft: Story = {
  args: {
    date: createDate(1),
    hasMoreLeft: true,
    onClick: () => console.log('Day with left gradient clicked'),
  },
}

export const WithGradientRight: Story = {
  args: {
    date: createDate(31),
    hasMoreRight: true,
    onClick: () => console.log('Day with right gradient clicked'),
  },
}

export const WithGradientBoth: Story = {
  args: {
    date: createDate(15),
    hasMoreLeft: true,
    hasMoreRight: true,
    onClick: () => console.log('Day with both gradients clicked'),
  },
}

export const HiddenDayName: Story = {
  args: {
    date: createDate(15),
    hideDayName: true,
    onClick: () => console.log('Day without name clicked'),
  },
}

export const WeekView: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '4px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
      <Day date={createDate(12)} />
      <Day date={createDate(13)} />
      <Day date={createDate(14)} />
      <Day date={createDate(15)} isSelected={true} />
      <Day date={createDate(16)} />
      <Day date={createDate(17)} />
      <Day date={createDate(18)} /> {/* Sunday */}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing how days appear in the weekly calendar view, with one day selected and Sunday highlighted in red.',
      },
    },
  },
}

export const ScrollableView: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '4px', background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
      <Day date={createDate(10)} hasMoreLeft={true} />
      <Day date={createDate(11)} />
      <Day date={createDate(12)} />
      <Day date={createDate(13)} isSelected={true} />
      <Day date={createDate(14)} />
      <Day date={createDate(15)} />
      <Day date={createDate(16)} hasMoreRight={true} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing gradient effects on edge days indicating more days are available when scrolling.',
      },
    },
  },
} 