import type { Meta, StoryObj } from '@storybook/react';
import { NewsletterSignupForm } from './index';

const meta: Meta<typeof NewsletterSignupForm> = {
  title: 'Components/NewsletterSignupForm',
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

export const WithCustomClassName: Story = {
  args: {
    subdomain: 'warszawa',
    className: 'max-w-md',
  },
  parameters: {
    layout: 'padded',
  },
};

export const DifferentSubdomain: Story = {
  args: {
    subdomain: 'krakow',
  },
};

