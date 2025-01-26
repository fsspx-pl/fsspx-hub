import type { Meta, StoryObj } from '@storybook/react'
import { BigImpact } from './index'

const meta = {
  title: 'Heroes/BigImpact',
  component: BigImpact,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BigImpact>

export default meta
type Story = StoryObj<typeof meta>

const defaultArgs = {
  image: {
    id: '1',
    url: 'https://placehold.co/1200x800',
    filename: 'hero',
    mimeType: 'image/jpeg',
    filesize: 1024,
    width: 1200,
    height: 800,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    alt: 'Article hero image',
  },
  author: 'ks. Bartosz Tokarski',
  authorAvatar: {
    id: '2',
    url: 'https://placehold.co/400x400',
    filename: 'avatar',
    mimeType: 'image/jpeg',
    filesize: 1024,
    width: 400,
    height: 400,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    alt: 'Author avatar',
  },
  timestamp: '12 minut temu',
  title: 'The Sources of the New Synodal Doctrine',
  excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi...',
  readingTimeMinutes: 4,
}

export const Default: Story = {
  args: defaultArgs,
}

export const LongTitle: Story = {
  args: {
    ...defaultArgs,
    title: 'The Sources of the New Synodal Doctrine and Its Impact on Modern Catholic Church',
  },
}