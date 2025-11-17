'use client';

import { useState } from 'react';
import { Button } from '../Button';
import { garamond } from '@/fonts';
import { getNewsletterTranslation } from '../Newsletter/translations';

interface UnsubscribeFormProps {
  subscriptionId: string;
  email: string;
  topicName: string;
  subdomain: string;
  className?: string;
  locale?: 'pl' | 'en';
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export const UnsubscribeForm: React.FC<UnsubscribeFormProps> = ({
  subscriptionId,
  email,
  topicName,
  subdomain,
  className = '',
  locale = 'pl',
}) => {
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
        window.location.href = `/${subdomain}/newsletter/unsubscribe/${subscriptionId}?success=true`;
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
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-lg text-gray-700 mb-4">
          {t('unsubscribeSuccessMessage')}
        </p>
        <p className="text-sm text-gray-500">
          {t('redirecting')}
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-[#f8f7f7] rounded-lg p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h3 className={`text-xl font-semibold text-gray-900 mb-4 ${garamond.className}`}>
            {t('unsubscribeInfoTitle')}
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('emailLabel')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('topicLabel')}</dt>
              <dd className="mt-1 text-sm text-gray-900 font-medium">{topicName}</dd>
            </div>
          </dl>
        </div>

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
    </div>
  );
};
