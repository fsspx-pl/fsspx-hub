import React from 'react';

type InputProps = {
  id?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
};

/**
 * Atomic Input component for form fields
 */
export const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
}) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        w-full px-4 py-2 
        border border-gray-300 
        rounded-md
        focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 
        disabled:bg-gray-100 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    />
  );
};

