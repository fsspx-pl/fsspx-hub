import type { Meta, StoryObj } from '@storybook/react'
import { AnnouncementAttachments } from './index'
import { Media } from '@/payload-types'

const meta: Meta<typeof AnnouncementAttachments> = {
  title: 'Components/AnnouncementAttachments',
  component: AnnouncementAttachments,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof AnnouncementAttachments>

const mockMedia1: Media = {
  id: '1',
  alt: 'Test PDF Document',
  filename: 'test-document.pdf',
  url: '/api/media/file/test-document.pdf',
  mimeType: 'application/pdf',
  filesize: 102400,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockMedia2: Media = {
  id: '2',
  alt: 'Another PDF Document',
  filename: 'another-document.pdf',
  url: '/api/media/file/another-document.pdf',
  mimeType: 'application/pdf',
  filesize: 204800,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const SingleAttachmentAsObject: Story = {
  args: {
    attachments: mockMedia1,
  },
}

export const SingleAttachmentAsArray: Story = {
  args: {
    attachments: [mockMedia1],
  },
}

export const MultipleAttachments: Story = {
  args: {
    attachments: [mockMedia1, mockMedia2],
  },
}

export const NoAttachments: Story = {
  args: {
    attachments: null,
  },
}

export const EmptyArray: Story = {
  args: {
    attachments: [],
  },
}

