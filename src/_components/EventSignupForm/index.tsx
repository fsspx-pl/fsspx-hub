'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/_components/Button';
import { Alert } from '@/_components/Alert';
import { Input } from '@/_components/Input';
import { Textarea } from '@/_components/Textarea';
import { Checkbox } from '@/_components/Checkbox';
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
    successMessage: 'Twoje zgłoszenie zostało pomyślnie wysłane.',
    errorTitle: 'Błąd',
    errorMessage: 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.',
  },
  en: {
    title: 'Sign up for event',
    submitButton: 'Submit',
    submittingButton: 'Submitting...',
    successTitle: 'Thank you!',
    successMessage: 'Your submission has been successfully sent.',
    errorTitle: 'Error',
    errorMessage: 'An error occurred while submitting the form. Please try again.',
  },
};

const getFieldWidthClass = (width?: number | null): string => {
  const normalized = typeof width === 'number' ? width : undefined;
  if (!normalized) return 'md:col-span-12';
  if (normalized >= 100) return 'md:col-span-12';
  if (normalized >= 75) return 'md:col-span-9';
  if (normalized >= 66) return 'md:col-span-8';
  if (normalized >= 50) return 'md:col-span-6';
  if (normalized >= 33) return 'md:col-span-4';
  if (normalized >= 25) return 'md:col-span-3';
  return 'md:col-span-12';
};

export const EventSignupForm: React.FC<EventSignupFormProps> = ({
  event,
  form,
  className = '',
  locale = 'pl',
}) => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
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
    
    console.log('Form submit triggered', { formData, formId: form.id });

    setFormState('loading');
    setErrorMessage('');

    try {
      // Extract form ID - handle both string and object formats
      let formId: string;
      if (typeof form.id === 'string') {
        formId = form.id;
      } else if (typeof form.id === 'object' && form.id !== null && 'id' in form.id) {
        formId = String((form.id as { id: string | number }).id);
      } else {
        formId = String(form.id);
      }
      
      // Validate required fields before submission
      const requiredFields = formFields.filter((field: any) => field.required);
      const missingFields = requiredFields.filter((field: any) => {
        const fieldName = field.name || field.blockName;
        const value = formData[fieldName];
        return value === undefined || value === null || value === '';
      });

      if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map((f: any) => f.label || f.name || f.blockName).join(', ');
        setErrorMessage(`Proszę wypełnić wymagane pola: ${missingFieldNames}`);
        setFormState('error');
        return;
      }

      // Transform formData to Payload's expected format: array of { field, value } objects
      const dataToSend = Object.entries(formData).map(([name, value]) => ({
        field: name,
        value: value !== null && value !== undefined ? String(value) : '',
      }));

      const response = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: formId,
          submissionData: dataToSend,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        const text = await response.text();
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.message || t.errorMessage);
      }

      setFormState('success');
      setFormData({});
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t.errorMessage
      );
    }
  };

  const renderField = (field: any) => {
    const fieldName = field.name || field.blockName;
    const fieldLabel = field.label || fieldName;
    const isRequired = field.required || false;
    const widthClass = getFieldWidthClass(field.width);

    switch (field.blockType) {
      case 'number':
        return (
          <div key={field.id || fieldName} className={`space-y-2 col-span-12 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-[var(--text-primary)]">
              {fieldLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Input
              id={fieldName}
              type="text"
              value={formData[fieldName] ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                handleFieldChange(fieldName, value === '' ? '' : Number(value));
              }}
              required={isRequired}
              disabled={formState === 'loading'}
              aria-label={fieldLabel}
            />
          </div>
        );

      case 'checkbox':
        return (
          <div
            key={field.id || fieldName}
            className={`col-span-12 ${widthClass}`}
          >
            <Checkbox
              id={fieldName}
              checked={Boolean(formData[fieldName])}
              onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
              disabled={formState === 'loading'}
              label={fieldLabel}
              required={isRequired}
            />
          </div>
        );

      case 'text':
        return (
          <div key={field.id || fieldName} className={`space-y-2 col-span-12 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-[var(--text-primary)]">
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
          <div key={field.id || fieldName} className={`space-y-2 col-span-12 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-[var(--text-primary)]">
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
          <div key={field.id || fieldName} className={`space-y-2 col-span-12 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-[var(--text-primary)]">
              {fieldLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <Textarea
              id={fieldName}
              value={formData[fieldName] || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              required={isRequired}
              disabled={formState === 'loading'}
              rows={4}
              aria-label={fieldLabel}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id || fieldName} className={`space-y-2 col-span-12 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-[var(--text-primary)]">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--bg-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
            >
              <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Wybierz...</option>
              {field.options?.map((option: any) => (
                <option key={option.value || option} value={option.value || option} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                  {option.label || option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'date':
        return (
          <div key={field.id || fieldName} className={`space-y-2 col-span-12 ${widthClass}`}>
            <label htmlFor={fieldName} className="block text-sm font-medium text-[var(--text-primary)]">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-[var(--bg-secondary)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
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
        message={t.successMessage}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-[var(--bg-secondary)] rounded-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {formFields.map((field) => renderField(field))}
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={formState === 'loading'}
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

