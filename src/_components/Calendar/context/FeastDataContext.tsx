'use client'

import { Feast } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import { addDays, isSameDay, subDays } from 'date-fns'
import React, { createContext, useContext, useState } from 'react'

type FeastWithMasses = Feast & { masses: ServiceType[] }

type ViewMode = 'weekly' | 'monthly'

type FeastDataContextType = {
  currentDate: Date
  feasts: FeastWithMasses[]
  selectedDay: FeastWithMasses | undefined
  viewMode: ViewMode
  handlePrevious: () => void
  handleNext: () => void
  handleDateSelect: (date: Date) => void
  setViewMode: (mode: ViewMode) => void
}

const FeastDataContext = createContext<FeastDataContextType | undefined>(undefined)

const selectTodayOrFirstFeast = (feasts: FeastWithMasses[], initialDate: string) => {
  const now = new Date(initialDate)
  // Try to find the current day in the feasts
  const todayFeast = feasts.find((feast) => isSameDay(now, feast.date))
  
  // If we found it, return it
  if (todayFeast) return todayFeast
  
  // If we didn't find today, try to find the closest future date
  const futureDates = feasts.filter(feast => feast.date >= now)
  if (futureDates.length > 0) {
    return futureDates[0] // Return the closest future date
  }
  
  // If no future dates, return the last feast (most recent past date)
  return feasts[feasts.length - 1] ?? feasts[0]
}

export const FeastDataProvider: React.FC<{
  children: React.ReactNode;
  initialFeasts: FeastWithMasses[];
  initialDate: string;
}> = ({ children, initialFeasts, initialDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate))
  const [feasts] = useState<FeastWithMasses[]>(initialFeasts)
  const [selectedDay, setSelectedDay] = useState<FeastWithMasses | undefined>(
    selectTodayOrFirstFeast(initialFeasts, initialDate)
  )
  const [viewMode, setViewMode] = useState<ViewMode>('weekly')

  const handlePrevious = () => {
    setCurrentDate((prev) => subDays(prev, 1))
    setSelectedDay(undefined)
  }

  const handleNext = () => {
    setCurrentDate((prev) => addDays(prev, 1))
    setSelectedDay(undefined)
  }

  const handleDateSelect = (date: Date) => {
    const selected = feasts.find(feast => isSameDay(feast.date, date))
    setSelectedDay(selected)
  }

  const contextValue = {
    currentDate,
    feasts,
    selectedDay,
    viewMode,
    handlePrevious,
    handleNext,
    handleDateSelect,
    setViewMode,
  }

  return (
    <FeastDataContext.Provider value={contextValue}>
      {children}
    </FeastDataContext.Provider>
  )
}

export const useFeastData = () => {
  const context = useContext(FeastDataContext)
  if (!context) {
    throw new Error('useFeastData must be used within a FeastDataProvider')
  }
  return context
}