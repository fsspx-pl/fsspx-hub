'use client';

import React, { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button } from '@/_components/Button';
import { Alert } from '@/_components/Alert';
import { Input } from '@/_components/Input';
import { Event, Form as FormType } from '@/payload-types';

type EventSignupFormProps = {
  event: Event;
  form: FormType;
  className?: string;
  locale?: 'pl' | 'en';
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

const translations = {
  pl: {
    title: 'Zapisz się na wydarzenie',
    submitButton: 'Wyślij',
    submittingButton: 'Wysyłanie...',
    successTitle: 'Dziękujemy!',
    successMessage: (event: Event) => event.requiresOptIn
      ? 'Twoje zgłoszenie zostało wysłane. Sprawdź swoją skrzynkę email, aby potwierdzić zapis.'
      : 'Twoje zgłoszenie zostało pomyślnie wysłane.',
    errorTitle: 'Błąd',
    errorMessage: 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.',
    verificationRequired: 'Proszę ukończyć weryfikację Turnstile.',
  },
  en: {
    title: 'Sign up for event',
    submitButton: 'Submit',
    submittingButton: 'Submitting...',
    successTitle: 'Thank you!',
    successMessage: (event: Event) => event.requiresOptIn
      ? 'Your submission has been sent. Please check your email to confirm your signup.'
      : 'Your submission has been successfully sent.',
    errorTitle: 'Error',
    errorMessage: 'An error occurred while submitting the form. Please try again.',
    verificationRequired: 'Please complete Turnstile verification.',
  },
};

export const EventSignupForm: React.FC<EventSignupFormProps> = ({
  event,
  form,
  className = '',
  locale = 'pl',
}) => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<any[]>([]);

  const t = translations[locale];

  useEffect(() => {
    if (form?.fields) {
      setFormFields(form.fields as any[]);
    }
  }, [form]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (event.requiresTurnstile === true && !turnstileToken && process.env.NODE_ENV !== 'development') {
      setErrorMessage(t.verificationRequired);
      setFormState('error');
      return;
    }

    setFormState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: typeof form.id === 'string' ? form.id : form.id,
          submissionData: formData,
          turnstileToken: turnstileToken || (process.env.NODE_ENV === 'development' ? 'dev-bypass' : null),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.errorMessage);
      }

      setFormState('success');
      setFormData({});
      setTurnstileToken(null);
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t.errorMessage
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
      setErrorMessage(t.verificationRequired);
    }
  };

  const renderField = (field: any) => {
    const fieldName = field.name || field.blockName;
    const fieldLabel = field.label || fieldName;
    const isRequired = field.required || false;
    const fieldWidth = field.width || 100;
    const widthStyle = fieldWidth === 100 ? {} : { width: `${fieldWidth}%` };
    const widthClass = fieldWidth === 100 ? 'w-full' : '';

    switch (field.blockType) {
      case 'text':
        return (
          <div key={field.id || fieldName} className={`space-y-2 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
              {fieldLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              id={fieldName}
              type="text"
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              required={isRequired}
              disabled={formState === 'loading'}
              aria-label={fieldLabel}
            />
          </div>
        );

      case 'email':
        return (
          <div key={field.id || fieldName} className={`space-y-2 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
              {fieldLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              id={fieldName}
              type="email"
              required={isRequired}
              value={formData[fieldName] || ''}
              onChange={e => handleFieldChange(fieldName, e.target.value)}
              disabled={formState === 'loading'}
              aria-label={fieldLabel}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id || fieldName} className={`space-y-2 ${widthClass}`} style={widthStyle}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
              {fieldLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              id={fieldName}
              name={fieldName}
              required={isRequired}
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              disabled={formState === 'loading'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C81910] focus:border-[#C81910]"
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id || fieldName} className={`space-y-2 ${widthClass}`} style={widthStyle}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
              {fieldLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={fieldName}
              name={fieldName}
              required={isRequired}
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              disabled={formState === 'loading'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C81910] focus:border-[#C81910]"
            >
              <option value="">Wybierz...</option>
              {field.options?.map((option: any) => (
                <option key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'date':
        return (
          <div key={field.id || fieldName} className={`space-y-2 ${widthClass}`} style={widthStyle}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700">
              {fieldLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              id={fieldName}
              name={fieldName}
              required={isRequired}
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              disabled={formState === 'loading'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C81910] focus:border-[#C81910]"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (formState === 'success') {
    return (
      <Alert
        variant="success"
        title={t.successTitle}
        message={t.successMessage(event)}
        className={className}
      />
    );
  }

  // Group fields into rows based on width
  const groupFieldsIntoRows = (fields: any[]) => {
    const rows: any[][] = [];
    let currentRow: any[] = [];
    let currentRowWidth = 0;

    fields.forEach((field) => {
      const fieldWidth = field.width || 100;
      
      if (currentRowWidth + fieldWidth > 100 && currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [field];
        currentRowWidth = fieldWidth;
      } else {
        currentRow.push(field);
        currentRowWidth += fieldWidth;
      }
    });

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    return rows;
  };

  const fieldRows = groupFieldsIntoRows(formFields);

  return (
    <div className={`bg-[#f8f7f7] rounded-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fieldRows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {row.map((field) => renderField(field))}
          </div>
        ))}

        {event.requiresTurnstile === true && process.env.NODE_ENV !== 'development' && (
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

        <Button
          type="submit"
          variant="primary"
          disabled={formState === 'loading' || (event.requiresTurnstile === true && !turnstileToken && process.env.NODE_ENV !== 'development')}
          className="w-full"
        >
          {formState === 'loading' ? t.submittingButton : t.submitButton}
        </Button>

        {formState === 'error' && errorMessage && (
          <Alert
            variant="error"
            title={t.errorTitle}
            message={errorMessage}
          />
        )}
      </form>
    </div>
  );
};

