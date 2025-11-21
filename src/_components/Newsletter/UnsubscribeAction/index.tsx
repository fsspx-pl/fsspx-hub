'use client';

import { useState } from 'react';
import { Button } from '@/_components/Button';
import { getNewsletterTranslation } from '../translations';

interface UnsubscribeActionProps {
  subscriptionId: string;
  email: string;
  topicName: string;
  subdomain: string;
  locale?: 'pl' | 'en';
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function UnsubscribeAction({
  subscriptionId,
  email,
  topicName,
  subdomain,
  locale = 'pl',
}: UnsubscribeActionProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
    getNewsletterTranslation(key, locale, 'unsubscribe');

  const handleUnsubscribe = async () => {
    setFormState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          email,
          subdomain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorUnsubscribeFailed'));
      }

      setFormState('success');
      
      setTimeout(() => {
        window.location.href = `/newsletter/unsubscribe/${subscriptionId}?success=true`;
      }, 1500);
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('errorUnsubscribeGeneric')
      );
    }
  };

  if (formState === 'success') {
    return null; // Success state is handled by parent NewsletterStatusPage
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>{t('warningLabel')}:</strong> {t('unsubscribeWarning')} <strong>{topicName}</strong>.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          type="button"
          variant="primary"
          onClick={handleUnsubscribe}
          disabled={formState === 'loading'}
          aria-label={t('unsubscribeButton')}
        >
          {formState === 'loading' ? t('unsubscribingButton') : t('unsubscribeButton')}
        </Button>
      </div>
    </div>
  );
}

