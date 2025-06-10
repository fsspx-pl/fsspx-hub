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
    onClick: { action: 'clicked' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArrowButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onClick: () => console.log('Arrow clicked'),
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const LeftArrow: Story = {
  args: {
    className: 'rotate-180',
    onClick: () => console.log('Left arrow clicked'),
  },
}

export const RightArrow: Story = {
  args: {
    onClick: () => console.log('Right arrow clicked'),
  },
} 