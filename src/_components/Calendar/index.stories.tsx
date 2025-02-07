import type { Meta, StoryObj } from '@storybook/react'
import { Calendar } from './index'
import { addDays, setHours } from 'date-fns'
import { Mass as MassType } from '@/payload-types'
import { toVestmentColor } from '@/app/(app)/[domain]/getFeasts'
import { FeastDataProvider } from './context/FeastDataContext' // Import FeastDataProvider

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Calendar>

const baseDate = new Date(2024, 0, 10)
const mockFeasts = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(baseDate, i)
    return ({
        id: `feast-${i}`,
        date,
        title: i === 3 ? 'Święto Objawienia Pańskiego' : 'Feria',
        rank: i === 3 ? 1 : 4,
        colors: i === 3 ? [toVestmentColor('w')] : [],
        masses: [
          {
            id: '1',
            time: setHours(date, 7).toISOString(),
            type: 'sung' as MassType['type'],
            createdAt: '',
            updatedAt: '',
            tenant: ''
          },
          {
            id: '2',
            time: setHours(date, 18).toISOString(),
            type: 'read' as MassType['type'],
            createdAt: '',
            updatedAt: '',
            tenant: ''
          }
        ]
      })
})

export const Default: Story = {
  render: () => ( // Use render instead of args to wrap Calendar
    <FeastDataProvider initialFeasts={mockFeasts}>
      <Calendar />
    </FeastDataProvider>
  ),
}