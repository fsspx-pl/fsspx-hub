import type { Meta, StoryObj } from '@storybook/react';
import { NewsletterStatusPage } from './index';

const meta: Meta<typeof NewsletterStatusPage> = {
  title: 'Newsletter/StatusPage',
  component: NewsletterStatusPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'warning', 'info'],
      description: 'Visual variant of the status page',
    },
    title: {
      control: 'text',
      description: 'Optional title displayed above the message',
    },
    message: {
      control: 'text',
      description: 'Main message text',
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
    chapelInfo: {
      control: 'text',
      description: 'Chapel information (e.g., "Kaplica św. Jana Chrzciciela - Poznań")',
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
    subdomain: 'poznan',
    locale: 'pl',
  },
};

export const UnsubscribeSuccess: Story = {
  args: {
    variant: 'success',
    message: 'Zostałeś wypisany z subskrypcji ogłoszeń duszpasterskich.',
    chapelInfo: 'Kaplica św. Jana Chrzciciela - Gdańsk',
    subdomain: 'gdansk',
    locale: 'pl',
  },
};

