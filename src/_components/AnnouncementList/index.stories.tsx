import type { Meta, StoryObj } from '@storybook/react';
import { AnnouncementList } from './index';
import { Page, User, Media, Tenant } from '@/payload-types';
import { defaultAvatar } from '../ArticleInfo/consts';

const meta: Meta<typeof AnnouncementList> = {
  title: 'Components/AnnouncementList',
  component: AnnouncementList,
  parameters: {
    layout: 'padded',
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
  domain: 'test.example.com',
  city: 'Warszawa',
  type: 'Kaplica',
  patron: 'św. Józefa',
  coverBackground: {} as Media,
  address: {
    street: 'ul. Testowa 1',
    zipcode: '00-001',
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

const baseAnnouncement: Omit<Page, 'id' | 'title' | 'period' | 'content' | 'createdAt' | 'updatedAt'> = {
  ...{
    type: 'pastoral-announcements',
    author: mockUser,
    tenant: baseTenant,
    _status: 'published',
    attachmentDisplay: {
      displayMode: 'collect-bottom',
      showTopAlert: false,
    },
  }
};

const createMockAnnouncement = (
  id: string,
  title: string,
  date: string,
  content: string = LOREM_TEXT
): Page => ({
  ...baseAnnouncement,
  id,
  title,
  period: {
    start: date,
    end: new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  content: content
    ? {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              version: 1,
              children: [
                {
                  type: 'text',
                  text: content,
                },
              ],
            },
          ],
          direction: 'ltr',
          format: 'left',
          indent: 0,
          version: 1,
        },
      }
    : null,
  createdAt: date,
  updatedAt: date,
});

const mockAnnouncements: Page[] = [
  // January 2024
  createMockAnnouncement(
    '1',
    'Ogłoszenia duszpasterskie na niedzielę 7 stycznia 2024',
    '2024-01-07T00:00:00.000Z'
  ),
  createMockAnnouncement(
    '2',
    'Ogłoszenia duszpasterskie na niedzielę 14 stycznia 2024',
    '2024-01-14T00:00:00.000Z'
  ),
  createMockAnnouncement(
    '3',
    'Ogłoszenia duszpasterskie na niedzielę 21 stycznia 2024',
    '2024-01-21T00:00:00.000Z'
  ),
  createMockAnnouncement(
    '4',
    'Ogłoszenia duszpasterskie na niedzielę 28 stycznia 2024',
    '2024-01-28T00:00:00.000Z'
  ),
  // December 2023
  createMockAnnouncement(
    '5',
    'Ogłoszenia duszpasterskie na niedzielę 3 grudnia 2023',
    '2023-12-03T00:00:00.000Z'
  ),
  createMockAnnouncement(
    '6',
    'Ogłoszenia duszpasterskie na niedzielę 10 grudnia 2023',
    '2023-12-10T00:00:00.000Z'
  ),
  createMockAnnouncement(
    '7',
    'Ogłoszenia duszpasterskie na niedzielę 17 grudnia 2023',
    '2023-12-17T00:00:00.000Z'
  ),
  createMockAnnouncement(
    '8',
    'Ogłoszenia duszpasterskie na niedzielę 24 grudnia 2023',
    '2023-12-24T00:00:00.000Z'
  ),
  createMockAnnouncement(
    '9',
    'Ogłoszenia duszpasterskie na niedzielę 31 grudnia 2023',
    '2023-12-31T00:00:00.000Z'
  ),
];

export const Default: Story = {
  args: {
    announcements: mockAnnouncements,
  },
};

export const SingleMonth: Story = {
  args: {
    announcements: mockAnnouncements.slice(0, 4), // Only January 2024
  },
};

export const EmptyList: Story = {
  args: {
    announcements: [],
  },
};

export const SingleAnnouncement: Story = {
  args: {
    announcements: [mockAnnouncements[0]],
  },
};

export const ManyAnnouncements: Story = {
  args: {
    announcements: [
      ...mockAnnouncements,
      createMockAnnouncement(
        '10',
        'Ogłoszenia duszpasterskie na niedzielę 4 lutego 2024',
        '2024-02-04T00:00:00.000Z'
      ),
      createMockAnnouncement(
        '11',
        'Ogłoszenia duszpasterskie na niedzielę 11 lutego 2024',
        '2024-02-11T00:00:00.000Z'
      ),
      createMockAnnouncement(
        '12',
        'Ogłoszenia duszpasterskie na niedzielę 18 lutego 2024',
        '2024-02-18T00:00:00.000Z'
      ),
    ],
  },
};