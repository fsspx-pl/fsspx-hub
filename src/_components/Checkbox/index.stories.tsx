import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from './index';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        label="Akceptuję regulamin"
      />
    );
  },
};


