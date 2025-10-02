'use client'

import { useEffect, useState, useCallback } from 'react'
import { isEqual } from 'date-fns'
import { FeastWithMasses } from '../index'

/**
 * Handle current date logic and today selection
 */
export const useCurrentDate = (
  feasts: FeastWithMasses[], 
  selectedDay: FeastWithMasses | undefined,
  handleDateSelect: (date: Date) => void
) => {
  const [isClient, setIsClient] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setIsClient(true)
    setNow(new Date())
  }, [])

  useEffect(() => {
    if (selectedDay || !isClient || !now) return
    
    const todayFeast = feasts.find(feast => isEqual(feast.date, now))
    if (!todayFeast) return
    
    handleDateSelect(todayFeast.date)
  }, [selectedDay, feasts, handleDateSelect, isClient, now])

  return {
    isClient,
    now,
    selectToday: useCallback(() => {
      if (!now) return
      const todayFeast = feasts.find(feast => isEqual(feast.date, now))
      if (todayFeast) handleDateSelect(todayFeast.date)
    }, [now, feasts, handleDateSelect])
  }
}
