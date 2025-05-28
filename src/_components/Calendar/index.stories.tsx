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
        desktop: {
          name: 'Desktop (768px)',
          styles: {
            width: '768px',
            height: '600px',
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
    const isSunday = date.getDay() === 0
    return ({
      id: `feast-${i}`,
      date,
      title: isSpecialDay ? 'Święto Objawienia Pańskiego' : isSunday ? 'Niedziela' : 'Feria',
      rank: isSpecialDay ? 1 : isSunday ? 2 : 4,
      color: isSpecialDay ? VestmentColor.WHITE : isSunday ? VestmentColor.GREEN : VestmentColor.GREEN,
      masses: [
        {
          id: `${i}-1`,
          category: 'mass',
          massType: 'sung' as ServiceType['massType'],
          date: date.toISOString(),
          time: setHours(date, 7).toISOString(),
          type: 'sung' as ServiceType['massType'],
          createdAt: '',
          updatedAt: '',
          tenant: ''
        },
        {
          id: `${i}-2`,
          category: 'mass',
          date: date.toISOString(),
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
const start = subDays(today, 10)
const mockFeasts = createMockFeasts(60, start) // Extended range for month view

export const WeeklyView: Story = {
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

export const MonthlyView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
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
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <Calendar />
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: '#f3f4f6', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            💡 <strong>Instrukcje:</strong><br/>
            • Kliknij na nazwę miesiąca, aby przełączyć między widokami<br/>
            • W widoku miesięcznym kliknij na dzień, aby przejść do widoku tygodniowego<br/>
            • Szczegóły nabożeństw widoczne są tylko w widoku tygodniowym
          </div>
        </div>
      </FeastDataProvider>
    );
  },
}

// Default export maintains backward compatibility
export const Default: Story = WeeklyView