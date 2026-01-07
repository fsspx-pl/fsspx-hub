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
        bg-white dark:bg-[#3C3F41]
        text-gray-900 dark:text-[#CCCCCC]
        border border-gray-300 dark:border-gray-600
        rounded-md
        focus:outline-none focus:ring-2 
        focus:ring-gray-200 dark:focus:ring-gray-700
        focus:border-gray-400 dark:focus:border-gray-500
        disabled:bg-gray-100 dark:disabled:bg-gray-800
        disabled:text-gray-400 dark:disabled:text-gray-500
        disabled:cursor-not-allowed
        placeholder:text-gray-400 dark:placeholder:text-[#A9B7C6]
        transition-colors
        ${className}
      `}
    />
  );
};

