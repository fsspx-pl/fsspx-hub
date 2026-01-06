import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './index';

const meta: Meta<typeof Alert> = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Thank you for subscribing!',
    message:
      'Check your inbox and confirm your subscription by clicking the link in the email message.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'An error occurred',
    message:
      'An error occurred during subscription. Please try again later.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Załączniki',
    message:
      'Ta strona zawiera 3 załączniki.',
  },
};

