import React from 'react';
import Link from 'next/link';

type ButtonVariant = 'primary' | 'secondary' | 'default';

type ButtonProps = {
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  href?: string;
};

/**
 * Atomic Button component with variant support
 * Can render as a button or a Link when href is provided
 */
export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'default',
  disabled = false,
  onClick,
  children,
  className = '',
  'aria-label': ariaLabel,
  href,
}) => {
  const baseClasses = [
    'inline-block',
    'px-6',
    'py-2',
    'rounded-md',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'transition-colors',
    'whitespace-nowrap',
    'text-center',
  ];

  const variantClasses = {
    primary: [
      'bg-[#C81910]',
      'text-white',
      'hover:bg-[#A0140D]',
      'focus:ring-[#C81910]',
    ],
    secondary: [
      'bg-gray-200',
      'text-gray-900',
      'hover:bg-gray-300',
      'focus:ring-gray-500',
    ],
    default: [
      'bg-white',
      'text-gray-900',
      'border',
      'border-gray-300',
      'hover:bg-gray-50',
      'focus:ring-gray-500',
    ],
  };

  const combinedClassName = [
    ...baseClasses,
    ...variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Render as Link if href is provided and not disabled
  if (href && !disabled) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        className={combinedClassName}
        prefetch={false}
      >
        {children}
      </Link>
    );
  }

  // If href is provided but disabled, render as span with button styling
  if (href && disabled) {
    return (
      <span
        aria-label={ariaLabel}
        aria-disabled="true"
        className={combinedClassName}
      >
        {children}
      </span>
    );
  }

  // Render as button
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={combinedClassName}
    >
      {children}
    </button>
  );
};

