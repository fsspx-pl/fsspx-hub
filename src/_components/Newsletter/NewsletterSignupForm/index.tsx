'use client';

import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Input } from '@/_components/Input';
import { Button } from '@/_components/Button';
import { Alert } from '@/_components/Alert';
import { getNewsletterTranslation } from '../translations';

type Props = {
  subdomain: string;
  className?: string;
  locale?: 'pl' | 'en';
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

export const NewsletterSignupForm: React.FC<Props> = ({
  subdomain,
  className = '',
  locale = 'pl',
}) => {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
    getNewsletterTranslation(key, locale, 'subscribe');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage(t('errorEmailRequired'));
      setFormState('error');
      return;
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In production, require Turnstile token; in development, skip
    if (!isDevelopment && !turnstileToken) {
      setErrorMessage(t('errorVerificationRequired'));
      setFormState('error');
      return;
    }

    setFormState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          subdomain,
          turnstileToken: turnstileToken || 'dev-bypass',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorSubscriptionFailed'));
      }

      // If already exists, redirect to branded page
      if (data.alreadyExists && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      setFormState('success');
      setEmail('');
      setTurnstileToken(null);
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('errorGeneric')
      );
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
  };

  const handleTurnstileError = () => {
    setTurnstileToken(null);
    if (formState === 'loading') {
      setFormState('error');
      setErrorMessage(t('errorVerificationFailed'));
    }
  };

  if (formState === 'success') {
    return (
      <Alert
        variant="success"
        title={t('successTitle')}
        message={t('successMessage')}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-[#f8f7f7] rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t('title')}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {t('description')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              {t('emailLabel')}
            </label>
            <Input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              required
              disabled={formState === 'loading'}
              aria-label={t('emailLabel')}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={formState === 'loading' || (process.env.NODE_ENV !== 'development' && !turnstileToken)}
            className="w-full sm:w-auto"
          >
            {formState === 'loading' ? t('submittingButton') : t('submitButton')}
          </Button>
        </div>

        {process.env.NODE_ENV !== 'development' && (
          <div>
            <label className="text-sm text-gray-400 mb-4">
              {t('turnstileLabel')}
            </label>
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
              onSuccess={handleTurnstileSuccess}
              onError={handleTurnstileError}
              onExpire={() => setTurnstileToken(null)}
              options={{
                theme: 'light',
                size: 'normal',
              }}
            />
          </div>
        )}

        {formState === 'error' && errorMessage && (
          <Alert
            variant="error"
            title={t('errorSubscriptionFailed')}
            message={errorMessage}
          />
        )}
      </form>
    </div>
  );
};

