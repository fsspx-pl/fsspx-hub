import { VestmentColor } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import type { Meta, StoryObj } from '@storybook/react'
import { addDays, setHours, subDays } from 'date-fns'
import { FeastDataProvider } from './context/FeastDataContext'
import { Calendar, FeastWithMasses } from './index'

const meta: Meta<typeof Calendar> = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    viewport: {
      defaultViewport: 'mobile1',
      viewports: {
        mobile1: {
          name: 'Mobile (350px)',
          styles: {
            width: '350px',
            height: '568px',
          },
        },
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Calendar>

const createMockFeasts = (length: number, startDate: Date): FeastWithMasses[] => 
  Array.from({ length }, (_, i) => {
    const date = addDays(startDate, i)
    const isSpecialDay = i === 3 || i === 10 || i === 17 // Special days every week
    return ({
      id: `feast-${i}`,
      date,
      title: isSpecialDay ? 'Święto Objawienia Pańskiego' : 'Feria',
      rank: isSpecialDay ? 1 : 4,
      color: isSpecialDay ? VestmentColor.WHITE : VestmentColor.GREEN,
      masses: [
        {
          id: `${i}-1`,
          category: 'mass',
          massType: 'sung' as ServiceType['massType'],
          time: setHours(date, 7).toISOString(),
          type: 'sung' as ServiceType['massType'],
          createdAt: '',
          updatedAt: '',
          tenant: ''
        },
        {
          id: `${i}-2`,
          category: 'mass',
          massType: 'read' as ServiceType['massType'],
          time: setHours(date, 18).toISOString(),
          type: 'read' as ServiceType['massType'],
          createdAt: '',
          updatedAt: '',
          tenant: ''
        }
      ]
    })
  })

const today = new Date()
const start = subDays(today, 4)
const mockFeasts = createMockFeasts(12, start)

export const Default: Story = {
  render: () => {
    const todayIndex = mockFeasts.findIndex(feast => 
      feast.date.getDate() === today.getDate() && 
      feast.date.getMonth() === today.getMonth()
    );
    const todayFeast = mockFeasts[todayIndex];
    
    return (
      <FeastDataProvider 
        initialFeasts={mockFeasts} 
        initialDate={todayFeast?.date.toISOString() ?? today.toISOString()}
      >
        <Calendar />
      </FeastDataProvider>
    );
  },
}