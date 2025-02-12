import { VestmentColor } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import type { Meta, StoryObj } from '@storybook/react'
import { addDays, setHours } from 'date-fns'
import { FeastDataProvider } from './context/FeastDataContext'; // Import FeastDataProvider
import { Calendar, FeastWithMasses } from './index'

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Calendar>

const baseDate = new Date(2024, 0, 21 )
const mockFeasts: FeastWithMasses[]  = Array.from({ length: 8 }, (_, i) => {
    const date = addDays(baseDate, i)
    return ({
        id: `feast-${i}`,
        date,
        title: i === 3 ? 'Święto Objawienia Pańskiego' : 'Feria',
        rank: i === 3 ? 1 : 4,
        color: i === 3 ? VestmentColor.WHITE : VestmentColor.GREEN,
        masses: [
          {
            id: '1',
            time: setHours(date, 7).toISOString(),
            type: 'sung' as ServiceType['type'],
            createdAt: '',
            updatedAt: '',
            tenant: ''
          },
          {
            id: '2',
            time: setHours(date, 18).toISOString(),
            type: 'read' as ServiceType['type'],
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