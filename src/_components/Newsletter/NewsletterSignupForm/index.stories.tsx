import type { Meta, StoryObj } from '@storybook/react';
import { NewsletterSignupForm } from './index';

const meta: Meta<typeof NewsletterSignupForm> = {
  title: 'Newsletter/Signup',
  component: NewsletterSignupForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    subdomain: {
      control: 'text',
      description: 'Subdomain of the tenant',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    subdomain: 'poznan',
  },
};

