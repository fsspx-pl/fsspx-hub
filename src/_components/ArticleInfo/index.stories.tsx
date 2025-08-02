import type { Meta, StoryObj } from '@storybook/react'
import { ArticleInfo } from './index'
import { subDays } from 'date-fns'
import { defaultAvatar } from './consts'

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

export const Default: Story = {
  args: {
    author: 'Jerzy Brzęczyszczykiewicz',
    avatar: defaultAvatar,
    createdAt: subDays(now, 3).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
  },
}

export const WithoutAvatar: Story = {
  args: {
    ...Default.args,
    avatar: null,
  },
}