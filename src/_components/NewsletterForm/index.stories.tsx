import type { Meta, StoryObj } from '@storybook/react';
import { NewsletterForm } from './index';

const meta: Meta<typeof NewsletterForm> = {
  title: 'Components/NewsletterForm',
  component: NewsletterForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['subscribe', 'unsubscribe'],
      description: 'Form mode: subscribe or unsubscribe',
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

export const Subscribe: Story = {
  args: {
    mode: 'subscribe',
    subdomain: 'poznan',
  },
};

export const SubscribeEnglish: Story = {
  args: {
    mode: 'subscribe',
    subdomain: 'poznan',
    locale: 'en',
  },
};

export const Unsubscribe: Story = {
  args: {
    mode: 'unsubscribe',
    subscriptionId: 'test-subscription-id-123',
    email: 'user@example.com',
    topicName: 'poznan',
    subdomain: 'poznan',
  },
};

export const UnsubscribeWithLongTopicName: Story = {
  args: {
    mode: 'unsubscribe',
    subscriptionId: 'test-subscription-id-456',
    email: 'subscriber@example.com',
    topicName: 'warszawa-centralna',
    subdomain: 'warszawa',
  },
};

export const UnsubscribeWithLongEmail: Story = {
  args: {
    mode: 'unsubscribe',
    subscriptionId: 'test-subscription-id-789',
    email: 'very.long.email.address@example-domain.com',
    topicName: 'krakow',
    subdomain: 'krakow',
  },
};

