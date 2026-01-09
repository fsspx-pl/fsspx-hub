import type { Meta, StoryObj } from '@storybook/react';
import { CMSLink } from './index';
import { Page } from '@/payload-types';

const meta = {
  title: 'Components/Link',
  component: CMSLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['reference', 'custom'],
      description: 'Type of the link - reference to CMS content or custom URL',
    },
    url: {
      control: 'text',
      description: 'Custom URL for non-reference links',
    },
    newTab: {
      control: 'boolean',
      description: 'Whether the link should open in a new tab',
    },
    reference: {
      control: 'object',
      description: 'Reference to CMS content',
    },
    label: {
      control: 'text',
      description: 'Link text label',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof CMSLink>;

export default meta;
type Story = StoryObj<typeof CMSLink>;

// Basic link with label
export const Basic: Story = {
  args: {
    type: 'custom',
    url: 'https://example.com',
    label: 'Basic Link',
  },
};

// External link with new tab
export const ExternalNewTab: Story = {
  args: {
    type: 'custom',
    url: 'https://example.com',
    label: 'External Link',
    newTab: true,
  },
};