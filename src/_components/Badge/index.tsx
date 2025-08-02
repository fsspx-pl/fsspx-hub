import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const Badge: React.FC<Props> = ({
  children,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center px-4 py-1 rounded-full text-sm bg-[#e9c9c9] text-[#C81910] ${className}`}>
      {children}
    </span>
  );
}; 