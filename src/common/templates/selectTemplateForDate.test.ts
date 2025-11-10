import { selectTemplateForDate, DayName } from '@/common/templates/selectTemplateForDate'
import { FeastTemplate } from '@/payload-types'

const mass = { time: '09:00', category: 'mass' as const, massType: 'read' as const }

const DAY_NAMES: DayName[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const createDayTabs = (services = [mass]) => {
  return DAY_NAMES.reduce((acc, day) => {
    acc[day] = { services }
    return acc
  }, {} as Record<string, { services: typeof services }>)
}

const tmpl = (overrides: Partial<FeastTemplate> = {}): FeastTemplate => ({
  id: 't',
  tenant: 'x' as any,
  title: 'T',
  isGeneric: false,
  ...createDayTabs(),
  updatedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  ...overrides,
})

describe('selectTemplateForDate', () => {
  it('returns generic template when no period match', () => {
    const date = new Date('2025-03-02T12:00:00Z') // Sunday
    const res = selectTemplateForDate([
      tmpl({ isGeneric: true, sunday: { services: [mass] } }),
    ], date)
    expect(res).toBeTruthy()
    expect(res?.isGeneric).toBe(true)
    expect(res?.periodStart).toBeUndefined()
  })

  it('prefers period-based when date is within range', () => {
    const date = new Date('2025-03-02T12:00:00Z') // Sunday
    const res = selectTemplateForDate([
      tmpl({ isGeneric: true, sunday: { services: [mass] } }),
      tmpl({ periodStart: '2025-03-01', periodEnd: '2025-03-31', sunday: { services: [mass] } }),
    ], date)
    expect(res?.periodStart).toBe('2025-03-01')
    expect(res?.isGeneric).toBeFalsy()
  })

  it('chooses the most specific (shortest span) among multiple period matches', () => {
    const date = new Date('2025-03-15T12:00:00Z') // Saturday
    const res = selectTemplateForDate([
      tmpl({ periodStart: '2025-03-01', periodEnd: '2025-03-31', saturday: { services: [mass] } }),
      tmpl({ periodStart: '2025-03-10', periodEnd: '2025-03-20', saturday: { services: [mass] } }),
    ], date)
    expect(res?.periodStart).toBe('2025-03-10')
  })

  it('respects day tabs - only returns templates with services for that day', () => {
    const date = new Date('2025-03-10T12:00:00Z') // Monday
    const res = selectTemplateForDate([
      tmpl({ 
        isGeneric: true, 
        ...createDayTabs([]), // Clear all days
        sunday: { services: [mass] } // Sunday only
      }),
      tmpl({ 
        isGeneric: true, 
        ...createDayTabs([]), // Clear all days
        monday: { services: [mass] } // Monday only
      }),
    ], date)
    expect(res).toBeTruthy()
    expect(res?.monday?.services).toBeDefined()
    expect(res?.monday?.services?.length).toBeGreaterThan(0)
  })

  it('returns undefined when no template has services for the day', () => {
    const date = new Date('2025-03-10T12:00:00Z') // Monday
    const res = selectTemplateForDate([
      tmpl({ isGeneric: true, monday: { services: [] }, tuesday: { services: [mass] } }), // No Monday services
    ], date)
    expect(res).toBeUndefined()
  })
})


