import type { Meta, StoryObj } from '@storybook/react';
import { EventSignupForm } from './index';
import { Event, Form } from '@/payload-types';

const meta: Meta<typeof EventSignupForm> = {
  title: 'Components/EventSignupForm',
  component: EventSignupForm,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventSignupForm>;

const mockEvent: Event = {
  id: '1',
  title: 'Wizyta Duszpasterska',
  slug: 'wizyta-duszpasterska-2025-abc123',
  startDate: '2025-12-15T10:00:00.000Z',
  endDate: '2025-12-15T12:00:00.000Z',
  tenant: 'tenant-1',
  form: 'form-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockForm: Form = {
  id: 'form-1',
  title: 'Formularz zapisu',
  fields: [
    {
      id: 'field-1',
      blockType: 'text',
      name: 'familyName',
      label: 'Nazwisko rodziny',
      required: true,
    },
    {
      id: 'field-2',
      blockType: 'email',
      name: 'email',
      label: 'Email',
      required: true,
    },
    {
      id: 'field-3',
      blockType: 'date',
      name: 'preferredDate',
      label: 'Preferowana data',
      required: true,
    },
    {
      id: 'field-4',
      blockType: 'textarea',
      name: 'familyMembers',
      label: 'Członkowie rodziny',
      required: false,
    },
  ],
  submitButtonLabel: 'Wyślij',
  confirmationType: 'message',
  confirmationMessage: 'Dziękujemy za zgłoszenie!',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    event: mockEvent,
    form: mockForm,
    locale: 'pl',
  },
};

export const English: Story = {
  args: {
    event: mockEvent,
    form: mockForm,
    locale: 'en',
  },
};

