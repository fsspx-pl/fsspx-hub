import React from 'react';

type AlertVariant = 'success' | 'error';

type AlertProps = {
  variant: AlertVariant;
  title: string;
  message: string;
  className?: string;
};

/**
 * Alert component for displaying success or error messages
 */
export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  className = '',
}) => {
  const isSuccess = variant === 'success';
  
  const containerClasses = isSuccess
    ? 'bg-[var(--alert-success-bg)] border border-[var(--alert-success-border)]'
    : 'bg-[var(--alert-error-bg)] border border-[var(--alert-error-border)]';
  
  const iconColor = isSuccess ? 'text-[var(--alert-success-text)]' : 'text-[var(--alert-error-text)]';
  const titleColor = isSuccess ? 'text-[var(--alert-success-text)]' : 'text-[var(--alert-error-text)]';
  const messageColor = isSuccess ? 'text-[var(--text-secondary)]' : 'text-[var(--alert-error-text)]';

  const SuccessIcon = () => (
    <svg
      className={`h-5 w-5 ${iconColor}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );

  const ErrorIcon = () => (
    <svg
      className={`h-5 w-5 ${iconColor}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className={`${containerClasses} rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
        </div>
        <div className="ml-3">
          <h3 className={`font-medium ${titleColor}`}>
            {title}
          </h3>
          <div className={`mt-2 ${messageColor}`}>
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

