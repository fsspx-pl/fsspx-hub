'use client'

import React, { useState, useCallback } from 'react'
import { Button, toast } from '@payloadcms/ui'
import classes from './index.module.scss'

export const PrintPageButton: React.FC<{ 
  pageId: string
}> = ({
  pageId
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrintPage = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const printUrl = `/ogloszenia/print/${pageId}`
      
      window.open(printUrl, '_blank', 'noopener,noreferrer')
      
      toast.success('Print page opened in new tab')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to open print page: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [pageId, isLoading])

  const disabled = isLoading

  return (
    <Button 
      className={classes.button} 
      buttonStyle='secondary'
      onClick={handlePrintPage}
      disabled={false}
    >
      {isLoading 
        ? 'Opening...' 
        : '🖨️ Open Print Version'
      }
    </Button>
  )
} 