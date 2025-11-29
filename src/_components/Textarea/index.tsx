import React from 'react';

type TextareaProps = {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
  'aria-label'?: string;
};

/**
 * Atomic Textarea component matching Input styles
 */
export const Textarea: React.FC<TextareaProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  'aria-label': ariaLabel,
}) => {
  return (
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      rows={rows}
      className={`
        w-full px-4 py-2 
        border border-gray-300 
        rounded-md
        focus:outline-none focus:ring-2 
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-colors
        ${className || 'focus:ring-gray-200 focus:border-gray-400'}
      `}
    />
  );
};


