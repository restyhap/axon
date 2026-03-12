import React from 'react';

interface ButtonProps {
  variant?: 'active' | 'inactive';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'inactive',
  children,
  onClick,
  className = ''
}) => {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center';
  const variantClasses = variant === 'active'
    ? 'bg-accent text-accent-text'
    : 'bg-bg-tertiary text-text-secondary border border-border';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </button>
  );
};
