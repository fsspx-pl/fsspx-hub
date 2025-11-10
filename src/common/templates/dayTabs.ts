/**
 * Day tab names and configuration for feast templates.
 * Maps day numbers (0=Sunday, 1=Monday, ..., 6=Saturday) to day tab names.
 */

export type DayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export const DAY_TAB_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export const DAY_TABS_CONFIG = [
  { name: 'monday', label: { pl: 'Poniedziałek', en: 'Monday' }, dayNumber: 1 },
  { name: 'tuesday', label: { pl: 'Wtorek', en: 'Tuesday' }, dayNumber: 2 },
  { name: 'wednesday', label: { pl: 'Środa', en: 'Wednesday' }, dayNumber: 3 },
  { name: 'thursday', label: { pl: 'Czwartek', en: 'Thursday' }, dayNumber: 4 },
  { name: 'friday', label: { pl: 'Piątek', en: 'Friday' }, dayNumber: 5 },
  { name: 'saturday', label: { pl: 'Sobota', en: 'Saturday' }, dayNumber: 6 },
  { name: 'sunday', label: { pl: 'Niedziela', en: 'Sunday' }, dayNumber: 0 },
] as const

/**
 * Maps date-fns getDay() output (0=Sunday, 1=Monday, ..., 6=Saturday) to day tab names.
 */
export const getDayTabName = (dayNumber: number): DayName => {
  const dayMap: Record<number, DayName> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  }
  return dayMap[dayNumber] || 'sunday'
}

