import type { Meta, StoryObj } from '@storybook/react';
import { UnsubscribeForm } from './index';

const meta: Meta<typeof UnsubscribeForm> = {
  title: 'Newsletter/Unsubscribe',
  component: UnsubscribeForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    subscriptionId: {
      control: 'text',
      description: 'Unique subscription ID',
    },
    email: {
      control: 'text',
      description: 'Email address of the subscriber',
    },
    topicName: {
      control: 'text',
      description: 'Name of the topic the subscription is assigned to',
    },
    subdomain: {
      control: 'text',
      description: 'Subdomain of the tenant',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    locale: {
      control: 'select',
      options: ['pl', 'en'],
      description: 'Language locale',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subscriptionId: 'test-subscription-id-123',
    email: 'user@example.com',
    topicName: 'poznan',
    subdomain: 'poznan',
  },
};

export const WithLongTopicName: Story = {
  args: {
    subscriptionId: 'test-subscription-id-456',
    email: 'subscriber@example.com',
    topicName: 'warszawa-centralna',
    subdomain: 'warszawa',
  },
};

export const WithLongEmail: Story = {
  args: {
    subscriptionId: 'test-subscription-id-789',
    email: 'very.long.email.address@example-domain.com',
    topicName: 'krakow',
    subdomain: 'krakow',
  },
};

export const English: Story = {
  args: {
    subscriptionId: 'test-subscription-id-en',
    email: 'user@example.com',
    topicName: 'poznan',
    subdomain: 'poznan',
    locale: 'en',
  },
};
