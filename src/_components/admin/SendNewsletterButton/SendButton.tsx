'use client'

import React, { useState, useCallback } from 'react'
import { Button, ConfirmationModal, toast, useModal } from '@payloadcms/ui'
import classes from './index.module.scss'

const sendNewsletterModalSlug = 'send-newsletter-confirmation'

export const SendButton: React.FC<{ 
  id: string, 
  campaignId?: string | null, 
  isDraft: boolean, 
  newsletterGroupId: string,
  topicName?: string | null
}> = ({
  id,
  campaignId,
  isDraft,
  newsletterGroupId,
  topicName
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isNewsletterSent, setIsNewsletterSent] = useState(Boolean(campaignId) ?? false)
  const { openModal } = useModal()
  const [modalMessage, setModalMessage] = useState('Are you sure you want to send this newsletter? This action cannot be undone.')

  const handleSendNewsletter = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    const toastId = toast.loading('Sending newsletter...')
    try {
      const response = await fetch(`/api/pages/${id}/send-newsletter`, {
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

  const fetchNewsletterGroup = useCallback(async (groupId: string, topic?: string | null) => {
    const url = topic ? `/api/newsletter-group/${groupId}?topic=${topic}` : `/api/newsletter-group/${groupId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch newsletter group');
    }
    return response.json();
  }, []);

  const openConfirmModal = useCallback(async () => {
    setIsLoading(true)
    try {
      const newsletterGroup = await fetchNewsletterGroup(newsletterGroupId, topicName);
      
      const subscriberCount = newsletterGroup.subscribersCount;
      const subscriberText = subscriberCount === 1 ? 'subscriber' : 'subscribers';
      const message = `The newsletter will be sent to ${subscriberCount} ${subscriberText}. This action cannot be undone.`;
      
      setModalMessage(message);
      openModal(sendNewsletterModalSlug)
    } catch (error) {
      toast.error('Failed to fetch newsletter group information. Please try again later.');
    } finally {
      setIsLoading(false)
    }
  }, [openModal, newsletterGroupId, topicName, fetchNewsletterGroup])

  const disabled = isLoading || isNewsletterSent || isDraft

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
            : isDraft
              ? 'Publish page to send newsletter'
              : 'Send newsletter'
        }
      </Button>

      <ConfirmationModal
        onConfirm={handleSendNewsletter}
        heading="Send Newsletter"
        body={modalMessage}
        modalSlug={sendNewsletterModalSlug}
      />
    </>
  )
} 