import type { Meta, StoryObj } from '@storybook/react';
import { RelatedEvents } from './index';
import { Event, Media } from '@/payload-types';

const meta: Meta<typeof RelatedEvents> = {
  title: 'Components/RelatedEvents',
  component: RelatedEvents,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RelatedEvents>;

const mockMedia: Media = {
  id: '1',
  alt: 'Event image',
  url: 'https://via.placeholder.com/800x450',
  filename: 'event.jpg',
  mimeType: 'image/jpeg',
  filesize: 100000,
  width: 800,
  height: 450,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockEventWithImage: Event = {
  id: '1',
  title: 'Rekolekcje Adwentowe - "Czułość w życiu"',
  slug: 'rekolekcje-adwentowe-czulosc-w-zyciu',
  startDate: '2024-12-15T10:00:00.000Z',
  endDate: '2024-12-17T18:00:00.000Z',
  tenant: 'tenant-1',
  form: 'form-1',
  heroImage: mockMedia,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockEventWithoutImage: Event = {
  id: '2',
  title: 'Warsztaty biblijne',
  slug: 'warsztaty-biblijne',
  startDate: '2024-12-20T10:00:00.000Z',
  tenant: 'tenant-1',
  form: 'form-1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockEventLongTitle: Event = {
  id: '3',
  title: 'Bardzo długi tytuł wydarzenia, który może się nie zmieścić w jednej linii i powinien być obcięty',
  slug: 'bardzo-dlugi-tytul',
  startDate: '2024-12-25T10:00:00.000Z',
  tenant: 'tenant-1',
  form: 'form-1',
  heroImage: mockMedia,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const SingleEvent: Story = {
  args: {
    events: [mockEventWithImage],
  },
};

export const MultipleEvents: Story = {
  args: {
    events: [
      mockEventWithImage,
      mockEventWithoutImage,
      mockEventLongTitle,
    ],
  },
};

export const WithMixedImages: Story = {
  args: {
    events: [
      mockEventWithImage,
      mockEventWithoutImage,
      mockEventWithImage,
    ],
  },
};

export const Empty: Story = {
  args: {
    events: [],
  },
};

export const MaxEvents: Story = {
  args: {
    events: [
      mockEventWithImage,
      mockEventWithoutImage,
      mockEventWithImage,
      mockEventWithoutImage,
      mockEventWithImage,
    ],
  },
};

