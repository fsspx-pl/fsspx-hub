'use client'

import React, { useState, useCallback } from 'react'
import { Button, toast } from '@payloadcms/ui'
import classes from './index.module.scss'

export const PrintPageButton: React.FC<{ 
  pageId: string
  domain: string
}> = ({
  pageId,
  domain
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handlePrintPage = useCallback(async () => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      // Use relative path since we're already on the tenant's subdomain
      // The middleware will handle routing based on the current hostname
      const printUrl = `/ogloszenia/print/${pageId}`
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/46f8c944-18d0-4cd8-805e-7c6ed513f481',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PrintPageButton.tsx:22',message:'Print URL generated',data:{printUrl,pageId,domain,currentHost:window.location.hostname,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Open in new tab
      window.open(printUrl, '_blank', 'noopener,noreferrer')
      
      toast.success('Print page opened in new tab')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Failed to open print page: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [pageId, domain, isLoading])

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