'use client'

import React, { useState, useCallback } from 'react'
import { Button, ConfirmationModal, toast, useModal } from '@payloadcms/ui'
import classes from './index.module.scss'

const sendNewsletterModalSlug = 'send-newsletter-confirmation'

export const SendButton: React.FC<{ id: string, campaignId?: string | null, isDraft: boolean, newsletterGroupId: string }> = ({
  id,
  campaignId,
  isDraft,
  newsletterGroupId
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

  const fetchNewsletterGroup = useCallback(async (groupId: string) => {
    const response = await fetch(`/api/newsletter-group/${groupId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch newsletter group');
    }
    return response.json();
  }, []);

  const openConfirmModal = useCallback(async () => {
    setIsLoading(true)
    try {
      const newsletterGroup = await fetchNewsletterGroup(newsletterGroupId);
      setModalMessage(`The newsletter will be sent to the group: "${newsletterGroup.title}" with ${newsletterGroup.subscribersCount} subscribers. This action cannot be undone.`);
      openModal(sendNewsletterModalSlug)
    } catch (error) {
      toast.error('Failed to fetch newsletter group information. Please try again later.');
    } finally {
      setIsLoading(false)
    }
  }, [openModal, newsletterGroupId, fetchNewsletterGroup])

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