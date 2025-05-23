import type { Meta, StoryObj } from '@storybook/react'
import { Logo } from './index'

const meta = {
  title: 'Components/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'white',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithoutLogoText: Story = {
  args: {
    skipMainText: true,
  },
}