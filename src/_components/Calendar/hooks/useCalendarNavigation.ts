'use client'

import { useState, useMemo, useCallback } from 'react'
import { isEqual } from 'date-fns'
import { FeastWithMasses } from '../index'

const WINDOW_SIZE = 7

/**
 * Handle calendar navigation and window management
 */
export const useCalendarNavigation = (
  feasts: FeastWithMasses[],
  selectedDay: FeastWithMasses | undefined
) => {
  const [windowStart, setWindowStart] = useState(() => {
    if (!selectedDay) return 0
    
    const selectedIndex = feasts.findIndex(feast => isEqual(feast.date, selectedDay.date))
    if (selectedIndex === -1) return 0
    
    const idealPosition = 3
    const calculatedStart = Math.max(0, selectedIndex - idealPosition)
    return Math.min(calculatedStart, Math.max(0, feasts.length - WINDOW_SIZE))
  })

  const visibleDays = useMemo(() => {
    return feasts.slice(windowStart, windowStart + WINDOW_SIZE)
  }, [feasts, windowStart])

  const navigateToDate = useCallback((date: Date) => {
    const selectedIndex = feasts.findIndex(feast => isEqual(feast.date, date))
    if (selectedIndex !== -1) {
      const idealPosition = 3
      const calculatedStart = Math.max(0, selectedIndex - idealPosition)
      setWindowStart(Math.min(calculatedStart, Math.max(0, feasts.length - WINDOW_SIZE)))
    }
  }, [feasts])

  return {
    windowStart,
    setWindowStart,
    visibleDays,
    navigateToDate
  }
}
