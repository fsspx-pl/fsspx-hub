import type { Meta, StoryObj } from '@storybook/react';
import { AnnouncementCard } from './index';
import { Page, User, Media, Tenant } from '@/payload-types';
import { defaultAvatar } from '../ArticleInfo/consts';

const meta: Meta<typeof AnnouncementCard> = {
  title: 'Components/AnnouncementCard',
  component: AnnouncementCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const LOREM_TEXT = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.';

const baseTenant: Tenant = {
  id: '1',
  name: 'Kaplica św. Józefa',
  general: {
    domain: 'test.example.com',
    city: 'Warszawa',
    type: 'Kaplica',
    patron: 'św. Józefa',
    coverBackground: {} as Media,
    address: {
      street: 'ul. Testowa 1',
      zipcode: '00-001',
    },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'Jan',
  lastName: 'Kowalski',
  salutation: 'father',
  avatar: defaultAvatar,
  roles: ['user'],
  tenants: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const baseAnnouncement: Partial<Page> = {
  type: 'pastoral-announcements',
  period: {
    start: '2024-01-15T00:00:00.000Z',
    end: '2024-01-21T23:59:59.000Z',
  },
  tenant: baseTenant,
  content: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              text: LOREM_TEXT,
            },
          ],
          version: 1,
        },
      ],
      direction: 'ltr',
      format: 'left',
      indent: 0,
      version: 1,
    },
  },
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: '2024-01-15T00:00:00.000Z',
  _status: 'published',
};

const mockAnnouncement: Page = {
  ...baseAnnouncement,
  id: '1',
  title: 'Ogłoszenia duszpasterskie na niedzielę 15 stycznia 2024',
  author: mockUser,
} as Page;

export const Default: Story = {
  args: {
    announcement: mockAnnouncement,
  },
};

export const WithCurrentBadge: Story = {
  render: () => {
    const currentAnnouncement = {
      ...mockAnnouncement,
      period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      }
    };
    
    return (
      <div className="max-w-md">
        <AnnouncementCard announcement={currentAnnouncement} />
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};