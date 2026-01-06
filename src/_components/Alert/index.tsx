import React from 'react';

type AlertVariant = 'success' | 'error' | 'info';

type AlertProps = {
  variant: AlertVariant;
  title: string;
  message?: string;
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
  const isInfo = variant === 'info';
  
  const containerClasses = isSuccess
    ? 'bg-green-50 border border-green-200'
    : isInfo
    ? 'bg-[#f8f7f7]'
    : 'bg-red-50 border border-red-200';
  
  const iconColor = isSuccess ? 'text-green-400' : isInfo ? 'text-gray-600' : 'text-red-400';
  const titleColor = isSuccess ? 'text-green-800' : isInfo ? 'text-gray-700' : 'text-red-800';
  const messageColor = isSuccess ? 'text-green-700' : isInfo ? 'text-gray-600' : 'text-red-800';

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

  const InfoIcon = () => (
    <svg
      className={`h-5 w-5 ${iconColor}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );

  const hasMessage = message && message.trim().length > 0;
  const paddingClass = hasMessage ? 'p-6' : 'px-4 py-4';
  
  return (
    <div className={`${containerClasses} rounded-lg ${paddingClass} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isSuccess ? <SuccessIcon /> : isInfo ? <InfoIcon /> : <ErrorIcon />}
        </div>
        <div className="ml-3">
          <h3 className={`font-medium ${titleColor} ${hasMessage ? '' : 'leading-tight'}`}>
            {title}
          </h3>
          {hasMessage && (
            <div className={`mt-2 ${messageColor}`}>
              <p>{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

