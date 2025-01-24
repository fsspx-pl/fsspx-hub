import type { Meta, StoryObj } from '@storybook/react'
import { ReadingTime } from './index'

const meta = {
  title: 'Components/ReadingTime',
  component: ReadingTime,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReadingTime>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    minutes: 4,
  },
}

export const Small: Story = {
  args: {
    ...Default.args,
    small: true,
  },
} 