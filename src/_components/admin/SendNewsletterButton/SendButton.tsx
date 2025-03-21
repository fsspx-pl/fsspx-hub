'use client'

import React, { useState } from 'react'
import { Button, toast } from '@payloadcms/ui'
import classes from './index.module.scss'
import { Page } from '@/payload-types'

export const SendButton: React.FC<{ page: Page }> = ({
  page
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isNewsletterSent, setIsNewsletterSent] = useState(Boolean(page?.campaignId) ?? false)

  const handleSendNewsletter = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    toast.loading('Sending newsletter...')
    try {
      const response = await fetch(`/api/pages/${page.id}/send-newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send newsletter');
      }
      
      await response.json();

      toast.success('Newsletter sent successfully!');
      setIsNewsletterSent(true)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to send newsletter: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      className={classes.button} 
      buttonStyle='secondary'
      onClick={() => {
        handleSendNewsletter()
      }}
      disabled={isLoading || isNewsletterSent}
    >
      {isLoading ? 'Sending...' : isNewsletterSent ? 'Newsletter already sent' : 'Send Newsletter'}
    </Button>
  )
} 