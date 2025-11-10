import { getDay, parseISO } from 'date-fns'
import { FeastTemplate } from '@/payload-types'
import { DayName, getDayTabName } from './dayTabs'

const asDate = (d?: string | Date | null): Date | undefined => {
  if (!d) return undefined
  if (d instanceof Date) return d
  try {
    return parseISO(d)
  } catch {
    return undefined
  }
}

const hasServicesForDay = (template: FeastTemplate, dayTab: DayName): boolean => {
  const dayData = template?.[dayTab]
  return Array.isArray(dayData?.services) && dayData.services.length > 0
}

const spanLength = (start?: Date, end?: Date): number => {
  if (!start || !end) return Number.POSITIVE_INFINITY
  return end.getTime() - start.getTime()
}

export function selectTemplateForDate(
  templates: FeastTemplate[],
  date: Date
): FeastTemplate | undefined {
  const day = getDay(date) // 0..6, Sun=0
  const dayTab = getDayTabName(day)

  const candidates = templates.filter((t) => hasServicesForDay(t, dayTab))
  if (!candidates.length) return undefined

  const periodMatches: Array<{ t: FeastTemplate; len: number }> = []
  for (const t of candidates) {
    const start = asDate(t.periodStart as any)
    const end = asDate(t.periodEnd as any)
    if (start && end) {
      if (date >= start && date <= end) {
        periodMatches.push({ t, len: spanLength(start, end) })
      }
    }
  }

  if (periodMatches.length) {
    periodMatches.sort((a, b) => a.len - b.len)
    return periodMatches[0].t
  }

  // fallback to explicit generic
  return candidates.find((t: any) => Boolean((t as any).isGeneric))
}

export default selectTemplateForDate


