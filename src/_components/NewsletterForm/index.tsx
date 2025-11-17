'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Input } from '@/_components/Input';
import { Button } from '@/_components/Button';
import { Alert } from '@/_components/Alert';
import { garamond } from '@/fonts';
import { getNewsletterTranslation } from './translations';

type NewsletterFormMode = 'subscribe' | 'unsubscribe';

type SubscribeProps = {
  mode: 'subscribe';
  subdomain: string;
  className?: string;
  locale?: 'pl' | 'en';
};

type UnsubscribeProps = {
  mode: 'unsubscribe';
  subscriptionId: string;
  email: string;
  topicName: string;
  subdomain: string;
  className?: string;
  locale?: 'pl' | 'en';
};

type Props = SubscribeProps | UnsubscribeProps;

type FormState = 'idle' | 'loading' | 'success' | 'error';

export const NewsletterForm: React.FC<Props> = (props) => {
  const { mode, className = '', locale = 'pl' } = props;
  const [email, setEmail] = useState(mode === 'unsubscribe' ? props.email : '');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const t = (key: Parameters<typeof getNewsletterTranslation>[0]) => 
    getNewsletterTranslation(key, locale, mode);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode !== 'subscribe') return;

    if (!email.trim()) {
      setErrorMessage(t('errorEmailRequired'));
      setFormState('error');
      return;
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    
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
          subdomain: props.subdomain,
          turnstileToken: turnstileToken || 'dev-bypass',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorSubscriptionFailed'));
      }

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

  const handleUnsubscribe = async () => {
    if (mode !== 'unsubscribe') return;

    setFormState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: props.subscriptionId,
          email: props.email,
          subdomain: props.subdomain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errorUnsubscribeFailed'));
      }

      setFormState('success');
      
      setTimeout(() => {
        window.location.href = `/${props.subdomain}/newsletter/unsubscribe/${props.subscriptionId}?success=true`;
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
    if (mode === 'subscribe') {
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

  if (mode === 'subscribe') {
    return (
      <div className={`bg-[#f8f7f7] rounded-lg p-6 ${className}`}>
        <h3 className={`text-lg font-medium text-gray-900 mb-2`}>
          {t('title')}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t('description')}
        </p>

        <form onSubmit={handleSubscribe} className="space-y-4">
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
  }

  return (
    <div className={`bg-[#f8f7f7] rounded-lg p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h3 className={`text-xl font-semibold text-gray-900 mb-4`}>
            {t('unsubscribeInfoTitle')}
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('emailLabel')}</dt>
              <dd className="mt-1 text-sm text-gray-900">{props.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('topicLabel')}</dt>
              <dd className="mt-1 text-sm text-gray-900 font-medium">{props.topicName}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>{t('warningLabel')}:</strong> {t('unsubscribeWarning')} <strong>{props.topicName}</strong>.
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

