import type { Meta, StoryObj } from '@storybook/react'
import { NewMediumImpact } from './index'

const meta = {
  title: 'Heroes/NewMediumImpact',
  component: NewMediumImpact,
  parameters: {
    backgrounds: {
        default: 'White'
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NewMediumImpact>

export default meta
type Story = StoryObj<typeof meta>

const now = new Date();

const defaultArgs = {
  title: 'Ogłoszenia duszpasterskie',
  author: 'ks. Bartosz Tokarski',
  authorAvatar: {
    id: '1',
    url: 'https://placehold.co/30x30',
    filename: 'avatar',
    mimeType: 'image/jpeg',
    filesize: 1024,
    width: 30,
    height: 30,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    alt: 'Author avatar',
  },
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  image: {
    id: '2',
    url: 'https://placehold.co/1200x800/234/fff',
    filename: 'background',
    mimeType: 'image/jpeg',
    filesize: 1024,
    width: 1200,
    height: 800,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    alt: 'Background image',
  },
  timestamp: '14 grudnia 2024',
  now: now.toISOString(),
}

export const Default: Story = {
  args: defaultArgs,
}

export const LongTitle: Story = {
  args: {
    ...defaultArgs,
    title: 'Ogłoszenia duszpasterskie na Uroczystość Niepokalanego Poczęcia Najświętszej Maryi Panny',
  },
} 