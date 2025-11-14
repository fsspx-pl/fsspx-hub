import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'default';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
};

/**
 * Atomic Button component with variant support
 */
export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'default',
  disabled = false,
  onClick,
  children,
  className = '',
  'aria-label': ariaLabel,
}) => {
  const baseClasses = `
    px-6
    py-2
    rounded-md
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed 
    transition-colors
    whitespace-nowrap
  `;

  const variantClasses = {
    primary: `
      bg-[#C81910] text-white 
      hover:bg-[#A0140D] 
      focus:ring-[#C81910]
    `,
    secondary: `
      bg-gray-200 text-gray-900 
      hover:bg-gray-300 
      focus:ring-gray-500
    `,
    default: `
      bg-white text-gray-900 border border-gray-300 
      hover:bg-gray-50 
      focus:ring-gray-500
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

