import { generateServicesFromTemplate } from '@/common/templates/generateServicesFromTemplate'
import { FeastTemplate } from '@/payload-types'
import { nextMonday } from 'date-fns'


const mass = { time: '09:00', category: 'mass' as const, massType: 'read' as const }

describe('generateServicesFromTemplate', () => {
  it('generates services for the specific date with combined time', () => {
    const template: Pick<FeastTemplate, 'monday'> = {
      monday: {
        services: [
          mass,
          { ...mass, time: '10:00', category: 'other', customTitle: 'Rosary' },
        ],
      },
    }
    const tenant: any = { id: 'tenant-1' }
    const date = nextMonday(new Date('2025-03-10T12:00:00.000Z')) // Ensures it's a Monday

    const result = generateServicesFromTemplate(template as FeastTemplate, tenant, date)
    expect(result).toHaveLength(2)
    expect(result[0].date.startsWith('2025-03-17')).toBe(true)
    expect(result[0].tenant).toBe('tenant-1')
    expect(result[0].category).toBe('mass')
    expect(result[1].customTitle).toBe('Rosary')
    expect(result[0].synthetic).toBe(true)
  })
})


