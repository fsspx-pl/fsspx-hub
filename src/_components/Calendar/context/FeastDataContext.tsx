'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Mass as MassType } from '@/payload-types'
import { addMonths, subMonths, startOfMonth, endOfMonth, isWithinInterval, subDays, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { Feast } from '@/feast'

type FeastWithMasses = Feast & { masses: MassType[] }

type FeastDataContextType = {
  currentDate: Date
  feasts: FeastWithMasses[]
  selectedDay: FeastWithMasses | undefined
  loading: boolean
  error: string | null
  handlePrevious: () => void
  handleNext: () => void
  handleDateSelect: (date: Date) => void
}

const FeastDataContext = createContext<FeastDataContextType | undefined>(undefined)

export const FeastDataProvider: React.FC<{ children: React.ReactNode, initialFeasts: FeastWithMasses[] }> = ({ children, initialFeasts }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [feasts] = useState<FeastWithMasses[]>(initialFeasts)
  const [selectedDay, setSelectedDay] = useState<FeastWithMasses | undefined>(feasts[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePrevious = () => {
    setCurrentDate((prev) => subDays(prev, 1))
    setSelectedDay(undefined)
  }

  const handleNext = () => {
    setCurrentDate((prev) => addDays(prev, 1))
    setSelectedDay(undefined)
  }

  const handleDateSelect = (date: Date) => {
    const selected = feasts.find((feast) => new Date(feast.date).getTime() === date.getTime())
    setSelectedDay(selected)
  }

  const contextValue = {
    currentDate,
    feasts,
    selectedDay,
    loading,
    error,
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