'use client'

import { Feast } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import { addDays, isSameDay, subDays, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  loadedServiceMonths: Set<string>
  isLoadingServices: boolean
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
  tenantId: string;
}> = ({ children, initialFeasts, initialDate, tenantId }) => {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate))
  const [feasts, setFeasts] = useState<FeastWithMasses[]>(initialFeasts)
  const [selectedDay, setSelectedDay] = useState<FeastWithMasses | undefined>(
    selectTodayOrFirstFeast(initialFeasts, initialDate)
  )
  const [viewMode, setViewMode] = useState<ViewMode>('weekly')
  
  // Initialize loaded months based on initial feasts that have masses
  const getInitialLoadedMonths = () => {
    const monthsWithMasses = new Set<string>()
    initialFeasts.forEach(feast => {
      if (feast.masses.length > 0) {
        const monthKey = `${feast.date.getFullYear()}-${(feast.date.getMonth() + 1).toString().padStart(2, '0')}`
        monthsWithMasses.add(monthKey)
      }
    })
    return monthsWithMasses
  }

  const [loadedServiceMonths, setLoadedServiceMonths] = useState<Set<string>>(getInitialLoadedMonths())
  const [isLoadingServices, setIsLoadingServices] = useState(false)

  const loadServicesForMonth = useCallback(async (date: Date) => {
    if (!tenantId) return
    
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    if (loadedServiceMonths.has(monthKey)) return

    setIsLoadingServices(true)
    try {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      
      const response = await fetch(
        `/api/services?tenant=${tenantId}&start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`
      )
      
      if (response.ok) {
        const newServices: ServiceType[] = await response.json()
        
        // Merge new services with existing feasts
        setFeasts(currentFeasts => 
          currentFeasts.map(feast => {
            const additionalMasses = newServices.filter(service => 
              isSameDay(new Date(service.date), feast.date) &&
              !feast.masses.some(existing => existing.id === service.id)
            )
            
            return additionalMasses.length > 0 
              ? { ...feast, masses: [...feast.masses, ...additionalMasses] }
              : feast
          })
        )
        
        setLoadedServiceMonths(prev => new Set([...prev, monthKey]))
      }
    } catch (error) {
      console.error('Failed to load services for month:', error)
    } finally {
      setIsLoadingServices(false)
    }
  }, [tenantId, loadedServiceMonths])

  const handlePrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = viewMode === 'weekly' ? subDays(prev, 7) : subMonths(prev, 1)
      loadServicesForMonth(newDate)
      return newDate
    })
    setSelectedDay(undefined)
  }, [loadServicesForMonth, viewMode])

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = viewMode === 'weekly' ? addDays(prev, 7) : addMonths(prev, 1)
      loadServicesForMonth(newDate)
      return newDate
    })
    setSelectedDay(undefined)
  }, [loadServicesForMonth, viewMode])

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
    loadedServiceMonths,
    isLoadingServices,
  }

  return (
    <FeastDataContext.Provider value={contextValue}>
      {children}
    </FeastDataContext.Provider>
  )
}

export const useFeastData = () => {
  const context = useContext(FeastDataContext)
  if (context === undefined) {
    throw new Error('useFeastData must be used within a FeastDataProvider')
  }
  return context
}