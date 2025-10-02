'use client'

import { useCallback } from 'react'
import { isBefore, isEqual } from 'date-fns'
import { FeastWithMasses } from '../index'

/**
 * Handle past day detection and styling
 */
export const usePastDayDetection = (
  feasts: FeastWithMasses[],
  now: Date | null,
  selectedDay: FeastWithMasses | undefined
) => {
  const getDayProps = useCallback((day: FeastWithMasses, index: number, visibleDays: FeastWithMasses[]) => {
    if (!now) return { isPastDay: false, showWithOpacity: false, hasMoreLeft: false, hasMoreRight: false }
    
    const isPastDay = isBefore(day.date, now)
    const isCurrentDaySelected = isEqual(day.date, selectedDay?.date ?? '')
    const showWithOpacity = isPastDay && !isCurrentDaySelected
    const isFirstInWindow = index === 0
    const isLastInWindow = index === visibleDays.length - 1
    const hasMoreLeft = isFirstInWindow && index > 0
    const hasMoreRight = isLastInWindow && index < feasts.length - 1

    return {
      isPastDay,
      showWithOpacity,
      hasMoreLeft,
      hasMoreRight
    }
  }, [now, selectedDay, feasts])

  return { getDayProps }
}
