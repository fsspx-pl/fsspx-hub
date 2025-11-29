import React from 'react';

type CheckboxProps = {
  id?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<InputElement>) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

type InputElement = HTMLInputElement;

/**
 * Atomic Checkbox component with primary-colored check and rounded shape
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  required = false,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`inline-flex items-center gap-2 text-sm text-gray-700 ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 rounded-md border-gray-300 accent-[#C81910] focus:ring-[#C81910] disabled:cursor-not-allowed"
      />
      {label && (
        <span>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}
    </label>
  );
};


