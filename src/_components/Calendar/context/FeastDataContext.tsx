'use client'

import { Feast } from '@/feast'
import { Service as ServiceType } from '@/payload-types'
import { addDays, isSameDay, subDays, startOfMonth, endOfMonth, addMonths, subMonths, startOfYear, endOfYear } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import React, { createContext, useContext, useState, useCallback } from 'react'

const POLISH_TIMEZONE = 'Europe/Warsaw'

/**
 * Extracts the date portion (yyyy-MM-dd) in Polish timezone for comparison.
 * This ensures midnight (00:00) services are matched to the correct day.
 */
const toPolishDateString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatInTimeZone(dateObj, POLISH_TIMEZONE, 'yyyy-MM-dd')
}

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
  
  // Track which years have feasts loaded
  const getInitialLoadedYears = () => {
    const years = new Set<number>()
    initialFeasts.forEach(feast => {
      years.add(feast.date.getFullYear())
    })
    return years
  }
  const [loadedFeastYears, setLoadedFeastYears] = useState<Set<number>>(getInitialLoadedYears())

  const loadFeastsForYear = useCallback(async (year: number) => {
    if (loadedFeastYears.has(year)) return

    try {
      const yearStart = startOfYear(new Date(year, 0, 1))
      const yearEnd = endOfYear(new Date(year, 11, 31))
      
      const response = await fetch(
        `/api/feasts-range?start=${yearStart.toISOString()}&end=${yearEnd.toISOString()}`
      )
      
      if (response.ok) {
        const newFeasts: Feast[] = await response.json()
        
        // Convert to FeastWithMasses with empty masses array
        const newFeastsWithMasses: FeastWithMasses[] = newFeasts.map(feast => ({
          ...feast,
          masses: []
        }))
        
        // Merge with existing feasts, avoiding duplicates
        setFeasts(currentFeasts => {
          const existingDateStrings = new Set(
            currentFeasts.map(f => toPolishDateString(f.date))
          )
          
          const uniqueNewFeasts = newFeastsWithMasses.filter(
            f => !existingDateStrings.has(toPolishDateString(f.date))
          )
          
          return [...currentFeasts, ...uniqueNewFeasts].sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          )
        })
        
        setLoadedFeastYears(prev => new Set([...prev, year]))
      }
    } catch (error) {
      console.error('Failed to load feasts for year:', error)
    }
  }, [loadedFeastYears])

  const loadServicesForMonth = useCallback(async (date: Date) => {
    if (!tenantId) return
    
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    if (loadedServiceMonths.has(monthKey)) return

    setIsLoadingServices(true)
    try {
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      
      const response = await fetch(
        `/api/services-range?tenant=${tenantId}&start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`
      )
      
      if (response.ok) {
        const newServices: ServiceType[] = await response.json()
        
        // Merge new services with existing feasts
        // Use Polish timezone date strings for comparison to handle midnight correctly
        setFeasts(currentFeasts => 
          currentFeasts.map(feast => {
            const feastDateString = toPolishDateString(feast.date)
            const additionalMasses = newServices.filter(service => 
              toPolishDateString(service.date) === feastDateString &&
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
      const newYear = newDate.getFullYear()
      // Load feasts for the year if not already loaded
      if (!loadedFeastYears.has(newYear)) {
        loadFeastsForYear(newYear)
      }
      loadServicesForMonth(newDate)
      return newDate
    })
    setSelectedDay(undefined)
  }, [loadServicesForMonth, loadFeastsForYear, loadedFeastYears, viewMode])

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = viewMode === 'weekly' ? addDays(prev, 7) : addMonths(prev, 1)
      const newYear = newDate.getFullYear()
      // Load feasts for the year if not already loaded
      if (!loadedFeastYears.has(newYear)) {
        loadFeastsForYear(newYear)
      }
      loadServicesForMonth(newDate)
      return newDate
    })
    setSelectedDay(undefined)
  }, [loadServicesForMonth, loadFeastsForYear, loadedFeastYears, viewMode])

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