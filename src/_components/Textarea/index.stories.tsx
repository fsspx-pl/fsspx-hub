import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Textarea } from './index';

const meta: Meta<typeof Textarea> = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="max-w-md">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Wpisz treść…"
          aria-label="Textarea example"
        />
      </div>
    );
  },
};


