'use client';

import React, { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

type Props = {
  subdomain: string;
  className?: string;
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

export const NewsletterSignupForm: React.FC<Props> = ({
  subdomain,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Proszę podać adres email');
      setFormState('error');
      return;
    }

    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // In production, require Turnstile token; in development, skip
    if (!isDevelopment && !turnstileToken) {
      setErrorMessage('Proszę poczekać na weryfikację');
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
        throw new Error(data.error || 'Wystąpił błąd podczas subskrypcji');
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
          : 'Wystąpił błąd podczas subskrypcji. Spróbuj ponownie później.'
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
      setErrorMessage('Weryfikacja nie powiodła się. Spróbuj ponownie.');
    }
  };

  if (formState === 'success') {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Dziękujemy za subskrypcję!
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Sprawdź swoją skrzynkę pocztową i potwierdź subskrypcję, klikając
                link w wiadomości email.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Zapisz się do newslettera
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Otrzymuj najnowsze ogłoszenia duszpasterskie na swoją skrzynkę pocztową.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="newsletter-email" className="sr-only">
              Adres email
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              required
              disabled={formState === 'loading'}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#C81910] focus:border-[#C81910] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={formState === 'loading' || (process.env.NODE_ENV !== 'development' && !turnstileToken)}
            className="px-6 py-2 bg-[#C81910] text-white font-medium rounded-md hover:bg-[#A0140D] focus:outline-none focus:ring-2 focus:ring-[#C81910] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {formState === 'loading' ? 'Wysyłanie...' : 'Zapisz się'}
          </button>
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
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}
      </form>
    </div>
  );
};

