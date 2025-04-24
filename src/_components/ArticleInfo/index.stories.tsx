import type { Meta, StoryObj } from '@storybook/react'
import { ArticleInfo } from './index'
import { subDays } from 'date-fns'

const meta = {
  title: 'Components/ArticleInfo',
  component: ArticleInfo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ArticleInfo>

export default meta
type Story = StoryObj<typeof meta>

const now = new Date();

const defaultAvatar = {
  id: '1',
  url: 'https://placehold.co/30x30.jpg',
  filename: 'avatar',
  mimeType: 'image/jpeg',
  filesize: 1024,
  width: 30,
  height: 30,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  alt: 'Avatar image',
  now: now.toISOString(),
}

export const Default: Story = {
  args: {
    author: 'Jerzy Brzęczyszczykiewicz',
    avatar: defaultAvatar,
    createdAt: subDays(now, 3).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
    now: now.toISOString(),
  },
}

export const WithoutAvatar: Story = {
  args: {
    ...Default.args,
    avatar: null,
  },
}