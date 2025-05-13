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

// Link with children instead of label
export const WithChildren: Story = {
  args: {
    type: 'custom',
    url: 'https://example.com',
    children: <span>Link with children</span>,
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

// Reference link to a page
export const ReferenceToPage: Story = {
  args: {
    type: 'reference',
    reference: {
      relationTo: 'pages',
      value: {
        id: '1',
        type: 'pastoral-announcements',
        title: 'Example Page',
        slug: 'example-page',
        period: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
        tenant: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Page,
    },
    label: 'Page Reference Link',
  },
};

// Reference link to another collection
export const ReferenceToOtherCollection: Story = {
  args: {
    type: 'reference',
    reference: {
      relationTo: 'pages',
      value: {
        id: '2',
        type: 'pastoral-announcements',
        title: 'Example Service',
        slug: 'example-service',
        period: {
          start: new Date().toISOString(),
          end: new Date().toISOString(),
        },
        tenant: '1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Page,
    },
    label: 'Service Reference Link',
  },
};

// Link with custom className
export const WithCustomClass: Story = {
  args: {
    type: 'custom',
    url: 'https://example.com',
    label: 'Custom Styled Link',
    className: 'text-blue-500 hover:text-blue-700',
  },
};

// Invalid link (should not render)
export const InvalidLink: Story = {
  args: {
    type: 'custom',
    label: 'Invalid Link',
  },
}; 