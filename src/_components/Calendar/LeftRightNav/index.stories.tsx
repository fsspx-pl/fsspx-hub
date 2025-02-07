import type { Meta, StoryObj } from '@storybook/react'
import { LeftRightNav } from './index'

const meta = {
  title: 'Components/Calendar/LeftRightNav',
  component: LeftRightNav,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onPrevious: { action: 'previous clicked' },
    onNext: { action: 'next clicked' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LeftRightNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}