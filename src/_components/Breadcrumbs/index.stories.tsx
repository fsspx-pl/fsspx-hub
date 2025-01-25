import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from './index'

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { label: 'Kaplice', href: '/kaplice' },
      { label: 'Poznań', href: '/kaplice/poznan' },
      { label: 'Ogłoszenia', href: '/kaplice/poznan/ogloszenia', isLast: true },
    ],
  },
}

export const SingleItem: Story = {
  args: {
    items: [
      { label: 'Kaplice', href: '/kaplice', isLast: true },
    ],
  },
}

export const TwoItems: Story = {
  args: {
    items: [
      { label: 'Kaplice', href: '/kaplice' },
      { label: 'Poznań', href: '/kaplice/poznan', isLast: true },
    ],
  },
} 