'use client'

import React, { useState, useCallback } from 'react'
import { Button, toast } from '@payloadcms/ui'
import classes from './index.module.scss'
import { formatInPolishTime } from '@/common/timezone'

export const PrintPageButton: React.FC<{ 
  date: string
}> = ({
  date
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrintPage = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      // Format the date for the URL
      const formattedDate = formatInPolishTime(date, 'dd-MM-yyyy')
      
      const printUrl = `/ogloszenia/${formattedDate}/print`
      
      // Open in new tab
      window.open(printUrl, '_blank', 'noopener,noreferrer')
      
      toast.success('Print page opened in new tab')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to open print page: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [date, isLoading])

  const disabled = isLoading

  return (
    <Button 
      className={classes.button} 
      buttonStyle='secondary'
      onClick={handlePrintPage}
      disabled={disabled}
    >
      {isLoading 
        ? 'Opening...' 
        : '🖨️ Open Print Version'
      }
    </Button>
  )
} 