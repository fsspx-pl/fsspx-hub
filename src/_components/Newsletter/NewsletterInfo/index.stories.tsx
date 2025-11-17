import type { Meta, StoryObj } from '@storybook/react';
import { NewsletterInfo } from './index';

const meta: Meta<typeof NewsletterInfo> = {
  title: 'Newsletter/Info',
  component: NewsletterInfo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'info'],
      description: 'Visual variant of the info component',
    },
    title: {
      control: 'text',
      description: 'Optional title displayed above the message',
    },
    message: {
      control: 'text',
      description: 'Main message text',
    },
    topicName: {
      control: 'text',
      description: 'Name of the subscription topic',
    },
    email: {
      control: 'text',
      description: 'Email address of the subscriber',
    },
    subdomain: {
      control: 'text',
      description: 'Subdomain of the tenant',
    },
    locale: {
      control: 'select',
      options: ['pl', 'en'],
      description: 'Language locale',
    },
    showBackButton: {
      control: 'boolean',
      description: 'Whether to show the back button',
    },
    description: {
      control: 'text',
      description: 'Optional description text displayed below the message',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Subskrypcja potwierdzona!',
    message: 'Dziękujemy! Twoja subskrypcja ogłoszeń duszpasterskich została potwierdzona. Będziesz otrzymywać ogłoszenia duszpasterskie na swój adres email.',
    topicName: 'poznan',
    email: 'user@example.com',
    subdomain: 'poznan',
    locale: 'pl',
  },
};

export const SuccessWithTopic: Story = {
  args: {
    variant: 'success',
    title: 'Subscription Confirmed!',
    message: 'Thank you! Your subscription to pastoral announcements has been confirmed. You will receive pastoral announcements to your email address.',
    topicName: 'warszawa-centralna',
    email: 'subscriber@example.com',
    subdomain: 'warszawa',
    locale: 'en',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    message: 'Ustawienia newslettera nie są skonfigurowane dla tej lokalizacji.',
    subdomain: 'poznan',
    locale: 'pl',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Już jesteś zapisany',
    message: 'Ten adres email jest już zapisany do subskrypcji ogłoszeń duszpasterskich z tej kaplicy. Będziesz otrzymywać ogłoszenia duszpasterskie na swój adres email.',
    topicName: 'krakow',
    email: 'existing@example.com',
    subdomain: 'krakow',
    locale: 'pl',
  },
};

export const UnsubscribeSuccess: Story = {
  args: {
    variant: 'success',
    message: 'Zostałeś wypisany z subskrypcji ogłoszeń duszpasterskich.',
    topicName: 'gdansk',
    email: 'unsubscribed@example.com',
    subdomain: 'gdansk',
    locale: 'pl',
  },
};

export const WithoutBackButton: Story = {
  args: {
    variant: 'success',
    title: 'Subskrypcja potwierdzona!',
    message: 'Dziękujemy! Twoja subskrypcja ogłoszeń duszpasterskich została potwierdzona.',
    topicName: 'poznan',
    email: 'user@example.com',
    subdomain: 'poznan',
    locale: 'pl',
    showBackButton: false,
  },
};

export const WithoutTopicInfo: Story = {
  args: {
    variant: 'success',
    title: 'Subskrypcja potwierdzona!',
    message: 'Dziękujemy! Twoja subskrypcja ogłoszeń duszpasterskich została potwierdzona.',
    subdomain: 'poznan',
    locale: 'pl',
  },
};

