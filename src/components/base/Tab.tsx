import React from 'react';

interface TabProps {
  variant?: 'active' | 'inactive';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({
  variant = 'inactive',
  children,
  onClick,
  className = ''
}) => {
  const baseClasses = 'px-4 py-2 text-sm flex items-center justify-center cursor-pointer';
  const variantClasses = variant === 'active'
    ? 'text-text font-medium border-b-2 border-accent'
    : 'text-text-muted';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {children}
    </div>
  );
};
