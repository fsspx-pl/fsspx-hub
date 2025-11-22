import type { Meta, StoryObj } from '@storybook/react';
import { EventDetails } from './index';
import { Event, Tenant, Media } from '@/payload-types';

const meta: Meta<typeof EventDetails> = {
  title: 'Components/EventDetails',
  component: EventDetails,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventDetails>;

const mockEvent: Event = {
  id: '1',
  title: 'Wizyta Duszpasterska',
  description: 'Zapraszamy na wizytę duszpasterską w naszych domach.',
  slug: 'wizyta-duszpasterska-2025-abc123',
  startDate: '2025-12-15T10:00:00.000Z',
  endDate: '2025-12-15T12:00:00.000Z',
  requiresOptIn: true,
  requiresTurnstile: true,
  tenant: 'tenant-1',
  form: 'form-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTenant: Tenant = {
  id: 'tenant-1',
  name: 'Poznań',
  domain: 'poznan.fsspx.pl',
  city: 'Poznań',
  type: 'Kaplica',
  patron: 'św. Jana Chrzciciela',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    event: mockEvent,
    tenant: mockTenant,
  },
};

export const WithHeroImage: Story = {
  args: {
    event: {
      ...mockEvent,
      heroImage: {
        id: 'media-1',
        url: 'https://via.placeholder.com/800x400',
        alt: 'Event hero image',
      } as Media,
    },
    tenant: mockTenant,
  },
};

export const WithContent: Story = {
  args: {
    event: {
      ...mockEvent,
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Szczegółowy opis wydarzenia z treścią formatowaną.',
                },
              ],
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    tenant: mockTenant,
  },
};

