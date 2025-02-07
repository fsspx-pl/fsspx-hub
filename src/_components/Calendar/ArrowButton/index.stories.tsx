import type { Meta, StoryObj } from '@storybook/react'
import ArrowButton from '.'

const meta = {
  title: 'Components/Calendar/ArrowButton',
  component: ArrowButton,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArrowButton>

export default meta
type Story = StoryObj<typeof meta>


export const Default: Story = {
  decorators: [
    (Story) => (
      <Story />
    ),
  ],
} 