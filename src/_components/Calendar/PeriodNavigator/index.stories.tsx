import type { Meta, StoryObj } from '@storybook/react'
import { PeriodNavigator } from './index'
import { useState } from 'react'

const meta: Meta<typeof PeriodNavigator> = {
  title: 'Components/Calendar/PeriodNavigator',
  component: PeriodNavigator,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    viewMode: {
      control: { type: 'radio' },
      options: ['weekly', 'monthly'],
    },
    onDateChange: { action: 'date changed' },
    onToggleView: { action: 'view toggled' },
  },
}

export default meta
type Story = StoryObj<typeof PeriodNavigator>

const PeriodNavigatorWithState = ({ viewMode: initialViewMode, ...args }: { viewMode: 'weekly' | 'monthly' }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState(initialViewMode)

  return (
    <div className="w-full sm:w-[600px] md:w-[800px] lg:w-[1000px]">
      <PeriodNavigator
        {...args}
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onToggleView={() => setViewMode(viewMode === 'weekly' ? 'monthly' : 'weekly')}
      />
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: '#f3f4f6', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        Current Date: {currentDate.toLocaleDateString('pl-PL')}<br/>
        View Mode: {viewMode}
      </div>
    </div>
  )
}

export const WeeklyMode: Story = {
  render: (args) => <PeriodNavigatorWithState {...args} viewMode="weekly" />,
}

export const MonthlyMode: Story = {
  render: (args) => <PeriodNavigatorWithState {...args} viewMode="monthly" />,
}