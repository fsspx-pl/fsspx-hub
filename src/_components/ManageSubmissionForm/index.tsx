'use client';

import React, { useState } from 'react';
import { Button } from '@/_components/Button';
import { Alert } from '@/_components/Alert';
import { Event } from '@/payload-types';

type ManageSubmissionFormProps = {
  submission: any;
  event: Event;
  token: string;
};

type FormState = 'idle' | 'loading' | 'success' | 'error';

export const ManageSubmissionForm: React.FC<ManageSubmissionFormProps> = ({
  submission,
  event,
  token,
}) => {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCancel = async () => {
    if (!confirm('Czy na pewno chcesz anulować zgłoszenie? Ta operacja jest nieodwracalna.')) {
      return;
    }

    setFormState('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/events/submissions/${token}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Wystąpił błąd podczas anulowania zgłoszenia.');
      }

      setFormState('success');
      setSuccessMessage('Twoje zgłoszenie zostało pomyślnie anulowane.');
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas anulowania zgłoszenia.'
      );
    }
  };

  const handleUpdate = async (updatedData: Record<string, any>) => {
    setFormState('loading');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/events/submissions/${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionData: updatedData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Wystąpił błąd podczas aktualizacji zgłoszenia.');
      }

      setFormState('success');
      setSuccessMessage('Twoje zgłoszenie zostało pomyślnie zaktualizowane.');
    } catch (error) {
      setFormState('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Wystąpił błąd podczas aktualizacji zgłoszenia.'
      );
    }
  };

  const submissionData = submission.submissionData || {};

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Szczegóły zgłoszenia
        </h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-500">Status: </span>
            <span className={`text-sm font-semibold ${
              submission.status === 'confirmed' ? 'text-green-600' :
              submission.status === 'cancelled' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {submission.status === 'confirmed' ? 'Potwierdzone' :
               submission.status === 'cancelled' ? 'Anulowane' :
               'Oczekujące'}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Wydarzenie: </span>
            <span className="text-sm text-gray-900">{event.title}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Dane zgłoszenia:</h3>
            <dl className="space-y-2">
              {Object.entries(submissionData).map(([key, value]) => (
                <div key={key} className="flex">
                  <dt className="text-sm font-medium text-gray-500 w-1/3 capitalize">
                    {key}:
                  </dt>
                  <dd className="text-sm text-gray-900 flex-1">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {submission.status !== 'cancelled' && (
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={formState === 'loading'}
          >
            Anuluj zgłoszenie
          </Button>
        </div>
      )}

      {formState === 'success' && successMessage && (
        <Alert
          variant="success"
          title="Sukces"
          message={successMessage}
        />
      )}

      {formState === 'error' && errorMessage && (
        <Alert
          variant="error"
          title="Błąd"
          message={errorMessage}
        />
      )}
    </div>
  );
};

