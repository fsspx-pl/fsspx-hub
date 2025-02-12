'use client'

import { Feast } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import { addDays, isSameDay, subDays } from 'date-fns'
import React, { createContext, useContext, useState } from 'react'

type FeastWithMasses = Feast & { masses: ServiceType[] }

type FeastDataContextType = {
  currentDate: Date
  feasts: FeastWithMasses[]
  selectedDay: FeastWithMasses | undefined
  handlePrevious: () => void
  handleNext: () => void
  handleDateSelect: (date: Date) => void
}

const FeastDataContext = createContext<FeastDataContextType | undefined>(undefined)

const selectTodayOrFirstFeast = (feasts: FeastWithMasses[]) => {
  const now = new Date()
  const todayFeast = feasts.find((feast) => isSameDay(now, feast.date))
  return todayFeast ?? feasts[0]
}

export const FeastDataProvider: React.FC<{ children: React.ReactNode, initialFeasts: FeastWithMasses[] }> = ({ children, initialFeasts }) => {
  const now = new Date()
  const [currentDate, setCurrentDate] = useState(now)
  const [feasts] = useState<FeastWithMasses[]>(initialFeasts)
  const [selectedDay, setSelectedDay] = useState<FeastWithMasses | undefined>(selectTodayOrFirstFeast(initialFeasts))

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
    handlePrevious,
    handleNext,
    handleDateSelect,
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