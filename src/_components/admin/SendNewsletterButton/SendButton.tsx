'use client'

import React, { useState, useCallback } from 'react'
import { Button, ConfirmationModal, toast, useModal, useForm } from '@payloadcms/ui'
import classes from './index.module.scss'

const sendNewsletterModalSlug = 'send-newsletter-confirmation'

export const SendButton: React.FC<{ 
  id: string, 
  newsletterSent?: boolean | null, 
  isDraft: boolean, 
  tenantId: string
}> = ({
  id,
  newsletterSent,
  isDraft,
  tenantId
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isNewsletterSent, setIsNewsletterSent] = useState(Boolean(newsletterSent) ?? false)
  const { openModal, closeModal } = useModal()
  const [modalMessage, setModalMessage] = useState('Are you sure you want to send this newsletter? This action cannot be undone.')
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null)
  const { getData } = useForm()

  const handleSendNewsletter = async () => {
    if (isLoading) return
    
    const formData = getData()
    const skipCalendar = Boolean((formData?.newsletter as any)?.skipCalendar)
    
    setIsLoading(true)
    const toastId = toast.loading('Sending newsletter...')
    try {
      const response = await fetch(`/api/announcements/${id}/send-newsletter?skipCalendar=${skipCalendar}`, {
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
      toast.dismiss(toastId)
    }
  }

  const fetchSubscriberCount = useCallback(async (tenantId: string) => {
    const response = await fetch(`/api/newsletter-group/${tenantId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch subscriber count');
    }
    return response.json();
  }, []);

  const openConfirmModal = useCallback(async () => {
    setIsLoading(true)
    try {
      const newsletterGroup = await fetchSubscriberCount(tenantId);
      
      const count = newsletterGroup.subscribersCount;
      setSubscriberCount(count);
      
      if (count === 0) {
        const message = 'There are no confirmed subscribers for this tenant. The newsletter cannot be sent.';
        setModalMessage(message);
      } else {
        const subscriberText = count === 1 ? 'subscriber' : 'subscribers';
        const message = `The newsletter will be sent to ${count} ${subscriberText}. This action cannot be undone.`;
        setModalMessage(message);
      }
      
      openModal(sendNewsletterModalSlug)
    } catch (error) {
      toast.error('Failed to fetch subscriber count. Please try again later.');
    } finally {
      setIsLoading(false)
    }
  }, [openModal, tenantId, fetchSubscriberCount])

  const disabled = isLoading || isNewsletterSent

  return (
    <>
      
      <Button 
        className={classes.button} 
        buttonStyle='secondary'
        onClick={openConfirmModal}
        disabled={disabled}
      >
        {isLoading 
          ? 'Loading...' 
          : isNewsletterSent 
            ? 'Newsletter already sent' 
            : 'Send Newsletter'
        }
      </Button>

      <ConfirmationModal
        onConfirm={subscriberCount === 0 ? () => closeModal(sendNewsletterModalSlug) : handleSendNewsletter}
        confirmLabel={subscriberCount === 0 ? 'Close' : undefined}
        heading="Send Newsletter"
        body={modalMessage}
        modalSlug={sendNewsletterModalSlug}
      />
    </>
  )
} 