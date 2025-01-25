import type { Meta, StoryObj } from '@storybook/react'
import { ArticleInfo } from './index'

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

const defaultAvatar = {
  id: '1',
  url: 'https://placehold.co/30x30.jpg',
  filename: 'avatar',
  mimeType: 'image/jpeg',
  filesize: 1024,
  width: 30,
  height: 30,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  alt: 'Avatar image',
}

export const Default: Story = {
  args: {
    author: 'Jerzy Brzęczyszczykiewicz',
    timestamp: '12 minut temu',
    avatar: defaultAvatar,
  },
}

export const WithoutAvatar: Story = {
  args: {
    ...Default.args,
    avatar: null,
  },
}