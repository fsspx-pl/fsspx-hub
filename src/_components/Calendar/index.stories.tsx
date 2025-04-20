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

const today = new Date() // April 20th, 2024
// Start 4 days before today to show today in position 5
const startDateForDefault = subDays(today, 4)
const mockFeasts = createMockFeasts(12, startDateForDefault) // 4 past days + today + 7 future days

// For long range, show more past and future days
const startDateForLongRange = subDays(today, 4)
const mockFeastsLongRange = createMockFeasts(25, startDateForLongRange) // 10 past days + today + 14 future days

export const Default: Story = {
  render: () => {
    // Find the feast that corresponds to today and its index
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

export const LongRange: Story = {
  render: () => {
    // Find the feast that corresponds to today
    const todayFeast = mockFeastsLongRange.find(feast => 
      feast.date.getDate() === today.getDate() && 
      feast.date.getMonth() === today.getMonth()
    );
    return (
      <FeastDataProvider 
        initialFeasts={mockFeastsLongRange} 
        initialDate={todayFeast?.date.toISOString() ?? today.toISOString()}
      >
        <Calendar />
      </FeastDataProvider>
    );
  },
}