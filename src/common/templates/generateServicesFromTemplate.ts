import { getDay, setHours, setMinutes, setSeconds, setMilliseconds, parseISO } from 'date-fns'
import { Tenant, Service, FeastTemplate } from '@/payload-types'
import { getDayTabName } from './dayTabs'

type GeneratedService = Pick<
  Service,
  'date' | 'tenant' | 'category' | 'massType' | 'notes'
> & {
  customTitle?: string | null
  synthetic?: true
}

const combineDateAndTime = (targetDate: Date, time: string | Date): string => {
  if (!time) return targetDate.toISOString()

  let hours: number
  let minutes: number

  // If time is a string in "HH:mm" format, parse hours and minutes
  if (typeof time === 'string') {
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/)
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`Invalid time: ${time}. Hours must be 0-23, minutes must be 0-59.`)
      }
    } else {
      // Fallback: try to parse as ISO date string
      const parsedDate = parseISO(time)
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid time string: ${time}. Expected "HH:mm" or ISO date string.`)
      }
      hours = parsedDate.getHours()
      minutes = parsedDate.getMinutes()
    }
  } else if (time instanceof Date) {
    if (isNaN(time.getTime())) {
      throw new Error('Invalid Date object provided for time')
    }
    hours = time.getHours()
    minutes = time.getMinutes()
  } else {
    throw new Error(`Unsupported type for time: ${typeof time}. Expected string or Date.`)
  }

  // Use date-fns to set time components
  const dateWithTime = setMilliseconds(
    setSeconds(setMinutes(setHours(targetDate, hours), minutes), 0),
    0
  )
  return dateWithTime.toISOString()
}

export function generateServicesFromTemplate(
  template: FeastTemplate,
  tenant: Tenant,
  date: Date
): GeneratedService[] {
  const day = getDay(date) // 0..6, Sun=0
  const dayTab = getDayTabName(day)
  const dayData = template?.[dayTab]
  const services = Array.isArray(dayData?.services) ? dayData.services : []
  
  if (!services.length) return []
  
  return services.map((s: any) => {
    const dateISO = combineDateAndTime(date, s.time)
    const base: GeneratedService = {
      date: dateISO,
      tenant: tenant.id,
      category: s.category,
      massType: s.massType,
      notes: s.notes,
      synthetic: true,
    }
    if (s.category === 'other') {
      base.customTitle = s.customTitle
    }
    return base
  })
}

export default generateServicesFromTemplate


