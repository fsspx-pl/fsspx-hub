import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './index';
import { useState } from 'react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="w-64">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter text..."
        />
      </div>
    );
  },
};

